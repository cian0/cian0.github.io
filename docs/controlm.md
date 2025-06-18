# Control-M Data Engineering Handbook

## Common Data Engineering Patterns

### 1. ETL Pipeline Orchestration

#### Basic ETL Flow Example
```json
{
    "Type": "Folder",
    "Name": "Daily_ETL_Pipeline",
    "Jobs": [
        {
            "Name": "Extract_Source_Data",
            "Type": "Command",
            "Command": "python /scripts/extract_data.py",
            "TimeZone": "America/New_York",
            "When": {
                "Schedule": "0300"
            }
        },
        {
            "Name": "Transform_Data",
            "Type": "Command",
            "Command": "python /scripts/transform_data.py",
            "Dependencies": {
                "OnSuccess": ["Extract_Source_Data"]
            }
        },
        {
            "Name": "Load_To_Warehouse",
            "Type": "Command",
            "Command": "python /scripts/load_warehouse.py",
            "Dependencies": {
                "OnSuccess": ["Transform_Data"]
            }
        }
    ]
}
```

#### Best Practices
- Set meaningful job names with prefix for easy identification
- Include error handling and retry logic
- Add notifications for critical failures
- Log all operations for debugging
- Set appropriate timeouts

### 2. Data Lake Processing

#### Example: Multi-Source Data Lake Pipeline
```json
{
    "Type": "Folder",
    "Name": "DataLake_Ingestion",
    "Jobs": [
        {
            "Name": "Check_Source_Files",
            "Type": "Command",
            "Command": "python /scripts/check_files.py",
            "Variables": [
                {"SOURCE_PATH": "/data/incoming/"},
                {"FILE_PATTERN": "*.csv"}
            ]
        },
        {
            "Name": "Convert_To_Parquet",
            "Type": "Command",
            "Command": "spark-submit /scripts/convert_parquet.py",
            "Dependencies": {
                "OnSuccess": ["Check_Source_Files"]
            },
            "Resources": {
                "Memory": "16GB",
                "Cores": "4"
            }
        }
    ]
}
```

### 3. Data Quality Checks

#### Example: Data Validation Pipeline
```json
{
    "Type": "Folder",
    "Name": "Data_Quality_Checks",
    "Jobs": [
        {
            "Name": "Run_Quality_Tests",
            "Type": "Command",
            "Command": "python /scripts/quality_checks.py",
            "Variables": [
                {"CHECK_LEVEL": "CRITICAL"},
                {"THRESHOLD": "0.95"}
            ],
            "OnFailure": {
                "Action": "SendEmail",
                "To": "data-team@company.com"
            }
        }
    ]
}
```

### 4. Incremental Data Loading

#### Example: Delta Load Configuration
```json
{
    "Type": "Folder",
    "Name": "Incremental_Load",
    "Jobs": [
        {
            "Name": "Get_Last_Loaded_Date",
            "Type": "Database",
            "Query": "SELECT MAX(load_date) FROM control_table",
            "OutputVariable": "LAST_LOAD_DATE"
        },
        {
            "Name": "Load_Delta_Data",
            "Type": "Command",
            "Command": "python /scripts/delta_load.py --start-date %%LAST_LOAD_DATE%%",
            "Dependencies": {
                "OnSuccess": ["Get_Last_Loaded_Date"]
            }
        }
    ]
}
```

## Advanced Use Cases

### 1. Cross-Platform Data Synchronization

#### Example: Multi-System Sync
```json
{
    "Type": "Folder",
    "Name": "Cross_Platform_Sync",
    "Jobs": [
        {
            "Name": "Extract_Oracle",
            "Type": "Database",
            "ConnectionProfile": "PROD_ORACLE",
            "SQLScript": "/sql/extract_oracle.sql"
        },
        {
            "Name": "Load_Snowflake",
            "Type": "Command",
            "Command": "snowsql -f /sql/load_snowflake.sql",
            "Dependencies": {
                "OnSuccess": ["Extract_Oracle"]
            }
        }
    ]
}
```

### 2. Real-time Data Processing

#### Example: Streaming Data Pipeline
```json
{
    "Type": "Folder",
    "Name": "Streaming_Pipeline",
    "Jobs": [
        {
            "Name": "Start_Kafka_Consumer",
            "Type": "Command",
            "Command": "python /scripts/kafka_consumer.py",
            "JobType": "Continuous"
        },
        {
            "Name": "Process_Stream",
            "Type": "Command",
            "Command": "spark-submit /scripts/stream_processor.py",
            "Dependencies": {
                "OnSuccess": ["Start_Kafka_Consumer"]
            }
        }
    ]
}
```

