Can you create a comprehensive documentation for this implementation and include how to write test for each module.

# Dynamic Workflow Runner: Comprehensive Documentation & Testing Guide

## 1. System Overview

The Dynamic Workflow Runner is a **configuration-driven orchestration system** designed to execute multi-step data processing workflows with support for multiple model types, dynamic pre/post processing, and hierarchical YAML configurations[1][2]. The system follows the **Template Method pattern** for execution flow and incorporates multiple design patterns including Factory, Strategy, and Observer patterns[1][3].

## 2. Architecture Documentation

### 2.1 Core Components

| Component | Design Pattern | Primary Responsibility |
|-----------|---------------|------------------------|
| **WorkflowRunner** | Template Method | CLI entry point and execution orchestration |
| **ConfigurationManager** | Builder + Singleton | YAML inheritance resolution and configuration loading |
| **StepFactory** | Factory | Dynamic step instance creation based on configuration |
| **WorkflowExecutor** | Chain of Responsibility | Sequential step execution with data flow management |
| **StepRegistry** | Registry | Step type discovery and registration |
| **ModelManager** | Strategy + Factory | Multi-model type handling (XGBoost, sklearn, etc.) |
| **DataContextManager** | Context | Snowpark session and inter-step data management |

### 2.2 Module Structure

```
workflow_runner/
├── __init__.py
├── config/
│   ├── __init__.py
│   ├── manager.py          # Configuration management with YAML inheritance
│   └── validator.py        # Configuration validation
├── steps/
│   ├── __init__.py
│   ├── base.py            # Abstract base classes
│   ├── factory.py         # Step factory and registry
│   ├── snowpark_steps.py  # Snowpark-specific steps
│   ├── model_steps.py     # Model inference steps
│   └── io_steps.py        # I/O operations (FTP, S3, etc.)
├── models/
│   ├── __init__.py
│   ├── manager.py         # Model loading and caching
│   └── loaders.py         # Model-specific loaders
├── context/
│   ├── __init__.py
│   └── manager.py         # Data context and session management
├── utils/
│   ├── __init__.py
│   ├── logging.py         # Logging utilities
│   └── decorators.py      # Common decorators
└── main.py                # CLI entry point
```

## 3. Configuration System Documentation

### 3.1 YAML Inheritance Hierarchy

The configuration system uses a **three-tier inheritance structure**[2]:

1. **Base Configuration** (`configs/base/auth.yaml`): Authentication and common settings
2. **Default Workflow Templates** (`configs/base/default_*.yaml`): Reusable workflow patterns
3. **Product-Specific Configurations** (`configs/workflows/*.yaml`): Actual workflow implementations

### 3.2 Configuration Loading Process

```python
# config/manager.py
class ConfigurationManager(metaclass=SingletonMeta):
    """Manages hierarchical YAML configuration with inheritance support."""
    
    def load_workflow_config(self, workflow_name: str, partition_date: str) -> WorkflowConfig:
        """
        Load and resolve workflow configuration with inheritance.
        
        Args:
            workflow_name: Name of the workflow configuration file
            partition_date: Date partition for processing
            
        Returns:
            Resolved WorkflowConfig object
            
        Raises:
            ConfigurationError: If configuration is invalid or missing
        """
        config_path = self.config_root / "workflows" / f"{workflow_name}.yaml"
        
        # Resolve inheritance chain
        resolved_config = self._resolve_inheritance(config_path)
        
        # Substitute environment variables and templates
        resolved_config = self._substitute_variables(resolved_config, partition_date)
        
        # Validate configuration
        self._validate_config(resolved_config)
        
        return self._build_workflow_config(resolved_config, partition_date)
```

### 3.3 Configuration Validation

```python
# config/validator.py
class ConfigurationValidator:
    """Validates workflow configurations against schema."""
    
    def validate_workflow_config(self, config: Dict[str, Any]) -> None:
        """
        Validate workflow configuration structure and content.
        
        Args:
            config: Configuration dictionary to validate
            
        Raises:
            ValidationError: If configuration is invalid
        """
        # Validate required top-level keys
        required_keys = ['workflow', 'snowpark']
        self._validate_required_keys(config, required_keys)
        
        # Validate workflow structure
        self._validate_workflow_structure(config['workflow'])
        
        # Validate step configurations
        for step_config in config['workflow']['steps']:
            self._validate_step_config(step_config)
```

## 4. Step System Documentation

### 4.1 Abstract Base Classes

