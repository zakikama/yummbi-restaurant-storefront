export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  muted: string
}

export interface DisplayOptions {
  showDescriptions: boolean
}

export interface ThemeConfig {
  colors: ThemeColors
  layout: 'grid' | 'list'
  fontFamily: string
  displayOptions: DisplayOptions
  customCss?: string
}

export interface RestaurantTheme {
  id?: string
  restaurant_id?: string
  name?: string
  template?: string
  layout: 'grid' | 'list'
  colors: ThemeColors
  font_family: string
  custom_css?: string
  display_options?: DisplayOptions
  is_draft?: boolean
  parent_theme_id?: string
}

export interface ThemeContextType {
  theme: ThemeConfig
  isPreviewMode: boolean
  updateTheme: (updates: Partial<ThemeConfig>) => void
}
