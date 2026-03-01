---
name: "chart-analyzer"
description: "Analyzes academic charts/images, extracts data and generates detailed annotations. Invoke when user asks to analyze charts, extract data from images, or generate chart descriptions."
---

# Chart Analyzer

This skill provides comprehensive analysis of academic charts, graphs, and images from research papers.

## Capabilities

1. **Chart Type Recognition**: Identify chart types (line, bar, scatter, heatmap, flowchart, etc.)
2. **Data Extraction**: Extract coordinates, values, trends from charts
3. **Detailed Description**: Generate professional academic descriptions
4. **Annotation Generation**: Create标注 suggestions for chart elements
5. **Flowchart Analysis**: Analyze method flowcharts and architecture diagrams

## When to Use

Invoke this skill when:
- User wants to analyze charts/images from academic papers
- User asks to extract data from charts
- User needs detailed chart descriptions for literature analysis
- User wants to generate annotations for chart elements

## Usage

### Input Requirements
- Image file path (PNG, JPG, JPEG)
- Optional: Chart type hint or specific analysis focus

### Analysis Dimensions

1. **Basic Description**
   - Chart type and purpose
   - Main components
   - Overall trend/pattern

2. **Detailed Element Analysis**
   - Axis labels and units
   - Data points and values
   - Legend items
   - Error bars (if present)

3. **Data Extraction**
   - Numerical values
   - Statistical results
   - Comparison relationships

4. **Academic Description**
   - Formal terminology
   - Research significance
   - Key findings interpretation

## Output Format

```markdown
## Chart Analysis Report

### 1. Basic Information
- Chart Type: [type]
- Purpose: [description]

### 2. Visual Elements
- [Element descriptions]

### 3. Data Summary
- [Extracted data]

### 4. Academic Interpretation
- [Professional description]

### 5. Suggested Annotations
- [Annotation points]
```

## Integration

This skill integrates with the literature analysis system:
- Used for analyzing method flowcharts
- Used for analyzing result charts
- Generates descriptions for inclusion in reports

## API Configuration

The skill uses vision-capable models:
- Primary: glm-4v-flash (recommended)
- Fallback: Other vision models supported by the API