```python
# steps/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

@dataclass
class StepConfig:
    """Configuration for a workflow step."""
    name: str
    type: str
    config: Dict[str, Any]
    depends_on: Optional[List[str]] = None
    timeout: Optional[int] = None
    retry_count: Optional[int] = 3

@dataclass
class StepResult:
    """Result of step execution."""
    success: bool
    data: Any = None
    metadata: Dict[str, Any] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None

class WorkflowStep(ABC):
    """Abstract base class for all workflow steps."""
    
    @abstractmethod
    async def execute(self, context: DataContext, config: StepConfig) -> StepResult:
        """
        Execute the step with given context and configuration.
        
        Args:
            context: Data context containing session and data store
            config: Step-specific configuration
            
        Returns:
            StepResult containing execution outcome
        """
        pass
    
    @abstractmethod
    def validate_config(self, config: StepConfig) -> None:
        """
        Validate step-specific configuration.
        
        Args:
            config: Step configuration to validate
            
        Raises:
            ValidationError: If configuration is invalid
        """
        pass
    
    def get_required_config_keys(self) -> List[str]:
        """Return list of required configuration keys."""
        return []
    
    def get_optional_config_keys(self) -> List[str]:
        """Return list of optional configuration keys."""
        return []
```

### 4.2 Concrete Step Implementations

```python
# steps/snowpark_steps.py
class SnowparkQueryStep(WorkflowStep):
    """Execute Snowpark SQL query and store results."""
    
    def get_required_config_keys(self) -> List[str]:
        return ['query_template', 'output_name']
    
    def get_optional_config_keys(self) -> List[str]:
        return ['query_parameters', 'chunk_size', 'timeout']
    
    async def execute(self, context: DataContext, config: StepConfig) -> StepResult:
        """
        Execute SQL query using Snowpark session.
        
        Args:
            context: Data context with Snowpark session
            config: Step configuration containing query and parameters
            
        Returns:
            StepResult with query execution outcome
        """
        start_time = time.time()
        
        try:
            query = config.config['query_template']
            output_name = config.config['output_name']
            parameters = config.config.get('query_parameters', {})
            
            # Execute query with parameters
            df = context.session.sql(query, parameters)
            
            # Store result in context
            context.store_data(output_name, df, {
                'row_count': df.count(),
                'columns': df.columns,
                'query': query
            })
            
            execution_time = time.time() - start_time
            
            return StepResult(
                success=True,
                metadata={
                    'execution_time': execution_time,
                    'row_count': df.count(),
                    'columns': df.columns
                }
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            return StepResult(
                success=False,
                error=str(e),
                execution_time=execution_time
            )
```

## 5. Model System Documentation

### 5.1 Model Manager Architecture

```python
# models/manager.py
class ModelManager:
    """Manages model loading, caching, and inference across different types."""
    
    def __init__(self):
        self._loaders: Dict[str, ModelLoader] = {}
        self._models: Dict[str, Tuple[Any, ModelLoader]] = {}
        self._register_default_loaders()
    
    def register_loader(self, model_type: str, loader: ModelLoader) -> None:
        """
        Register a new model loader.
        
        Args:
            model_type: Type identifier for the model
            loader: ModelLoader instance to handle this type
        """
        self._loaders[model_type] = loader
    
    def load_model(self, model_type: str, model_path: str) -> Tuple[Any, ModelLoader]:
        """
        Load model with caching support.
        
        Args:
            model_type: Type of model to load
            model_path: Path to model file
            
        Returns:
            Tuple of (model_instance, loader) for inference
            
        Raises:
            ModelLoadError: If model cannot be loaded
        """
        cache_key = f"{model_type}:{model_path}"
        
        if cache_key not in self._models:
            if model_type not in self._loaders:
                raise ModelLoadError(f"Unsupported model type: {model_type}")
            
            loader = self._loaders[model_type]
            model = loader.load(model_path)
            self._models[cache_key] = (model, loader)
        
        return self._models[cache_key]
```

### 5.2 Model Loader Interface

```python
# models/loaders.py
class ModelLoader(ABC):
    """Abstract interface for model loaders."""
    
    @abstractmethod
    def load(self, model_path: str) -> Any:
        """Load model from path."""
        pass
    
    @abstractmethod
    def predict(self, model: Any, X: Any) -> Any:
        """Make predictions with model."""
        pass
    
    @abstractmethod
    def get_feature_names(self, model: Any) -> List[str]:
        """Get expected feature names."""
        pass

class XGBoostModelLoader(ModelLoader):
    """XGBoost model loader with comprehensive support."""
    
    def load(self, model_path: str) -> xgb.Booster:
        """Load XGBoost model from various formats."""
        if model_path.endswith('.pkl'):
            return joblib.load(model_path)
        else:
            booster = xgb.Booster()
            booster.load_model(model_path)
            return booster
    
    def predict(self, model: Any, X: Any) -> np.ndarray:
        """Make predictions with XGBoost model."""
        if hasattr(model, 'predict_proba'):  # Scikit-learn wrapper
            return model.predict_proba(X)
        else:  # Native XGBoost
            dmatrix = xgb.DMatrix(X)
            return model.predict(dmatrix)
    
    def get_feature_names(self, model: Any) -> List[str]:
        """Extract feature names from XGBoost model."""
        if hasattr(model, 'feature_names_in_'):
            return model.feature_names_in_.tolist()
        else:
            return model.feature_names or []
```

## 6. Testing Framework Documentation

### 6.1 Testing Strategy Overview

The testing strategy employs a **three-tier approach**[1][3]:

