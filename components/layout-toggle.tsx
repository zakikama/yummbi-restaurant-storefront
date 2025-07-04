'use client'

import React from 'react'
import { Grid, List } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'

export function LayoutToggle() {
  const { theme, updateTheme, isPreviewMode } = useTheme()

  const toggleLayout = () => {
    const newLayout = theme.layout === 'grid' ? 'list' : 'grid'
    updateTheme({ layout: newLayout })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLayout}
      className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50"
      title={`Switch to ${theme.layout === 'grid' ? 'list' : 'grid'} view`}
    >
      {theme.layout === 'grid' ? (
        <>
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">List</span>
        </>
      ) : (
        <>
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline">Grid</span>
        </>
      )}
    </Button>
  )
}
