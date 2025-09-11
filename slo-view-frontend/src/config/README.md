# Context Configuration

This directory contains configuration for the map context system that determines what data is included when sending prompts to the Gemini AI.

## Configuration Files

### `contextConfig.ts`

Contains the main configuration system for controlling what data is included in AI prompts.

## Available Configurations

### 1. `DEFAULT_CONTEXT_CONFIG` (Current Default)
- **Coordinates**: ❌ Excluded (LLMs struggle with geometric understanding)
- **OSM IDs**: ❌ Excluded (technical details not useful for users)
- **Geometry**: ❌ Excluded (complex data)
- **Type Details**: ✅ Included (amenity types, highway types, categories)
- **Names**: ✅ Included (essential for user understanding)
- **Max Items**: 15-20 per layer

### 2. `COORDINATES_CONFIG`
- Same as default but **includes coordinates**
- Useful for advanced use cases where location precision matters

### 3. `MINIMAL_CONFIG`
- **Names only** - most basic information
- Excludes location, search radius, and type details
- Max 10 items per layer
- Good for very simple prompts

### 4. `DETAILED_CONFIG`
- Includes **OSM IDs** and more technical details
- Higher item limits (25-30 per layer)
- Good for technical analysis

## How to Change Configuration

Edit the `getContextConfig()` function in `contextConfig.ts`:

```typescript
export function getContextConfig(): ContextConfig {
  // Current: return DEFAULT_CONTEXT_CONFIG;
  
  // To use coordinates:
  return COORDINATES_CONFIG;
  
  // To use minimal data:
  // return MINIMAL_CONFIG;
  
  // To use detailed data:
  // return DETAILED_CONFIG;
}
```

## Configuration Options

### General Context
- `includeLocation`: Show coordinates in context
- `includeSearchRadius`: Show search radius
- `includeLayerInfo`: Show active layer name
- `includeDataCount`: Show number of items found

### Data Fields (per layer type)
- `includeCoordinates`: Include lat/lon coordinates
- `includeOsmId`: Include OpenStreetMap IDs
- `includeGeometry`: Include geometry data
- `includeTypeDetails`: Include amenity/highway/category info
- `includeName`: Include place names
- `maxItems`: Maximum number of items to include

## Example Context Outputs

### Default Configuration (No Coordinates)
```
--- MAP CONTEXT ---
Location: San Luis Obispo County, CA (35.2828, -120.6596)
Search Radius: 0.2 km
Active Layer: restaurants

RESTAURANTS (5 found):
1. **McDonald's** - Type: fast_food
2. **Starbucks** - Type: cafe
3. **Subway** - Type: fast_food
...
--- END MAP CONTEXT ---
```

### With Coordinates
```
--- MAP CONTEXT ---
Location: San Luis Obispo County, CA (35.2828, -120.6596)
Search Radius: 0.2 km
Active Layer: restaurants

RESTAURANTS (5 found):
1. **McDonald's** (35.2834, -120.6601) - Type: fast_food
2. **Starbucks** (35.2829, -120.6598) - Type: cafe
...
--- END MAP CONTEXT ---
```

### Minimal Configuration
```
--- MAP CONTEXT ---
Active Layer: restaurants

RESTAURANTS:
1. **McDonald's**
2. **Starbucks**
3. **Subway**
...
--- END MAP CONTEXT ---
```

## Future Enhancements

- **Dynamic Configuration**: Based on prompt content analysis
- **User Preferences**: Allow users to customize what data is included
- **Context-Aware**: Different configs for different types of questions
- **Performance Tuning**: Automatic optimization based on prompt length