1. **Unit Tests**: Individual component testing with mocks
2. **Integration Tests**: Component interaction testing with real dependencies
3. **End-to-End Tests**: Full workflow testing with test containers

### 6.2 Test Directory Structure

```
tests/
├── __init__.py
├── conftest.py              # Pytest configuration and fixtures
├── unit/
│   ├── __init__.py
│   ├── test_config_manager.py
│   ├── test_step_factory.py
│   ├── test_model_manager.py
│   └── test_workflow_executor.py
├── integration/
│   ├── __init__.py
│   ├── test_snowpark_integration.py
│   ├── test_model_integration.py
│   └── test_workflow_integration.py
├── e2e/
│   ├── __init__.py
│   ├── test_full_workflow.py
│   └── test_error_scenarios.py
├── fixtures/
│   ├── configs/             # Test configuration files
│   ├── models/             # Test model files
│   └── data/               # Test data files
└── utils/
    ├── __init__.py
    ├── mock_helpers.py
    └── test_containers.py
```

### 6.3 Pytest Configuration and Fixtures

```python
# tests/conftest.py
import pytest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import MagicMock, patch
from snowflake.snowpark import Session
from testcontainers.postgres import PostgresContainer

from workflow_runner.config.manager import ConfigurationManager
from workflow_runner.context.manager import DataContextManager
from workflow_runner.steps.factory import StepFactory, StepRegistry

@pytest.fixture(scope="session")
def test_config_dir():
    """Create temporary config directory for tests."""
    temp_dir = tempfile.mkdtemp()
    config_dir = Path(temp_dir) / "configs"
    
    # Copy test configurations
    test_configs = Path(__file__).parent / "fixtures" / "configs"
    shutil.copytree(test_configs, config_dir)
    
    yield config_dir
    
    # Cleanup
    shutil.rmtree(temp_dir)

@pytest.fixture(scope="session")
def postgres_container():
    """Start PostgreSQL container for integration tests."""
    with PostgresContainer("postgres:13") as postgres:
        yield postgres

@pytest.fixture
def mock_snowpark_session():
    """Create mock Snowpark session for unit tests."""
    session = MagicMock(spec=Session)
    session.sql.return_value = MagicMock()
    session.create_dataframe.return_value = MagicMock()
    return session

@pytest.fixture
def config_manager(test_config_dir):
    """Create ConfigurationManager with test configs."""
    return ConfigurationManager(str(test_config_dir))

@pytest.fixture
def step_registry():
    """Create StepRegistry with test steps."""
    registry = StepRegistry()
    # Register test steps
    from tests.utils.mock_helpers import MockQueryStep, MockTransformStep
    registry.register("MockQueryStep", MockQueryStep)
    registry.register("MockTransformStep", MockTransformStep)
    return registry

@pytest.fixture
def step_factory(step_registry):
    """Create StepFactory with test registry."""
    return StepFactory(step_registry)

@pytest.fixture
def data_context(mock_snowpark_session):
    """Create DataContext for testing."""
    from workflow_runner.context.manager import DataContext
    return DataContext(mock_snowpark_session, "2025-07-03")
```

## 7. Unit Testing Examples

### 7.1 Configuration Manager Tests

```python
# tests/unit/test_config_manager.py
import pytest
from unittest.mock import patch, mock_open
from workflow_runner.config.manager import ConfigurationManager
from workflow_runner.exceptions import ConfigurationError

class TestConfigurationManager:
    """Test suite for ConfigurationManager."""
    
    def test_load_workflow_config_success(self, config_manager):
        """Test successful workflow configuration loading."""
        # Arrange
        workflow_name = "test_workflow"
        partition_date = "2025-07-03"
        
        # Act
        config = config_manager.load_workflow_config(workflow_name, partition_date)
        
        # Assert
        assert config.name == "test_workflow"
        assert config.partition_date == partition_date
        assert len(config.steps) > 0
        assert config.snowpark_config is not None
    
    def test_load_nonexistent_workflow_fails(self, config_manager):
        """Test loading non-existent workflow raises error."""
        # Arrange
        workflow_name = "nonexistent_workflow"
        partition_date = "2025-07-03"
        
        # Act & Assert
        with pytest.raises(ConfigurationError, match="Workflow configuration not found"):
            config_manager.load_workflow_config(workflow_name, partition_date)
    
    def test_yaml_inheritance_resolution(self, config_manager):
        """Test YAML inheritance resolution works correctly."""
        # Arrange
        parent_config = {
            "snowpark": {"account": "test_account"},
            "workflow": {"timeout": 3600}
        }
        child_config = {
            "<<": "parent.yaml",
            "workflow": {"name": "child_workflow", "timeout": 1800}
        }
        
        # Act
        with patch('builtins.open', mock_open(read_data="test")):
            with patch('yaml.safe_load', side_effect=[child_config, parent_config]):
                result = config_manager._resolve_inheritance(Path("child.yaml"))
        
        # Assert
        assert result["snowpark"]["account"] == "test_account"
        assert result["workflow"]["name"] == "child_workflow"
        assert result["workflow"]["timeout"] == 1800  # Child overrides parent
    
    @pytest.mark.parametrize("env_var,expected", [
        ("TEST_ACCOUNT", "test_account"),
        ("PROD_ACCOUNT", "prod_account"),
    ])
    def test_environment_variable_substitution(self, config_manager, env_var, expected):
        """Test environment variable substitution."""
        # Arrange
        config = {"snowpark": {"account": f"${{{env_var}}}"}}
        
        # Act
        with patch.dict('os.environ', {env_var: expected}):
            result = config_manager._substitute_variables(config, "2025-07-03")
        
        # Assert
        assert result["snowpark"]["account"] == expected
```

