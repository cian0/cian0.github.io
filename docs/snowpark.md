# PySpark and SQL Equivalents Guide

## Setup and Initial Configuration

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import *

# Create Spark session
spark = SparkSession.builder \
    .appName("SparkSQLComparison") \
    .getOrCreate()
```

## Basic Operations

### Reading Data

```python
# PySpark
df = spark.read.format("csv") \
    .option("header", "true") \
    .load("path/to/file.csv")

# SQL Equivalent
"""
CREATE EXTERNAL TABLE IF NOT EXISTS table_name (
    column1 STRING,
    column2 INT,
    ...
)
USING CSV
OPTIONS (path 'path/to/file.csv', header 'true')
"""
```

## Data Selection and Filtering

### Basic Selection

```python
# PySpark
result = df.select("name", "age", "salary")

# SQL
"""
SELECT name, age, salary
FROM table
"""
```

### Filtering with Conditions

```python
# PySpark
result = df.filter(df.age > 30).filter(df.salary >= 50000)
# OR
result = df.filter((df.age > 30) & (df.salary >= 50000))

# SQL
"""
SELECT *
FROM table
WHERE age > 30 
AND salary >= 50000
"""
```

## Aggregations

### Basic Aggregations

```python
# PySpark
result = df.groupBy("department").agg(
    avg("salary").alias("avg_salary"),
    count("*").alias("employee_count"),
    sum("salary").alias("total_salary")
)

# SQL
"""
SELECT 
    department,
    AVG(salary) as avg_salary,
    COUNT(*) as employee_count,
    SUM(salary) as total_salary
FROM table
GROUP BY department
"""
```

### Having Clause

```python
# PySpark
result = df.groupBy("department") \
    .agg(count("*").alias("emp_count")) \
    .filter(col("emp_count") > 10)

# SQL
"""
SELECT department, COUNT(*) as emp_count
FROM table
GROUP BY department
HAVING COUNT(*) > 10
"""
```

## Joins

### Inner Join

```python
# PySpark
result = employees.join(
    departments,
    employees.dept_id == departments.id,
    "inner"
)

# SQL
"""
SELECT *
FROM employees e
INNER JOIN departments d
ON e.dept_id = d.id
"""
```

### Left Join

```python
# PySpark
result = employees.join(
    departments,
    employees.dept_id == departments.id,
    "left"
)

# SQL
"""
SELECT *
FROM employees e
LEFT JOIN departments d
ON e.dept_id = d.id
"""
```

## Window Functions

### Row Number

```python
# PySpark
from pyspark.sql.window import Window

windowSpec = Window.partitionBy("department").orderBy(desc("salary"))
result = df.withColumn("rank", row_number().over(windowSpec))

# SQL
"""
SELECT *,
    ROW_NUMBER() OVER (
        PARTITION BY department 
        ORDER BY salary DESC
    ) as rank
FROM table
"""
```

### Running Totals

```python
# PySpark
windowSpec = Window.partitionBy("department") \
    .orderBy("date") \
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

result = df.withColumn(
    "running_total",
    sum("amount").over(windowSpec)
)

# SQL
"""
SELECT *,
    SUM(amount) OVER (
        PARTITION BY department 
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as running_total
FROM table
"""
```

## Common Table Expressions (CTEs)

```python
# PySpark
df1 = df.filter(col("salary") > 50000).select("dept_id", "salary")
df2 = df1.join(departments, df1.dept_id == departments.id)

# SQL
"""
WITH high_salary_employees AS (
    SELECT dept_id, salary
    FROM employees
    WHERE salary > 50000
)
SELECT *
FROM high_salary_employees e
JOIN departments d
ON e.dept_id = d.id
"""
```

## Date Functions

### Date Operations

```python
# PySpark
result = df.withColumn(
    "next_month",
    add_months(col("date"), 1)
).withColumn(
    "date_diff",
    datediff(current_date(), col("date"))
)

# SQL
"""
SELECT *,
    ADD_MONTHS(date, 1) as next_month,
    DATEDIFF(CURRENT_DATE, date) as date_diff
FROM table
"""
```

## String Functions

### String Operations

```python
# PySpark
result = df.withColumn(
    "upper_name",
    upper(col("name"))
).withColumn(
    "name_length",
    length(col("name"))
).withColumn(
    "substring_name",
    substring(col("name"), 1, 3)
)

# SQL
"""
SELECT *,
    UPPER(name) as upper_name,
    LENGTH(name) as name_length,
    SUBSTRING(name, 1, 3) as substring_name
FROM table
"""
```

## Complex Types

### Array Operations

```python
# PySpark
result = df.withColumn(
    "array_contains_value",
    array_contains(col("array_column"), "value")
).withColumn(
    "array_length",
    size(col("array_column"))
)

