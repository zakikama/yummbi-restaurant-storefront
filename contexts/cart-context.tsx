"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      }

      const newItems = [...state.items, { ...action.payload, quantity: 1 }]
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen }

    case "CLOSE_CART":
      return { ...state, isOpen: false }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0, isOpen: false }

    default:
      return state
  }
}

function getInitialCartState(): CartState {
  const defaultState = { items: [], total: 0, itemCount: 0, isOpen: false }
  
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("cart")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Validate that the parsed data has the expected structure
        if (parsed && Array.isArray(parsed.items)) {
          return {
            items: parsed.items || [],
            total: parsed.total || 0,
            itemCount: parsed.itemCount || 0,
            isOpen: false // Always start with cart closed
          }
        }
      } catch {
        // If parsing fails, clear the corrupted data
        localStorage.removeItem("cart")
      }
    }
  }
  return defaultState
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialCartState)

  // Persist cart to localStorage on every change (except isOpen)
  useEffect(() => {
    const { isOpen, ...persisted } = state
    localStorage.setItem("cart", JSON.stringify(persisted))
  }, [state.items, state.total, state.itemCount])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