### 7.2 Step Factory Tests

```python
# tests/unit/test_step_factory.py
import pytest
from unittest.mock import MagicMock
from workflow_runner.steps.factory import StepFactory, StepConfig
from workflow_runner.exceptions import StepCreationError

class TestStepFactory:
    """Test suite for StepFactory."""
    
    def test_create_step_success(self, step_factory):
        """Test successful step creation."""
        # Arrange
        step_config = StepConfig(
            name="test_step",
            type="MockQueryStep",
            config={"query": "SELECT 1", "output_name": "result"}
        )
        
        # Act
        step = step_factory.create_step(step_config)
        
        # Assert
        assert step is not None
        assert hasattr(step, 'execute')
        assert hasattr(step, 'validate_config')
    
    def test_create_unknown_step_type_fails(self, step_factory):
        """Test creating unknown step type raises error."""
        # Arrange
        step_config = StepConfig(
            name="test_step",
            type="UnknownStepType",
            config={}
        )
        
        # Act & Assert
        with pytest.raises(StepCreationError, match="Unknown step type"):
            step_factory.create_step(step_config)
    
    def test_step_validation_called(self, step_factory):
        """Test step validation is called during creation."""
        # Arrange
        step_config = StepConfig(
            name="test_step",
            type="MockQueryStep",
            config={"invalid_config": "value"}
        )
        
        # Act & Assert
        with pytest.raises(StepCreationError, match="validation"):
            step_factory.create_step(step_config)
```

### 7.3 Model Manager Tests

```python
# tests/unit/test_model_manager.py
import pytest
from unittest.mock import MagicMock, patch
from workflow_runner.models.manager import ModelManager
from workflow_runner.exceptions import ModelLoadError

class TestModelManager:
    """Test suite for ModelManager."""
    
    def test_load_xgboost_model_success(self):
        """Test successful XGBoost model loading."""
        # Arrange
        manager = ModelManager()
        model_path = "/path/to/model.json"
        
        # Mock XGBoost booster
        mock_booster = MagicMock()
        
        with patch('xgboost.Booster') as mock_booster_class:
            mock_booster_class.return_value = mock_booster
            
            # Act
            model, loader = manager.load_model("xgboost", model_path)
            
            # Assert
            assert model == mock_booster
            assert loader is not None
            mock_booster.load_model.assert_called_once_with(model_path)
    
    def test_model_caching(self):
        """Test model caching functionality."""
        # Arrange
        manager = ModelManager()
        model_path = "/path/to/model.json"
        
        with patch('xgboost.Booster') as mock_booster_class:
            mock_booster = MagicMock()
            mock_booster_class.return_value = mock_booster
            
            # Act - Load same model twice
            model1, _ = manager.load_model("xgboost", model_path)
            model2, _ = manager.load_model("xgboost", model_path)
            
            # Assert - Should return same instance
            assert model1 is model2
            assert mock_booster_class.call_count == 1  # Only called once
    
    def test_unsupported_model_type_fails(self):
        """Test loading unsupported model type raises error."""
        # Arrange
        manager = ModelManager()
        
        # Act & Assert
        with pytest.raises(ModelLoadError, match="Unsupported model type"):
            manager.load_model("unsupported_type", "/path/to/model")
    
    def test_register_custom_loader(self):
        """Test registering custom model loader."""
        # Arrange
        manager = ModelManager()
        custom_loader = MagicMock()
        
        # Act
        manager.register_loader("custom_type", custom_loader)
        
        # Assert
        assert "custom_type" in manager._loaders
        assert manager._loaders["custom_type"] == custom_loader
```

## 8. Integration Testing Examples

### 8.1 Snowpark Integration Tests