## Error Handling Patterns

### 1. Retry Logic
```json
{
    "Name": "Load_Data",
    "Type": "Command",
    "Command": "python /scripts/load_data.py",
    "RetryAttempts": 3,
    "RetryInterval": "00:05:00",
    "OnFailure": {
        "Action": "RetryJob",
        "MaxRetries": 3
    }
}
```

### 2. Alternative Flow
```json
{
    "Name": "Process_Data",
    "Type": "Command",
    "Command": "python /scripts/primary_process.py",
    "OnFailure": {
        "RunJob": "Backup_Process",
        "Notification": {
            "Type": "Email",
            "Recipients": "team@company.com"
        }
    }
}
```

## Common Variables and Parameters

### 1. Date Variables
```
%%CURRENT_DATE%% - Current date
%%YESTERDAY%% - Previous day's date
%%MDATE-1%% - Previous month's date
%%YYYY%% - Current year
%%MM%% - Current month
%%DD%% - Current day
```

### 2. System Variables
```
%%JOBNAME%% - Current job name
%%FOLDER%% - Current folder name
%%STATUS%% - Job status
%%CONTROLM_SERVER%% - Server name
```

## Quick Reference Commands

### 1. Job Status Check
```bash
ctm run status -n JobName
```

### 2. Force Job Completion
```bash
ctm run force -n JobName
```

### 3. Hold Job
```bash
ctm run hold -n JobName
```

### 4. Release Hold
```bash
ctm run release -n JobName
```

## Monitoring and Alerting

### 1. SLA Configuration
```json
{
    "Name": "Critical_Load",
    "Type": "Command",
    "Command": "python /scripts/load.py",
    "SLA": {
        "Time": "0600",
        "Grace": "00:30:00",
        "Action": "SendAlert"
    }
}
```

### 2. Resource Monitoring
```json
{
    "Name": "Heavy_Processing",
    "Type": "Command",
    "Command": "python /scripts/process.py",
    "Resources": {
        "Memory": {"Min": "8GB", "Max": "16GB"},
        "CPU": {"Min": 2, "Max": 4}
    }
}
```

## Tips and Tricks

1. Always use descriptive job names with consistent naming conventions
   ```
   DE_DAILY_LOAD_CUSTOMERS
   DE_HOURLY_METRICS_UPDATE
   ```

2. Implement proper logging in all scripts
   ```python
   import logging
   logging.basicConfig(
       filename='%%JOBNAME%%.log',
       level=logging.INFO,
       format='%(asctime)s - %(levelname)s - %(message)s'
   )
   ```

3. Use Control-M variables for dynamic configuration
   ```bash
   python script.py --date=%%MDATE%% --env=%%ENVIRONMENT%%
   ```

4. Implement proper exit codes in scripts
   ```python
   sys.exit(0)  # Success
   sys.exit(1)  # Failure
   ```

5. Use job templates for common patterns
   ```json
   {
       "Template": "ETL_Basic",
       "Variables": {
           "SOURCE": "customers",
           "TARGET": "warehouse"
       }
   }
   ```

## Troubleshooting Guide

### Common Issues and Solutions

1. Job Hanging
   - Check resource utilization
   - Verify external dependencies
   - Review log files
   - Check for locked resources

2. Missing Dependencies
   - Verify job flow configuration
   - Check job history
   - Review calendar assignments
   - Check for circular dependencies

3. Resource Constraints
   - Monitor system resources
   - Review job resource requirements
   - Check for resource conflicts
   - Implement proper queuing

4. Data Quality Failures
   - Check source data integrity
   - Verify transformation logic
   - Review validation rules
   - Check for system changes

## Performance Optimization

1. Job Grouping
   ```json
   {
       "Type": "Group",
       "Name": "Parallel_Loads",
       "MaxConcurrency": 4,
       "Jobs": ["Load1", "Load2", "Load3", "Load4"]
   }
   ```

2. Resource Management
   ```json
   {
       "Type": "ResourcePool",
       "Name": "ETL_Resources",
       "Max": 8,
       "Jobs": {
           "Pattern": "ETL_*",
           "Resource": 1
       }
   }
   ```

Remember to always test your jobs in a development environment before promoting to production, and maintain proper documentation for all custom scripts and configurations.