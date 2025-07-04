"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { useTheme } from '@/contexts/theme-context'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { X, Plus, Minus } from 'lucide-react'

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

type SelectedOptions = {
  [optionId: string]: string[]
}

interface MenuItemModalProps {
  itemId: string
  isOpen: boolean
  onClose: () => void
}

export function MenuItemModal({ itemId, isOpen, onClose }: MenuItemModalProps) {
  const { theme } = useTheme()
  const { dispatch } = useCart()
  const [item, setItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !itemId) return

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
      } catch (e) {
        setError('Failed to load menu item')
        setItem(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItem()
  }, [itemId, isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1)
      setSelectedOptions({})
      setItem(null)
      setError(null)
    }
  }, [isOpen])

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

  const handleAddToCart = () => {
    if (!item || !allRequiredSelected) return

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: item.id,
        name: item.name,
        price: getTotalPrice() / quantity,
        image_url: item.image_url,
      },
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : error || !item ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Menu item not found'}</p>
              <Button onClick={onClose} variant="outline">Close</Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full max-h-[90vh]">
            {/* Left Side - Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Complete your order</h2>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Product Info */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-gray-600 mb-4">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-900">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.original_price && item.original_price > item.price && (
                      <span className="text-gray-500 line-through text-lg">
                        ${item.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Options */}
                {item.options && item.options.length > 0 && (
                  <div className="space-y-6">
                    {item.options.map((option) => (
                      <div key={option.id}>
                        <div className="font-semibold text-gray-900 mb-3 flex items-center">
                          {option.name}
                          {option.required && <span className="ml-2 text-xs text-red-500">Required</span>}
                        </div>
                        <div className="space-y-2">
                          {option.choices.map((choice) => (
                            <label key={choice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-3">
                                {option.multiSelect ? (
                                  <input
                                    type="checkbox"
                                    checked={selectedOptions[option.id]?.includes(choice.id) || false}
                                    onChange={e => handleOptionChange(option, choice.id, e.target.checked)}
                                    className="w-4 h-4 text-theme-primary border-gray-300 rounded focus:ring-theme-primary"
                                  />
                                ) : (
                                  <input
                                    type="radio"
                                    name={option.id}
                                    checked={selectedOptions[option.id]?.[0] === choice.id}
                                    onChange={() => handleOptionChange(option, choice.id, true)}
                                    className="w-4 h-4 text-theme-primary border-gray-300 focus:ring-theme-primary"
                                  />
                                )}
                                <span className="text-gray-900 font-medium">{choice.name}</span>
                              </div>
                              {choice.price > 0 && (
                                <span className="text-theme-primary font-medium">
                                  +${choice.price.toFixed(2)}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Section */}
              <div className="border-t border-gray-100 p-6">
                {/* Quantity Selector */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 rounded-full p-0"
                    disabled={quantity === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <Button
                    onClick={() => setQuantity(q => q + 1)}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 rounded-full p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!allRequiredSelected}
                  className="w-full h-12 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-lg text-base font-medium"
                >
                  Add {quantity} for ${getTotalPrice().toFixed(2)}
                </Button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="w-96 bg-gray-100 relative">
              <Image
                src={item.image_url || '/placeholder.jpg'}
                alt={item.name}
                fill
                className="object-cover"
              />
              {item.original_price && item.original_price > item.price && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{Math.round(((item.original_price - item.price) / item.original_price) * 100)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 