```python
# tests/integration/test_snowpark_integration.py
import pytest
from unittest.mock import MagicMock, patch
from snowflake.snowpark import Session
from workflow_runner.steps.snowpark_steps import SnowparkQueryStep
from workflow_runner.context.manager import DataContext
from workflow_runner.steps.factory import StepConfig

class TestSnowparkIntegration:
    """Integration tests for Snowpark functionality."""
    
    @pytest.fixture
    def real_snowpark_session(self):
        """Create real Snowpark session for integration tests."""
        # Note: This would use actual Snowflake credentials in CI/CD
        # For local testing, use Snowflake's local testing framework
        from snowflake.snowpark import Session
        return Session.builder.config('local_testing', True).create()
    
    def test_query_step_execution(self, real_snowpark_session):
        """Test SnowparkQueryStep with real session."""
        # Arrange
        step = SnowparkQueryStep()
        context = DataContext(real_snowpark_session, "2025-07-03")
        
        config = StepConfig(
            name="test_query",
            type="SnowparkQueryStep",
            config={
                "query_template": "SELECT 1 as test_col, 'test' as test_str",
                "output_name": "test_data"
            }
        )
        
        # Act
        result = await step.execute(context, config)
        
        # Assert
        assert result.success
        assert "test_data" in context.list_data_keys()
        
        # Verify data
        df = context.get_data("test_data")
        assert df.count() == 1
        assert "test_col" in df.columns
        assert "test_str" in df.columns
    
    def test_transform_step_execution(self, real_snowpark_session):
        """Test SnowparkTransformStep with real session."""
        # Arrange
        from workflow_runner.steps.snowpark_steps import SnowparkTransformStep
        
        step = SnowparkTransformStep()
        context = DataContext(real_snowpark_session, "2025-07-03")
        
        # Create source data
        source_df = real_snowpark_session.create_dataframe(
            [[1, 2], [3, None], [5, 6]],
            ["col1", "col2"]
        )
        context.store_data("source", source_df)
        
        config = StepConfig(
            name="test_transform",
            type="SnowparkTransformStep",
            config={
                "input_name": "source",
                "output_name": "transformed",
                "transformations": [
                    {
                        "type": "fill_nulls",
                        "columns": ["col2"],
                        "value": 0
                    },
                    {
                        "type": "add_column",
                        "name": "col3",
                        "value": "col1 + col2"
                    }
                ]
            }
        )
        
        # Act
        result = await step.execute(context, config)
        
        # Assert
        assert result.success
        df = context.get_data("transformed")
        assert df.count() == 3
        assert "col3" in df.columns
        
        # Verify null filling worked
        col2_values = df.select("col2").collect()
        assert all(row[0] is not None for row in col2_values)
```

### 8.2 Model Integration Tests

```python
# tests/integration/test_model_integration.py
import pytest
import tempfile
import pickle
import xgboost as xgb
import numpy as np
from sklearn.datasets import make_classification
from workflow_runner.models.manager import ModelManager
from workflow_runner.steps.model_steps import ModelInferenceStep

class TestModelIntegration:
    """Integration tests for model functionality."""
    
    @pytest.fixture
    def sample_xgboost_model(self):
        """Create sample XGBoost model for testing."""
        # Generate sample data
        X, y = make_classification(n_samples=100, n_features=5, random_state=42)
        
        # Train XGBoost model
        dtrain = xgb.DMatrix(X, label=y)
        params = {'objective': 'binary:logistic', 'eval_metric': 'logloss'}
        model = xgb.train(params, dtrain, num_boost_round=10)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
            model.save_model(f.name)
            return f.name, X, y
    
    def test_xgboost_model_loading_and_inference(self, sample_xgboost_model):
        """Test XGBoost model loading and inference."""
        # Arrange
        model_path, X, y = sample_xgboost_model
        manager = ModelManager()
        
        # Act
        model, loader = manager.load_model("xgboost", model_path)
        predictions = loader.predict(model, X)
        
        # Assert
        assert model is not None
        assert predictions is not None
        assert len(predictions) == len(X)
        assert all(0 <= p <= 1 for p in predictions)  # Probabilities
    
    def test_model_inference_step_end_to_end(self, sample_xgboost_model, real_snowpark_session):
        """Test complete model inference step."""
        # Arrange
        model_path, X, y = sample_xgboost_model
        
        # Create Snowpark DataFrame from test data
        df = real_snowpark_session.create_dataframe(
            X.tolist(),
            [f"feature_{i}" for i in range(X.shape[1])]
        )
        
        context = DataContext(real_snowpark_session, "2025-07-03")
        context.store_data("features", df)
        
        step = ModelInferenceStep()
        config = StepConfig(
            name="test_inference",
            type="ModelInferenceStep",
            config={
                "model_type": "xgboost",
                "model_path": model_path,
                "input_name": "features",
                "output_name": "predictions",
                "feature_columns": [f"feature_{i}" for i in range(X.shape[1])]
            }
        )
        
        # Act
        result = await step.execute(context, config)
        
        # Assert
        assert result.success
        assert "predictions" in context.list_data_keys()
        
        pred_df = context.get_data("predictions")
        assert pred_df.count() == len(X)
        assert "prediction" in pred_df.columns
```

## 9. End-to-End Testing Examples

### 9.1 Full Workflow Tests

