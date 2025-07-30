'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ThemeConfig, ThemeContextType, RestaurantTheme } from '@/types/theme'
import { 
  parseThemeFromUrl, 
  mergeThemeConfigs, 
  generateCssVariables, 
  applyCssVariables,
  injectCustomCss,
  DEFAULT_THEME 
} from '@/lib/theme-utils'

const ThemeContext = createContext<ThemeContextType | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  restaurantTheme?: RestaurantTheme | null
  restaurantId?: string
  searchParams?: URLSearchParams | null
}

function ThemeProviderCore({ children, restaurantTheme, restaurantId, searchParams }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Convert RestaurantTheme to ThemeConfig
  const convertRestaurantTheme = useCallback((restaurantTheme: RestaurantTheme): ThemeConfig => {
    return {
      colors: restaurantTheme.colors,
      layout: restaurantTheme.layout || 'grid',
      fontFamily: restaurantTheme.font_family || 'Inter, sans-serif',
      displayOptions: restaurantTheme.display_options || { showDescriptions: true },
      customCss: restaurantTheme.custom_css
    }
  }, [])

  // Update theme when URL parameters or restaurant theme changes
  useEffect(() => {
    const preview = searchParams?.get('preview') === 'true'
    setIsPreviewMode(preview)

    // Start with base theme (restaurant theme or default)
    let baseTheme = DEFAULT_THEME
    if (restaurantTheme) {
      baseTheme = convertRestaurantTheme(restaurantTheme)
    }

    let finalTheme = baseTheme

    // Apply URL overrides if in preview mode
    if (preview && searchParams) {
      const urlThemeParams = parseThemeFromUrl(searchParams)
      if (Object.keys(urlThemeParams).length > 0) {
        finalTheme = mergeThemeConfigs(baseTheme, urlThemeParams)
      }
    }

    setTheme(finalTheme)

    // Apply CSS variables to document
    const cssVars = generateCssVariables(finalTheme)
    applyCssVariables(cssVars)

    // Apply custom CSS if present
    if (finalTheme.customCss) {
      injectCustomCss(finalTheme.customCss)
    }

  }, [searchParams, restaurantTheme, convertRestaurantTheme])

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setTheme(prevTheme => {
      const newTheme = mergeThemeConfigs(prevTheme, updates)
      
      // Apply CSS variables
      const cssVars = generateCssVariables(newTheme)
      applyCssVariables(cssVars)

      // Apply custom CSS if present
      if (newTheme.customCss) {
        injectCustomCss(newTheme.customCss)
      }

      return newTheme
    })
  }, [])

  const contextValue: ThemeContextType = {
    theme,
    isPreviewMode,
    updateTheme
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Component that handles useSearchParams with Suspense
function SearchParamsProvider({ children, restaurantTheme, restaurantId }: Omit<ThemeProviderProps, 'searchParams'>) {
  const searchParams = useSearchParams()
  
  return (
    <ThemeProviderCore 
      restaurantTheme={restaurantTheme} 
      restaurantId={restaurantId}
      searchParams={searchParams}
    >
      {children}
    </ThemeProviderCore>
  )
}

// Fallback component for when search params aren't available
function SearchParamsFallback({ children, restaurantTheme, restaurantId }: Omit<ThemeProviderProps, 'searchParams'>) {
  return (
    <ThemeProviderCore 
      restaurantTheme={restaurantTheme} 
      restaurantId={restaurantId}
      searchParams={null}
    >
      {children}
    </ThemeProviderCore>
  )
}

export function ThemeProvider({ children, restaurantTheme, restaurantId }: Omit<ThemeProviderProps, 'searchParams'>) {
  return (
    <Suspense fallback={
      <SearchParamsFallback restaurantTheme={restaurantTheme} restaurantId={restaurantId}>
        {children}
      </SearchParamsFallback>
    }>
      <SearchParamsProvider restaurantTheme={restaurantTheme} restaurantId={restaurantId}>
        {children}
      </SearchParamsProvider>
    </Suspense>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