# SQL
"""
SELECT *,
    ARRAY_CONTAINS(array_column, 'value') as array_contains_value,
    SIZE(array_column) as array_length
FROM table
"""
```

### Struct Operations

```python
# PySpark
result = df.select(
    col("struct_col.*"),
    col("struct_col").getField("field_name")
)

# SQL
"""
SELECT 
    struct_col.*,
    struct_col.field_name
FROM table
"""
```

## Performance Optimization

### Caching

```python
# PySpark
df.cache()
# or
df.persist()

# SQL
"""
CACHE TABLE table_name
"""
```

### Partitioning

```python
# PySpark
df.write.partitionBy("date").saveAsTable("partitioned_table")

# SQL
"""
CREATE TABLE partitioned_table
PARTITIONED BY (date)
AS SELECT * FROM source_table
"""
```

## Common Use Cases

### Deduplication

```python
# PySpark
result = df.dropDuplicates(["id", "name"])

# SQL
"""
SELECT DISTINCT id, name
FROM table
"""
```

### Pivot Operations

```python
# PySpark
pivot_df = df.groupBy("category").pivot("month").agg(sum("amount"))

# SQL
"""
SELECT *
FROM table
PIVOT (
    SUM(amount)
    FOR month IN ('Jan', 'Feb', 'Mar', ...)
)
"""
```

## Best Practices

1. **Optimization Tips**
   - Use appropriate data types
   - Leverage partitioning for large datasets
   - Cache frequently used DataFrames
   - Use broadcast joins for small tables

2. **Performance Considerations**
   - Push down predicates early in the pipeline
   - Minimize shuffles
   - Use explain() to understand query plans

```python
# View execution plan
df.explain(True)
```

3. **Memory Management**
   - Control partition sizes
   - Monitor executor memory
   - Use proper broadcast thresholds

## Error Handling

```python
# PySpark
try:
    result = df.groupBy("department").agg(...)
except Exception as e:
    print(f"Error during aggregation: {str(e)}")
    spark.stop()
```

## Useful Functions for Data Analysis

### Statistical Functions

```python
# PySpark
stats_df = df.select(
    mean("value").alias("mean"),
    stddev("value").alias("stddev"),
    percentile_approx("value", 0.5).alias("median")
)

# SQL
"""
SELECT
    AVG(value) as mean,
    STDDEV(value) as stddev,
    PERCENTILE_APPROX(value, 0.5) as median
FROM table
"""
```

This guide covers the most common operations you'll encounter when working with PySpark and their SQL equivalents. Remember that while the syntax differs, the underlying concepts remain the same. Understanding both approaches allows you to choose the most appropriate one for your specific use case.


# PySpark and SQL Equivalents Guide

## Setup and Initial Configuration

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import *

# Create Spark session
spark = SparkSession.builder \
    .appName("SparkSQLComparison") \
    .getOrCreate()
```

## Basic Operations

### Reading Data

```python
# PySpark
df = spark.read.format("csv") \
    .option("header", "true") \
    .load("path/to/file.csv")

# SQL Equivalent
"""
CREATE EXTERNAL TABLE IF NOT EXISTS table_name (
    column1 STRING,
    column2 INT,
    ...
)
USING CSV
OPTIONS (path 'path/to/file.csv', header 'true')
"""
```

## Data Selection and Filtering

### Basic Selection

```python
# PySpark
result = df.select("name", "age", "salary")

# SQL
"""
SELECT name, age, salary
FROM table
"""
```

### Filtering with Conditions

```python
# PySpark
result = df.filter(df.age > 30).filter(df.salary >= 50000)
# OR
result = df.filter((df.age > 30) & (df.salary >= 50000))

# SQL
"""
SELECT *
FROM table
WHERE age > 30 
AND salary >= 50000
"""
```

## Aggregations

### Basic Aggregations

```python
# PySpark
result = df.groupBy("department").agg(
    avg("salary").alias("avg_salary"),
    count("*").alias("employee_count"),
    sum("salary").alias("total_salary")
)

# SQL
"""
SELECT 
    department,
    AVG(salary) as avg_salary,
    COUNT(*) as employee_count,
    SUM(salary) as total_salary
FROM table
GROUP BY department
"""
```

### Having Clause

```python
# PySpark
result = df.groupBy("department") \
    .agg(count("*").alias("emp_count")) \
    .filter(col("emp_count") > 10)

# SQL
"""
SELECT department, COUNT(*) as emp_count
FROM table
GROUP BY department
HAVING COUNT(*) > 10
"""
```

## Joins

### Inner Join

```python
# PySpark
result = employees.join(
    departments,
    employees.dept_id == departments.id,
    "inner"
)

# SQL
"""
SELECT *
FROM employees e
INNER JOIN departments d
ON e.dept_id = d.id
"""
```

### Left Join

```python
# PySpark
result = employees.join(
    departments,
    employees.dept_id == departments.id,
    "left"
)

# SQL
"""
SELECT *
FROM employees e
LEFT JOIN departments d
ON e.dept_id = d.id
"""
```

## Window Functions

### Row Number