```python
# tests/e2e/test_full_workflow.py
import pytest
import tempfile
import yaml
from pathlib import Path
from workflow_runner.main import WorkflowRunner
from testcontainers.postgres import PostgresContainer

class TestFullWorkflow:
    """End-to-end tests for complete workflows."""
    
    @pytest.fixture
    def test_workflow_config(self, tmp_path):
        """Create test workflow configuration."""
        config_dir = tmp_path / "configs"
        config_dir.mkdir()
        
        # Create base auth config
        auth_config = {
            "snowpark": {
                "connection_parameters": {
                    "account": "test_account",
                    "user": "test_user",
                    "password": "test_password",
                    "warehouse": "test_warehouse",
                    "database": "test_database",
                    "schema": "test_schema"
                }
            },
            "logging": {
                "level": "INFO"
            }
        }
        
        auth_file = config_dir / "base" / "auth.yaml"
        auth_file.parent.mkdir(parents=True)
        with open(auth_file, 'w') as f:
            yaml.dump(auth_config, f)
        
        # Create workflow config
        workflow_config = {
            "<<": "base/auth.yaml",
            "workflow": {
                "name": "test_workflow",
                "timeout": 3600,
                "steps": [
                    {
                        "name": "extract_data",
                        "type": "SnowparkQueryStep",
                        "config": {
                            "query_template": "SELECT * FROM test_table WHERE date = '{partition_date}'",
                            "output_name": "raw_data"
                        }
                    },
                    {
                        "name": "transform_data",
                        "type": "SnowparkTransformStep",
                        "config": {
                            "input_name": "raw_data",
                            "output_name": "features",
                            "transformations": [
                                {
                                    "type": "fill_nulls",
                                    "columns": ["feature1", "feature2"],
                                    "value": 0
                                }
                            ]
                        }
                    },
                    {
                        "name": "model_inference",
                        "type": "ModelInferenceStep",
                        "config": {
                            "model_type": "xgboost",
                            "model_path": "models/test_model.json",
                            "input_name": "features",
                            "output_name": "predictions"
                        }
                    }
                ]
            }
        }
        
        workflow_file = config_dir / "workflows" / "test_workflow.yaml"
        workflow_file.parent.mkdir(parents=True)
        with open(workflow_file, 'w') as f:
            yaml.dump(workflow_config, f)
        
        return config_dir
    
    @pytest.mark.asyncio
    async def test_complete_workflow_execution(self, test_workflow_config, sample_xgboost_model):
        """Test complete workflow execution."""
        # Arrange
        model_path, X, y = sample_xgboost_model
        
        # Mock Snowpark session for testing
        with patch('workflow_runner.context.manager.Session') as mock_session:
            mock_df = MagicMock()
            mock_df.count.return_value = len(X)
            mock_df.columns = [f"feature_{i}" for i in range(X.shape[1])]
            mock_session.builder.configs.return_value.create.return_value.sql.return_value = mock_df
            
            runner = WorkflowRunner()
            runner.config_manager.config_root = test_workflow_config
            
            # Act
            await runner.run("test_workflow", "2025-07-03")
            
            # Assert - Workflow should complete without errors
            # In real implementation, you would verify the outputs
            assert True  # Placeholder - verify specific outputs in real tests
    
    def test_workflow_with_invalid_config_fails(self, tmp_path):
        """Test workflow with invalid configuration fails gracefully."""
        # Arrange
        config_dir = tmp_path / "configs"
        config_dir.mkdir()
        
        # Create invalid workflow config
        invalid_config = {
            "workflow": {
                "name": "invalid_workflow",
                "steps": [
                    {
                        "name": "invalid_step",
                        "type": "NonExistentStepType",
                        "config": {}
                    }
                ]
            }
        }
        
        workflow_file = config_dir / "workflows" / "invalid_workflow.yaml"
        workflow_file.parent.mkdir(parents=True)
        with open(workflow_file, 'w') as f:
            yaml.dump(invalid_config, f)
        
        runner = WorkflowRunner()
        runner.config_manager.config_root = config_dir
        
        # Act & Assert
        with pytest.raises(Exception):  # Should raise configuration or validation error
            await runner.run("invalid_workflow", "2025-07-03")
```

### 9.2 Error Scenario Tests

```python
# tests/e2e/test_error_scenarios.py
import pytest
from unittest.mock import patch, MagicMock
from workflow_runner.main import WorkflowRunner
from workflow_runner.exceptions import WorkflowExecutionError

class TestErrorScenarios:
    """Test error handling and recovery scenarios."""
    
    @pytest.mark.asyncio
    async def test_step_failure_stops_workflow(self, test_workflow_config):
        """Test workflow stops on step failure."""
        # Arrange
        runner = WorkflowRunner()
        runner.config_manager.config_root = test_workflow_config
        
        # Mock step to fail
        with patch('workflow_runner.steps.snowpark_steps.SnowparkQueryStep.execute') as mock_execute:
            mock_execute.side_effect = Exception("Database connection failed")
            
            # Act & Assert
            with pytest.raises(WorkflowExecutionError):
                await runner.run("test_workflow", "2025-07-03")
    
    @pytest.mark.asyncio
    async def test_step_retry_mechanism(self, test_workflow_config):
        """Test step retry mechanism works correctly."""
        # Arrange
        runner = WorkflowRunner()
        runner.config_manager.config_root = test_workflow_config
        
        # Mock step to fail twice then succeed
        call_count = 0
        def mock_execute(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise Exception("Temporary failure")
            return MagicMock(success=True)
        
        with patch('workflow_runner.steps.snowpark_steps.SnowparkQueryStep.execute', side_effect=mock_execute):
            # Act
            await runner.run("test_workflow", "2025-07-03")
            
            # Assert
            assert call_count == 3  # Should retry twice then succeed
    
    def test_configuration_validation_errors(self):
        """Test configuration validation catches errors."""
        # Arrange
        invalid_configs = [
            {},  # Empty config
            {"workflow": {}},  # Missing steps
            {"workflow": {"steps": []}},  # Empty steps
            {"workflow": {"steps": [{"name": "test"}]}},  # Missing type
        ]
        
        for invalid_config in invalid_configs:
            # Act & Assert
            with pytest.raises(Exception):  # Should raise validation error
                # Test configuration validation
                pass
```

