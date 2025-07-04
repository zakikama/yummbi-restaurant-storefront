"use client"
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { useTheme } from '@/contexts/theme-context'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, ArrowLeft, Plus, Minus, Clock, Star } from 'lucide-react'
import { CartDrawerFixed } from '@/components/cart-drawer-fixed'

interface MenuItemOptionChoice {
  id: string
  name: string
  price: number
}

interface MenuItemOption {
  id: string
  name: string
  choices: MenuItemOptionChoice[]
  required: boolean
  multiSelect: boolean
}

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  original_price?: number
  options?: MenuItemOption[]
}

interface Restaurant {
  id: string
  name: string
  logo?: string
  description?: string
  address?: string
  phone?: string
  email?: string
}

type SelectedOptions = {
  [optionId: string]: string[] // always array for consistency
}

export default function MenuItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = use(params)
  const router = useRouter()
  const { theme } = useTheme()
  const { state, dispatch } = useCart()
  const [item, setItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    async function fetchMenuItem() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', itemId)
          .single()
        if (error || !data) {
          setError('Menu item not found')
          setItem(null)
          return
        }
        // Parse options from JSONB
        let options: MenuItemOption[] | undefined = undefined
        if (data.options) {
          try {
            options = typeof data.options === 'string' ? JSON.parse(data.options) : data.options
          } catch (e) {
            options = undefined
          }
        }
        setItem({
          id: data.id,
          name: data.name,
          description: data.description,
          price: Number(data.price),
          image_url: data.image_url,
          original_price: data.original_price ? Number(data.original_price) : undefined,
          options,
        })

        // Update page title dynamically
        if (data.name) {
          document.title = `${data.name} - Menu Item`
        }
        // Fetch restaurant info
        if (data.restaurant_id) {
          const { data: rest, error: restError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', data.restaurant_id)
            .single()
          if (!restError && rest) {
            setRestaurant(rest)
            
            // Update title with both item and restaurant name
            if (data.name && rest.name) {
              document.title = `${data.name} - ${rest.name}`
            }
          }
        }
      } catch (e) {
        setError('Failed to load menu item')
        setItem(null)
        // Reset title on error
        document.title = "Menu Item - Restaurant Storefront"
      } finally {
        setLoading(false)
      }
    }
    fetchMenuItem()

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = "Restaurant Storefront"
    }
  }, [itemId])

  // Calculate total price with options
  const getTotalPrice = () => {
    if (!item) return 0
    let total = item.price * quantity
    if (item.options) {
      for (const option of item.options) {
        const selected = selectedOptions[option.id] || []
        for (const choiceId of selected) {
          const choice = option.choices.find(c => c.id === choiceId)
          if (choice) total += choice.price * quantity
        }
      }
    }
    return total
  }

  // Handle option selection
  const handleOptionChange = (option: MenuItemOption, choiceId: string, checked: boolean) => {
    setSelectedOptions(prev => {
      const current = prev[option.id] || []
      if (option.multiSelect) {
        // Multi-select (checkbox)
        if (checked) {
          return { ...prev, [option.id]: [...current, choiceId] }
        } else {
          return { ...prev, [option.id]: current.filter(id => id !== choiceId) }
        }
      } else {
        // Single-select (radio)
        return { ...prev, [option.id]: [choiceId] }
      }
    })
  }

  // Check if all required options are selected
  const allRequiredSelected = !item?.options || item.options.every(option => {
    if (!option.required) return true
    return (selectedOptions[option.id] && selectedOptions[option.id].length > 0)
  })

  // Calculate savings if there's a discount
  const getSavings = () => {
    if (!item?.original_price || item.original_price <= item.price) return 0
    return (item.original_price - item.price) * quantity
  }

  const getDiscountPercentage = () => {
    if (!item?.original_price || item.original_price <= item.price) return 0
    return Math.round(((item.original_price - item.price) / item.original_price) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-theme-muted">Loading delicious details...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-red-600 mb-4">{error || 'Menu item not found'}</p>
          <Button onClick={() => router.back()} className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Check if this item is already in the cart
  const cartItem = state.items.find((cartItem) => cartItem.id === item.id)
  const hasDiscount = item.original_price && item.original_price > item.price

  // Handler for add to cart
  const handleAddToCart = async () => {
    if (!allRequiredSelected) return
    
    setIsAddingToCart(true)
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: item.id,
        name: item.name,
        price: getTotalPrice() / quantity,
        image_url: item.image_url,
      },
    })

    // Add a small delay for better UX
    setTimeout(() => {
      setIsAddingToCart(false)
    }, 500)
  }

  // Handler for sticky action bar
  const handleStickyAction = () => {
    if (cartItem) {
      dispatch({ type: 'TOGGLE_CART' })
    } else {
      handleAddToCart()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with back button - floating over image */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-900 hover:bg-white transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {hasDiscount && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {getDiscountPercentage()}% OFF
          </div>
        )}
      </div>

      {/* Hero Image Section */}
      <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Image
          src={item.image_url || '/placeholder.jpg'}
          alt={item.name}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-xl">
        <div className="p-6 space-y-6">
          {/* Product Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{item.name}</h1>
                {item.description && (
                  <p className="text-gray-600 mt-2 text-base leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-theme-primary">
                  ${getTotalPrice().toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ${(item.original_price! * quantity).toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Save ${getSavings().toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Mock ratings and prep time for visual appeal */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
                <span>(124 reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>15-20 min</span>
              </div>
            </div>
          </div>

          {/* Options Section */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-6">
              <div className="h-px bg-gray-200"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize your order</h3>
                <div className="space-y-6">
                  {item.options.map((option) => (
                    <div key={option.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{option.name}</h4>
                          {option.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {option.choices.map((choice) => {
                          const isSelected = option.multiSelect 
                            ? selectedOptions[option.id]?.includes(choice.id)
                            : selectedOptions[option.id]?.[0] === choice.id
                          
                          return (
                            <label 
                              key={choice.id} 
                              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isSelected 
                                  ? 'border-theme-primary bg-theme-primary/5' 
                                  : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {option.multiSelect ? (
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected 
                                      ? 'bg-theme-primary border-theme-primary' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                ) : (
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected 
                                      ? 'border-theme-primary' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-theme-primary"></div>
                                    )}
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">{choice.name}</span>
                              </div>
                              {choice.price > 0 && (
                                <span className="font-semibold text-theme-primary">
                                  +${choice.price.toFixed(2)}
                                </span>
                              )}
                              <input
                                type={option.multiSelect ? "checkbox" : "radio"}
                                name={option.id}
                                checked={isSelected}
                                onChange={e => handleOptionChange(option, choice.id, e.target.checked)}
                                className="sr-only"
                              />
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div className="h-px bg-gray-200"></div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity === 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors duration-200"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Spacing for sticky button */}
          <div className="h-20"></div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 shadow-lg">
        <Button
          className={`w-full h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-200 ${
            cartItem
              ? 'bg-gray-900 hover:bg-gray-800 text-white'
              : allRequiredSelected
                ? `bg-theme-primary hover:bg-theme-primary/90 text-white ${isAddingToCart ? 'scale-95' : 'hover:scale-[1.02]'}`
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleStickyAction}
          disabled={!allRequiredSelected && !cartItem}
        >
          {cartItem ? (
            <>
              <ShoppingBag className="w-5 h-5" />
              View Cart ({state.itemCount}) • ${state.total.toFixed(2)}
            </>
          ) : isAddingToCart ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding to Cart...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Cart • ${getTotalPrice().toFixed(2)}
            </>
          )}
        </Button>
      </div>

      <CartDrawerFixed hideFloatingButton onCheckout={() => {}} />
    </div>
  )
} 