import { ThemeConfig, ThemeColors } from '@/types/theme'

/**
 * Validates if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexColorRegex.test(color)
}

/**
 * Converts hex color to HSL values for CSS variables
 */
export function hexToHsl(hex: string): string {
  if (!isValidHexColor(hex)) {
    return '0 0% 0%' // fallback to black
  }

  // Remove # if present
  hex = hex.replace('#', '')
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }

  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Parses theme parameters from URL search params
 */
export function parseThemeFromUrl(searchParams: URLSearchParams): Partial<ThemeConfig> {
  const themeParams: Partial<ThemeConfig> = {}

  // Parse colors
  const colors: Partial<ThemeColors> = {}
  const colorParams = [
    'primary_color',
    'secondary_color', 
    'accent_color',
    'background_color',
    'text_color',
    'muted_color'
  ]

  colorParams.forEach(param => {
    const value = searchParams.get(param)
    if (value && isValidHexColor(decodeURIComponent(value))) {
      const colorKey = param.replace('_color', '') as keyof ThemeColors
      colors[colorKey] = decodeURIComponent(value)
    }
  })

  if (Object.keys(colors).length > 0) {
    themeParams.colors = colors as ThemeColors
  }

  // Parse layout
  const layout = searchParams.get('layout_type')
  if (layout === 'grid' || layout === 'list') {
    themeParams.layout = layout
  }

  // Parse font family
  const fontFamily = searchParams.get('font_family')
  if (fontFamily) {
    themeParams.fontFamily = decodeURIComponent(fontFamily)
  }

  // Parse display options
  const showDescriptions = searchParams.get('show_descriptions')
  if (showDescriptions !== null) {
    themeParams.displayOptions = {
      showDescriptions: showDescriptions === 'true'
    }
  }

  // Parse custom CSS
  const customCss = searchParams.get('custom_css')
  if (customCss) {
    themeParams.customCss = decodeURIComponent(customCss)
  }

  return themeParams
}

/**
 * Merges base theme configuration with URL overrides
 */
export function mergeThemeConfigs(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...base,
    colors: { ...base.colors, ...override.colors },
    layout: override.layout || base.layout,
    fontFamily: override.fontFamily || base.fontFamily,
    displayOptions: { ...base.displayOptions, ...override.displayOptions },
    customCss: override.customCss || base.customCss
  }
}

/**
 * Generates CSS custom properties from theme configuration
 */
export function generateCssVariables(theme: ThemeConfig): Record<string, string> {
  const cssVars: Record<string, string> = {}

  // Generate color variables in HSL format
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars[`--theme-${key}`] = hexToHsl(value)
  })

  // Font family
  cssVars['--font-body'] = theme.fontFamily

  // Layout-specific variables
  cssVars['--layout-type'] = theme.layout

  return cssVars
}

/**
 * Applies CSS variables to document root
 */
export function applyCssVariables(cssVars: Record<string, string>): void {
  const root = document.documentElement
  
  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

/**
 * Injects custom CSS into the document
 */
export function injectCustomCss(css: string, id = 'theme-custom-css'): void {
  // Remove existing custom CSS
  const existing = document.getElementById(id)
  if (existing) {
    existing.remove()
  }

  // Add new custom CSS
  if (css.trim()) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = css
    document.head.appendChild(style)
  }
}

/**
 * Default theme configuration
 */
export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#e53e3e',
    secondary: '#38a169',
    accent: '#3182ce',
    background: '#ffffff',
    text: '#1a202c',
    muted: '#718096'
  },
  layout: 'grid',
  fontFamily: 'Inter, sans-serif',
  displayOptions: {
    showDescriptions: true
  }
}
