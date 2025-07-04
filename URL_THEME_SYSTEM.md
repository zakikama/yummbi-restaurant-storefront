# URL Theme System Documentation

## Overview

The Yummbi storefront now supports a comprehensive URL-based theme system that allows real-time theme customization via URL parameters. This system enables preview mode functionality where themes can be dynamically overridden without modifying the database.

## Features

- **Real-time theme updates** via URL parameters
- **Preview mode** with `preview=true` parameter
- **Theme priority system**: URL parameters > Database theme > Default theme
- **CSS variable generation** for seamless styling
- **Security validation** for all theme inputs
- **Performance optimized** with minimal re-renders

## URL Parameters

### Activation
- `preview=true` - Enables preview mode and URL theme overrides

### Colors (Hex format)
- `primary_color` - Primary brand color
- `secondary_color` - Secondary brand color  
- `accent_color` - Accent/highlight color
- `background_color` - Background color
- `text_color` - Main text color
- `muted_color` - Muted/secondary text color

### Layout & Display
- `layout_type` - `grid` or `list` layout for menu items
- `font_family` - Font family name (URL encoded)
- `show_descriptions` - `true` or `false` for item descriptions
- `custom_css` - Custom CSS styles (URL encoded)

## Example URLs

### Basic Color Override
```
https://yoursite.com/restaurant123?preview=true&primary_color=%23ff6b6b&accent_color=%23feca57
```

### Complete Theme Override
```
https://yoursite.com/restaurant123?preview=true&primary_color=%23e74c3c&secondary_color=%2327ae60&accent_color=%23f39c12&background_color=%23ecf0f1&text_color=%232c3e50&muted_color=%237f8c8d&layout_type=grid&show_descriptions=false
```

### Ocean Blue Theme
```
https://yoursite.com/restaurant123?preview=true&primary_color=%230ea5e9&secondary_color=%2306b6d4&accent_color=%23f59e0b&background_color=%23f8fafc&text_color=%231e293b&muted_color=%2364748b
```

### Forest Green Theme
```
https://yoursite.com/restaurant123?preview=true&primary_color=%23059669&secondary_color=%2310b981&accent_color=%23f59e0b&background_color=%23f0fdf4&text_color=%231f2937&muted_color=%236b7280
```

### Sunset Orange Theme
```
https://yoursite.com/restaurant123?preview=true&primary_color=%23ea580c&secondary_color=%23f97316&accent_color=%23eab308&background_color=%23fffbeb&text_color=%231c1917&muted_color=%2378716c
```

## Implementation Details

### Core Components

#### 1. Theme Context (`/contexts/theme-context.tsx`)
- Manages theme state and URL parameter parsing
- Provides `useTheme()` hook for components
- Handles theme merging and CSS variable application

#### 2. Theme Utilities (`/lib/theme-utils.ts`)
- `parseThemeFromUrl()` - Extracts and validates URL parameters
- `mergeThemeConfigs()` - Combines base and override themes
- `generateCssVariables()` - Creates CSS custom properties
- `applyCssVariables()` - Applies variables to document root

#### 3. Theme Types (`/types/theme.ts`)
- TypeScript interfaces for theme configuration
- Ensures type safety across the system

### CSS Variables

The system generates CSS variables that can be used throughout the application:

```css
--theme-primary: hsl(220 100% 50%)
--theme-secondary: hsl(160 100% 40%)
--theme-accent: hsl(45 100% 50%)
--theme-background: hsl(210 20% 98%)
--theme-text: hsl(220 20% 20%)
--theme-muted: hsl(220 10% 50%)
--font-body: 'Inter, sans-serif'
--layout-type: grid
```

### Tailwind Integration

Theme colors are integrated with Tailwind CSS:

```javascript
// tailwind.config.ts
colors: {
  'theme-primary': 'hsl(var(--theme-primary))',
  'theme-secondary': 'hsl(var(--theme-secondary))',
  'theme-accent': 'hsl(var(--theme-accent))',
  'theme-background': 'hsl(var(--theme-background))',
  'theme-text': 'hsl(var(--theme-text))',
  'theme-muted': 'hsl(var(--theme-muted))'
}
```

## Usage in Components

### Using the Theme Hook
```typescript
import { useTheme } from '@/contexts/theme-context'

function MyComponent() {
  const { theme, isPreviewMode, updateTheme } = useTheme()
  
  return (
    <div className="bg-theme-background text-theme-text">
      {isPreviewMode && <div>Preview Mode Active</div>}
      <button 
        className="bg-theme-primary text-white"
        onClick={() => updateTheme({ 
          colors: { primary: '#ff0000' } 
        })}
      >
        Update Theme
      </button>
    </div>
  )
}
```

### Using CSS Variables Directly
```typescript
<div style={{ backgroundColor: `hsl(var(--theme-primary))` }}>
  Themed content
</div>
```

### Using Tailwind Classes
```typescript
<div className="bg-theme-primary text-white border-theme-accent">
  Themed with Tailwind
</div>
```

## Security Features

- **Input validation** for all URL parameters
- **Hex color validation** prevents invalid color values
- **CSS injection protection** through parameter sanitization
- **Fallback handling** for invalid or missing parameters

## Performance Optimizations

- **Minimal re-renders** through optimized context updates
- **CSS variable caching** to prevent unnecessary DOM updates
- **Debounced URL parameter parsing** for smooth transitions
- **Lazy loading** of theme resources

## Preview Mode Features

When `preview=true` is present in the URL:

1. **Visual indicator** shows preview mode is active
2. **Theme preview panel** (if enabled) shows current colors
3. **Real-time updates** as URL parameters change
4. **No database modifications** - changes are temporary
5. **Easy theme switching** through provided UI controls

## Development Tips

### Testing Themes
1. Add `?preview=true` to any restaurant URL
2. Use the theme preview panel for quick color changes
3. Modify URL parameters directly for precise control
4. Check browser developer tools for CSS variable values

### Custom Theme Creation
1. Start with base colors using URL parameters
2. Test across different screen sizes and devices
3. Ensure sufficient color contrast for accessibility
4. Validate theme with real menu content

### Integration with Existing Code
1. Replace hardcoded colors with theme CSS variables
2. Use the `useTheme()` hook for dynamic theme access
3. Implement theme-aware components using Tailwind classes
4. Test both database themes and URL overrides

## Browser Support

- **Modern browsers** with CSS custom property support
- **URL parameter parsing** works in all browsers
- **Graceful fallbacks** for unsupported features
- **Progressive enhancement** approach

## Troubleshooting

### Common Issues

1. **Colors not updating**: Check if `preview=true` is in URL
2. **Invalid colors**: Ensure hex colors are properly URL encoded
3. **Layout not changing**: Verify `layout_type` parameter value
4. **CSS not applying**: Check browser developer tools for CSS variables

### Debug Mode

Add `debug=true` to URL parameters to enable console logging:
```
?preview=true&debug=true&primary_color=%23ff0000
```

This comprehensive URL theme system provides powerful customization capabilities while maintaining security, performance, and ease of use.
