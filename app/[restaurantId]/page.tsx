"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { CartProvider } from "@/contexts/cart-context"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"
import { CartDrawerFixed } from "@/components/cart-drawer-fixed"
import { CheckoutImproved } from "@/components/checkout-improved"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { CurrentOrderBanner } from "@/components/current-order-banner"
import { MenuItemGlovo } from "@/components/menu-item-glovo"
import { RestaurantTheme } from "@/types/theme"
import { ThemePreviewDemo } from "@/components/theme-preview-demo"
import { LayoutToggle } from "@/components/layout-toggle"
import { MenuItemModal } from "@/components/menu-item-modal"

interface Restaurant {
  id: string
  name: string
  description?: string
  logo?: string
  address?: string
  phone?: string
}

interface Category {
  id: string
  name: string
  description?: string
}

interface MenuItem {
  id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  original_price?: number
  featured?: boolean
}

// Inner component that uses the theme context
function RestaurantPageContent() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const mobileCategoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const { theme, isPreviewMode } = useTheme()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch restaurant
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", restaurantId)
          .single()

        if (restaurantError) throw restaurantError

        setRestaurant(restaurantData)

        // Update page title dynamically
        if (restaurantData?.name) {
          document.title = `${restaurantData.name} - Order Online`
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("order", { ascending: true })

        if (categoriesError) throw categoriesError

        setCategories(categoriesData || [])

        if (categoriesData && categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }

        // Fetch menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .eq("available", true)
          .order("order", { ascending: true })

        if (menuItemsError) throw menuItemsError

        setMenuItems(menuItemsData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load restaurant data")
        // Reset title on error
        document.title = "Restaurant Storefront"
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = "Restaurant Storefront"
    }
  }, [restaurantId])

  // Update header height when it changes
  const updateHeaderHeight = () => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }

  useEffect(() => {
    updateHeaderHeight()
    window.addEventListener("resize", updateHeaderHeight)
    return () => window.removeEventListener("resize", updateHeaderHeight)
  }, [restaurant, categories])

  // Set up intersection observer for category navigation
  useEffect(() => {
    if (categories.length === 0) return

    // Add a small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      const isDesktop = window.innerWidth >= 1024
      const observerOptions = {
        root: isDesktop ? document.querySelector('.main-content-scroll') : null,
        rootMargin: isDesktop ? '-100px 0px -60% 0px' : `-${headerHeight + 20}px 0px -60% 0px`,
        threshold: 0.1,
      }

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Extract category ID from either desktop or mobile format
            const categoryId = entry.target.id
              .replace("category-", "")
              .replace("-desktop", "")
              .replace("-mobile", "")
            setSelectedCategory(categoryId)
          }
        })
      }

      const observer = new IntersectionObserver(observerCallback, observerOptions)

      // Observe all category sections using the appropriate refs
      const refsToUse = isDesktop ? categoryRefs.current : mobileCategoryRefs.current
      Object.keys(refsToUse).forEach((categoryId) => {
        if (refsToUse[categoryId]) {
          observer.observe(refsToUse[categoryId]!)
        }
      })

      return () => observer.disconnect()
    }, 100)

    return () => clearTimeout(timer)
  }, [categories, headerHeight])

  // Helper function to adjust color brightness
  function adjustColor(color: string, amount: number, lighten = false): string {
    const usePound = color[0] === "#"
    const col = usePound ? color.slice(1) : color
    const num = parseInt(col, 16)
    let r = (num >> 16) + amount
    let g = ((num >> 8) & 0x00ff) + amount
    let b = (num & 0x0000ff) + amount

    if (lighten) {
      r = Math.min(255, r)
      g = Math.min(255, g)
      b = Math.min(255, b)
    } else {
      r = Math.max(0, r)
      g = Math.max(0, g)
      b = Math.max(0, b)
    }

    return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")
  }

  // Handle category click
  function handleCategoryClick(categoryId: string) {
    console.log('Category clicked:', categoryId)
    
    // Immediately set the selected category (don't wait for intersection observer)
    setSelectedCategory(categoryId)
    
    // Then scroll to it
    scrollToCategory(categoryId)
  }

  // Scroll to category section
  function scrollToCategory(categoryId: string) {
    // Check if we're on desktop or mobile
    const isDesktop = window.innerWidth >= 1024 // lg breakpoint
    
    // Use the appropriate refs based on device
    const element = isDesktop ? categoryRefs.current[categoryId] : mobileCategoryRefs.current[categoryId]
    console.log('Scrolling to category:', categoryId, 'Element found:', !!element, 'Desktop:', isDesktop)
    
    if (element) {
      if (isDesktop) {
        // For desktop: find the scrollable container and scroll within it
        const mainContentContainer = document.querySelector('.main-content-scroll')
        console.log('Desktop mode, container found:', !!mainContentContainer)
        
        if (mainContentContainer) {
          const containerRect = mainContentContainer.getBoundingClientRect()
          const elementRect = element.getBoundingClientRect()
          const scrollTop = mainContentContainer.scrollTop
          const targetPosition = scrollTop + (elementRect.top - containerRect.top) - 100
          
          console.log('Scrolling to position:', targetPosition)
          
          mainContentContainer.scrollTo({ 
            top: targetPosition,
            behavior: "smooth" 
          })
        }
      } else {
        // For mobile: use the original logic
        const yOffset = -headerHeight - 10
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }
  }

  // Handle item click for desktop
  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId)
    setShowProductModal(true)
  }

  // Group menu items by category
  const menuItemsByCategory = categories.map((category) => ({
    ...category,
    items: menuItems.filter((item) => item.category_id === category.id),
  }))

 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-theme-muted">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Restaurant not found"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-background">
      {showCheckout && <CheckoutImproved restaurantId={restaurantId} onClose={() => setShowCheckout(false)} />}
      
      {/* Product Modal for Desktop */}
      {selectedItemId && (
        <MenuItemModal 
          itemId={selectedItemId}
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false)
            setSelectedItemId(null)
          }}
        />
      )}

      {/* Desktop Layout - Glovo Style */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Sidebar - Compact Categories (Glovo style) */}
        <div className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
          {/* Restaurant Header - Compact */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {restaurant.logo && (
                <div className="flex-shrink-0">
                  <Image
                    src={restaurant.logo}
                    alt={`${restaurant.name} logo`}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-theme-text">{restaurant.name}</h1>
              </div>
            </div>
          </div>

          {/* Sections Header */}
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-theme-primary rounded-full mr-2"></div>
              Categories
            </h3>
          </div>

          {/* Category Navigation - Compact List */}
          {categories.length > 0 && (
            <div className="px-4 pb-4">
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      selectedCategory === category.id
                        ? "bg-theme-primary text-white font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-64 mr-80 overflow-y-auto h-screen main-content-scroll">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Restaurant Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
              )}
              
              {/* Restaurant Info Bar */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-theme-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Open</span>
                </div>
                <span>25-40 min</span>
                <span>Free delivery</span>
              </div>

              {/* Current Order Banner */}
              <CurrentOrderBanner 
                restaurantId={restaurantId}
                primaryColor={theme.colors.primary} 
                accentColor={theme.colors.accent}
              />
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={`Search in ${restaurant.name}`}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary"
                />
              </div>
            </div>

            {/* Menu Sections */}
            {menuItemsByCategory.map((category) => (
              <div
                key={category.id}
                ref={(el) => { categoryRefs.current[category.id] = el }}
                className="mb-8"
                id={`category-${category.id}-desktop`}
              >
                {/* Category Header */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h2>
                  {category.description && theme.displayOptions.showDescriptions && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>

                {/* Category Items - Horizontal Cards (Glovo style) */}
                {category.items.length > 0 ? (
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <MenuItemGlovo 
                        key={item.id} 
                        item={item} 
                        layout="horizontal"
                        showDescription={theme.displayOptions.showDescriptions}
                        isDesktop={true}
                        onItemClick={handleItemClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No items available in this category</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Fixed Header */}
        <header
          ref={headerRef}
          className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm"
        >
        {/* Restaurant Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="flex items-center space-x-3 p-4">
            {restaurant.logo && (
              <div className="flex-shrink-0">
                <Image
                  src={restaurant.logo}
                  alt={`logo`}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-theme-text">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-theme-muted text-sm line-clamp-1">{restaurant.description}</p>
              )}
            </div>
            
          </div>
        </div>

        {/* Current Order Banner in Header */}
        <div className="border-b border-gray-100 bg-white" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <CurrentOrderBanner 
            restaurantId={restaurantId}
            primaryColor={theme.colors.primary} 
            accentColor={theme.colors.accent}
          />
        </div>

        {/* Category Navigation */}
        {categories.length > 0 && (
          <div className="border-b border-gray-200 bg-white">
            <div className="flex space-x-1 overflow-x-auto px-4 py-3 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ease-in-out transform ${
                    selectedCategory === category.id
                      ? "font-semibold text-white scale-105 shadow-lg bg-theme-primary"
                      : "font-medium text-theme-text bg-gray-100 hover:bg-gray-200 hover:scale-102"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content with proper top margin */}
      <div style={{ marginTop: `${headerHeight + (isPreviewMode ? 40 : 0)}px` }}>
        {/* Menu Items by Category */}
        <div className="pb-28">
          {menuItemsByCategory.map((category) => (
            <div
              key={category.id}
              ref={(el) => { mobileCategoryRefs.current[category.id] = el }}
              className="mb-6"
              id={`category-${category.id}-mobile`}
            >
              {/* Category Header - Sticky */}
              <div
                className="sticky bg-white z-20 px-4 py-3 border-b border-gray-100 shadow-sm"
                style={{ top: `${headerHeight + (isPreviewMode ? 40 : 0)}px` }}
              >
                <h2 className="text-lg font-bold text-theme-text">{category.name}</h2>
                {category.description && theme.displayOptions.showDescriptions && (
                  <p className="text-sm text-theme-muted">{category.description}</p>
                )}
              </div>

              {/* Category Items */}
              <div className="px-4">
                {category.items.length > 0 ? (
                  <div className={
                    theme.layout === 'grid' 
                      ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4' 
                      : 'divide-y divide-gray-100'
                  }>
                    {category.items.map((item) => (
                      <MenuItemGlovo 
                        key={item.id} 
                        item={item} 
                        layout={theme.layout}
                        showDescription={theme.displayOptions.showDescriptions}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-theme-muted">No items available in this category</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Removed ThemePreviewDemo */}
      </div>

      {/* Single Cart Component handles both mobile and desktop */}
      <CartDrawerFixed onCheckout={() => setShowCheckout(true)} />
    </div>
  )
}

// Main component with theme provider
export default function RestaurantPage() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const [restaurantTheme, setRestaurantTheme] = useState<RestaurantTheme | null>(null)

  useEffect(() => {
    async function fetchTheme() {
      try {
        const { data: themeData } = await supabase
          .from("restaurant_themes")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .eq("is_draft", false)
          .single()

        if (themeData) {
          setRestaurantTheme(themeData)
        }
      } catch (err) {
        console.error("Error fetching theme:", err)
      }
    }

    fetchTheme()
  }, [restaurantId])

  return (
    <CartProvider>
      <ThemeProvider restaurantTheme={restaurantTheme} restaurantId={restaurantId}>
        <RestaurantPageContent />
      </ThemeProvider>
    </CartProvider>
  )
}