```python
# PySpark
from pyspark.sql.window import Window

windowSpec = Window.partitionBy("department").orderBy(desc("salary"))
result = df.withColumn("rank", row_number().over(windowSpec))

# SQL
"""
SELECT *,
    ROW_NUMBER() OVER (
        PARTITION BY department 
        ORDER BY salary DESC
    ) as rank
FROM table
"""
```

### Running Totals

```python
# PySpark
windowSpec = Window.partitionBy("department") \
    .orderBy("date") \
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

result = df.withColumn(
    "running_total",
    sum("amount").over(windowSpec)
)

# SQL
"""
SELECT *,
    SUM(amount) OVER (
        PARTITION BY department 
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as running_total
FROM table
"""
```

## Common Table Expressions (CTEs)

```python
# PySpark
df1 = df.filter(col("salary") > 50000).select("dept_id", "salary")
df2 = df1.join(departments, df1.dept_id == departments.id)

# SQL
"""
WITH high_salary_employees AS (
    SELECT dept_id, salary
    FROM employees
    WHERE salary > 50000
)
SELECT *
FROM high_salary_employees e
JOIN departments d
ON e.dept_id = d.id
"""
```

## Date Functions

### Date Operations

```python
# PySpark
result = df.withColumn(
    "next_month",
    add_months(col("date"), 1)
).withColumn(
    "date_diff",
    datediff(current_date(), col("date"))
)

# SQL
"""
SELECT *,
    ADD_MONTHS(date, 1) as next_month,
    DATEDIFF(CURRENT_DATE, date) as date_diff
FROM table
"""
```

## String Functions

### String Operations

```python
# PySpark
result = df.withColumn(
    "upper_name",
    upper(col("name"))
).withColumn(
    "name_length",
    length(col("name"))
).withColumn(
    "substring_name",
    substring(col("name"), 1, 3)
)

# SQL
"""
SELECT *,
    UPPER(name) as upper_name,
    LENGTH(name) as name_length,
    SUBSTRING(name, 1, 3) as substring_name
FROM table
"""
```

## Complex Types

### Array Operations

```python
# PySpark
result = df.withColumn(
    "array_contains_value",
    array_contains(col("array_column"), "value")
).withColumn(
    "array_length",
    size(col("array_column"))
)

# SQL
"""
SELECT *,
    ARRAY_CONTAINS(array_column, 'value') as array_contains_value,
    SIZE(array_column) as array_length
FROM table
"""
```

### Struct Operations

```python
# PySpark
result = df.select(
    col("struct_col.*"),
    col("struct_col").getField("field_name")
)

# SQL
"""
SELECT 
    struct_col.*,
    struct_col.field_name
FROM table
"""
```

## Performance Optimization

### Caching

```python
# PySpark
df.cache()
# or
df.persist()

# SQL
"""
CACHE TABLE table_name
"""
```

### Partitioning

```python
# PySpark
df.write.partitionBy("date").saveAsTable("partitioned_table")

# SQL
"""
CREATE TABLE partitioned_table
PARTITIONED BY (date)
AS SELECT * FROM source_table
"""
```

## Common Use Cases

### Deduplication

```python
# PySpark
result = df.dropDuplicates(["id", "name"])

# SQL
"""
SELECT DISTINCT id, name
FROM table
"""
```

### Pivot Operations

```python
# PySpark
pivot_df = df.groupBy("category").pivot("month").agg(sum("amount"))

# SQL
"""
SELECT *
FROM table
PIVOT (
    SUM(amount)
    FOR month IN ('Jan', 'Feb', 'Mar', ...)
)
"""
```

## Best Practices

1. **Optimization Tips**
   - Use appropriate data types
   - Leverage partitioning for large datasets
   - Cache frequently used DataFrames
   - Use broadcast joins for small tables

2. **Performance Considerations**
   - Push down predicates early in the pipeline
   - Minimize shuffles
   - Use explain() to understand query plans

```python
# View execution plan
df.explain(True)
```

3. **Memory Management**
   - Control partition sizes
   - Monitor executor memory
   - Use proper broadcast thresholds

## Error Handling

```python
# PySpark
try:
    result = df.groupBy("department").agg(...)
except Exception as e:
    print(f"Error during aggregation: {str(e)}")
    spark.stop()
```

## Useful Functions for Data Analysis

### Statistical Functions

```python
# PySpark
stats_df = df.select(
    mean("value").alias("mean"),
    stddev("value").alias("stddev"),
    percentile_approx("value", 0.5).alias("median")
)

# SQL
"""
SELECT
    AVG(value) as mean,
    STDDEV(value) as stddev,
    PERCENTILE_APPROX(value, 0.5) as median
FROM table
"""
```

This guide covers the most common operations you'll encounter when working with PySpark and their SQL equivalents. Remember that while the syntax differs, the underlying concepts remain the same. Understanding both approaches allows you to choose the most appropriate one for your specific use case.