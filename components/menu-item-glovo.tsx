"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"
import Link from "next/link"


interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  original_price?: number
}

interface MenuItemProps {
  item: MenuItem
  layout?: 'grid' | 'list' | 'horizontal'
  showDescription?: boolean
  isDesktop?: boolean
  onItemClick?: (itemId: string) => void
}

export function MenuItemGlovo({ item, layout = 'list', showDescription = true, isDesktop = false, onItemClick }: MenuItemProps) {
  const { state, dispatch } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const cartItem = state.items?.find((cartItem) => cartItem.id === item.id)
  const quantity = cartItem?.quantity || 0

  const addToCart = () => {
    setIsAdding(true)
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
      },
    })
    setTimeout(() => setIsAdding(false), 300)
  }

  const hasDiscount = item.original_price && item.original_price > item.price

  // Horizontal layout (Glovo style)
  if (layout === 'horizontal') {
    const handleClick = (e: React.MouseEvent) => {
      if (isDesktop && onItemClick) {
        e.preventDefault()
        onItemClick(item.id)
      }
      // For mobile or when no custom handler, let the Link handle navigation
    }

    return (
      <Link 
        href={`/menu-item/${item.id}`} 
        onClick={handleClick}
        className="block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-theme-primary"
      >
        <div className="flex items-center p-4">
          {/* Content */}
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-theme-primary transition-colors duration-200">{item.name}</h3>
            {showDescription && item.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.description}</p>
            )}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-gray-900">
                ${item.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-gray-500 text-sm line-through">
                  ${item.original_price!.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          {/* Image */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={item.image_url || "/placeholder.svg?height=96&width=96"}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                -{Math.round(((item.original_price! - item.price) / item.original_price!) * 100)}%
              </div>
            )}
            
            {/* Add Button */}
            <div className="absolute bottom-2 right-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (isDesktop && onItemClick) {
                    onItemClick(item.id)
                  } else {
                    // On mobile, navigate to product page
                    window.location.href = `/menu-item/${item.id}`
                  }
                }}
                className={`w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 ${
                  isAdding ? 'scale-110' : 'hover:scale-110'
                }`}
              >
                {quantity > 0 ? (
                  <span className="text-xs font-bold text-theme-primary">{quantity}</span>
                ) : (
                  <Plus className="w-4 h-4 text-theme-primary" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (layout === 'grid') {
    return (
      <Link href={`/menu-item/${item.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-theme-primary">
        {/* Image */}
        <div className={`relative w-full bg-gray-100 overflow-hidden ${isDesktop ? 'h-56' : 'h-48'}`}>
          <Image
            src={item.image_url || "/placeholder.svg?height=192&width=300"}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              -{Math.round(((item.original_price! - item.price) / item.original_price!) * 100)}%
            </div>
          )}
        </div>
        {/* Content */}
        <div className={`${isDesktop ? 'p-6' : 'p-4'}`}>
          <h3 className={`font-semibold text-theme-text mb-2 line-clamp-2 group-hover:text-theme-primary transition-colors duration-200 ${isDesktop ? 'text-xl' : 'text-lg'}`}>{item.name}</h3>
          {showDescription && item.description && (
            <p className={`text-theme-muted line-clamp-3 mb-3 ${isDesktop ? 'text-base' : 'text-sm'}`}>{item.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-theme-primary ${isDesktop ? 'text-xl' : 'text-lg'}`}>
                ${item.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className={`text-theme-muted line-through ${isDesktop ? 'text-base' : 'text-sm'}`}>
                  ${item.original_price!.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // List layout (original design)
  return (
    <Link href={`/menu-item/${item.id}`} className="flex py-4 items-center hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary">
      {/* Image */}
      <div className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={item.image_url || "/placeholder.svg?height=80&width=80"}
          alt={item.name}
          fill
          className="object-cover"
        />
        {hasDiscount && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5">
            -{Math.round(((item.original_price! - item.price) / item.original_price!) * 100)}%
          </div>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 px-3">
        <h3 className="font-semibold text-theme-text">{item.name}</h3>
        {showDescription && item.description && <p className="text-theme-muted text-sm line-clamp-2 mt-1">{item.description}</p>}
        <div className="flex items-center mt-1">
          <span className="font-bold text-theme-primary">
            ${item.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-theme-muted text-sm line-through ml-2">${item.original_price!.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