## 10. Testing Utilities and Helpers

### 10.1 Mock Helpers

```python
# tests/utils/mock_helpers.py
from unittest.mock import MagicMock
from workflow_runner.steps.base import WorkflowStep, StepConfig, StepResult

class MockQueryStep(WorkflowStep):
    """Mock query step for testing."""
    
    def validate_config(self, config: StepConfig) -> None:
        required_keys = ['query', 'output_name']
        for key in required_keys:
            if key not in config.config:
                raise ValueError(f"Missing required key: {key}")
    
    async def execute(self, context, config: StepConfig) -> StepResult:
        # Simulate query execution
        mock_data = MagicMock()
        mock_data.count.return_value = 100
        mock_data.columns = ['col1', 'col2']
        
        context.store_data(config.config['output_name'], mock_data)
        
        return StepResult(
            success=True,
            metadata={'row_count': 100}
        )

class MockTransformStep(WorkflowStep):
    """Mock transform step for testing."""
    
    def validate_config(self, config: StepConfig) -> None:
        required_keys = ['input_name', 'output_name']
        for key in required_keys:
            if key not in config.config:
                raise ValueError(f"Missing required key: {key}")
    
    async def execute(self, context, config: StepConfig) -> StepResult:
        # Get input data
        input_data = context.get_data(config.config['input_name'])
        
        # Simulate transformation
        mock_transformed_data = MagicMock()
        mock_transformed_data.count.return_value = input_data.count()
        mock_transformed_data.columns = input_data.columns + ['new_col']
        
        context.store_data(config.config['output_name'], mock_transformed_data)
        
        return StepResult(
            success=True,
            metadata={'transformed': True}
        )
```

### 10.2 Test Container Helpers

```python
# tests/utils/test_containers.py
import pytest
from testcontainers.postgres import PostgresContainer
from testcontainers.compose import DockerCompose

@pytest.fixture(scope="session")
def postgres_container():
    """PostgreSQL container for database testing."""
    with PostgresContainer("postgres:13") as postgres:
        yield postgres

@pytest.fixture(scope="session")
def snowflake_container():
    """Mock Snowflake container for testing."""
    # Note: There's no official Snowflake container, 
    # so we'd use a PostgreSQL container with Snowflake-like schema
    with PostgresContainer("postgres:13") as postgres:
        # Set up Snowflake-like schema
        connection = postgres.get_connection()
        cursor = connection.cursor()
        
        # Create test tables
        cursor.execute("""
            CREATE TABLE customer_features (
                customer_id INT,
                tenure INT,
                monthly_charges DECIMAL,
                total_charges DECIMAL,
                partition_date DATE
            )
        """)
        
        # Insert test data
        cursor.execute("""
            INSERT INTO customer_features VALUES
            (1, 12, 50.0, 600.0, '2025-07-03'),
            (2, 24, 75.0, 1800.0, '2025-07-03'),
            (3, 6, 30.0, 180.0, '2025-07-03')
        """)
        
        connection.commit()
        cursor.close()
        
        yield postgres

@pytest.fixture(scope="session")
def docker_compose_environment():
    """Docker Compose environment for complex testing."""
    with DockerCompose("tests/docker", compose_file_name="docker-compose.test.yml") as compose:
        yield compose
```

## 11. Testing Best Practices

### 11.1 Test Organization Guidelines

1. **Test Structure**: Follow the **Arrange-Act-Assert** pattern consistently[1][3]
2. **Test Independence**: Each test should be **fully independent** and able to run in isolation[1][3]
3. **Fast Execution**: Keep unit tests fast (< 100ms) and separate slower integration tests[1][3]
4. **Clear Naming**: Use descriptive test names that explain what is being tested[1][3]
5. **Mock External Dependencies**: Mock external systems in unit tests, use real systems in integration tests[4][5]

### 11.2 Fixture Design Patterns

```python
# Example of well-designed fixtures
@pytest.fixture(scope="session")
def db_connection():
    """Session-scoped database connection."""
    connection = create_connection()
    yield connection
    connection.close()

@pytest.fixture
def clean_database(db_connection):
    """Function-scoped database cleanup."""
    yield db_connection
    # Cleanup after each test
    db_connection.execute("DELETE FROM test_table")
    db_connection.commit()

@pytest.fixture
def sample_data():
    """Reusable test data."""
    return {
        "customers": [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"}
        ]
    }
```

### 11.3 Error Testing Strategies

```python
# Test both success and failure scenarios
def test_successful_execution(self, workflow_runner):
    """Test successful workflow execution."""
    result = workflow_runner.run("valid_workflow", "2025-07-03")
    assert result.success

def test_database_connection_failure(self, workflow_runner):
    """Test handling of database connection failures."""
    with patch('snowflake.snowpark.Session') as mock_session:
        mock_session.side_effect = ConnectionError("Connection failed")
        
        with pytest.raises(WorkflowExecutionError):
            workflow_runner.run("test_workflow", "2025-07-03")

def test_invalid_configuration(self, workflow_runner):
    """Test handling of invalid configurations."""
    with pytest.raises(ConfigurationError):
        workflow_runner.run("invalid_workflow", "2025-07-03")
```

## 12. Continuous Integration Setup

### 12.1 GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run unit tests
      run: |
        pytest tests/unit/ -v --cov=workflow_runner --cov-report=xml
    
    - name: Run integration tests
      run: |
        pytest tests/integration/ -v
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
    
    - name: Run end-to-end tests
      run: |
        pytest tests/e2e/ -v
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v1
```

### 12.2 Test Configuration for CI

```python
# tests/conftest.py - CI-specific configurations
import os
import pytest

def pytest_configure(config):
    """Configure pytest for different environments."""
    # Set test database URL for CI
    if 'GITHUB_ACTIONS' in os.environ:
        os.environ['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/postgres'
    
    # Configure logging for tests
    import logging
    logging.basicConfig(level=logging.INFO)

@pytest.fixture(scope="session")
def ci_environment():
    """Detect CI environment."""
    return {
        'is_ci': 'CI' in os.environ,
        'is_github_actions': 'GITHUB_ACTIONS' in os.environ,
        'database_url': os.environ.get('DATABASE_URL')
    }
```

## 13. Performance Testing

### 13.1 Load Testing Examples

```python
# tests/performance/test_load.py
import pytest
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from workflow_runner.main import WorkflowRunner

class TestPerformance:
    """Performance and load testing."""
    
    @pytest.mark.slow
    def test_workflow_execution_time(self, workflow_runner):
        """Test workflow execution time stays within limits."""
        # Arrange
        start_time = time.time()
        
        # Act
        workflow_runner.run("test_workflow", "2025-07-03")
        
        # Assert
        execution_time = time.time() - start_time
        assert execution_time < 300  # Should complete within 5 minutes
    
    @pytest.mark.slow
    def test_concurrent_workflow_execution(self, workflow_runner):
        """Test concurrent workflow execution."""
        # Arrange
        num_concurrent_workflows = 5
        
        async def run_workflow():
            return await workflow_runner.run("test_workflow", "2025-07-03")
        
        # Act
        start_time = time.time()
        with ThreadPoolExecutor(max_workers=num_concurrent_workflows) as executor:
            futures = [
                executor.submit(asyncio.run, run_workflow())
                for _ in range(num_concurrent_workflows)
            ]
            
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Assert
        assert all(result.success for result in results)
        assert execution_time < 600  # Should complete within 10 minutes
    
    @pytest.mark.slow
    def test_memory_usage_under_load(self, workflow_runner):
        """Test memory usage doesn't exceed limits."""
        import psutil
        import os
        
        # Arrange
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Act
        for i in range(10):
            workflow_runner.run("test_workflow", f"2025-07-{i+1:02d}")
        
        # Assert
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        assert memory_increase < 500  # Should not increase by more than 500MB
```

## 14. Documentation Generation

### 14.1 Sphinx Configuration

```python
# docs/conf.py
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.abspath('..'))

# Project information
project = 'Workflow Runner'
copyright = '2025, Your Organization'
author = 'Your Team'

# Extensions
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'sphinx.ext.todo',
    'sphinx_autoapi.extension',
]

# AutoAPI configuration
autoapi_dirs = ['../workflow_runner']
autoapi_type = 'python'
autoapi_options = [
    'members',
    'undoc-members',
    'show-inheritance',
    'show-module-summary',
    'special-members',
    'imported-members',
]

# Napoleon configuration for Google-style docstrings
napoleon_google_docstring = True
napoleon_numpy_docstring = False
napoleon_include_init_with_doc = False
napoleon_include_private_with_doc = False

# Theme
html_theme = 'sphinx_rtd_theme'
```

### 14.2 Documentation Build Process

```bash
# Build documentation
cd docs
make html

# Generate API documentation
sphinx-apidoc -o api/ ../workflow_runner

# Build with coverage
sphinx-build -b coverage . _build/coverage
```

This comprehensive documentation provides a complete guide for implementing and testing the Dynamic Workflow Runner system. The testing framework covers unit tests, integration tests, end-to-end tests, and performance testing, following industry best practices[1][3][6][7]. The system uses modern Python testing tools including pytest, testcontainers, and mocking libraries to ensure robust and reliable code[8][9][6][10].
