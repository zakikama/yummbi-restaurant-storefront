"use client"

import { ShoppingBag, Plus, Minus, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"

interface CartDrawerFixedProps {
  onCheckout: () => void
  hideFloatingButton?: boolean
}

export function CartDrawerFixed({ onCheckout, hideFloatingButton = false }: CartDrawerFixedProps) {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const deliveryFee = 2.99
  const tax = state.total * 0.08
  const finalTotal = state.total + deliveryFee + tax

  return (
    <>
      {/* Mobile Floating Cart Button */}
      {!hideFloatingButton && state.itemCount > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <Button
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            className="w-full text-white h-14 rounded-full bg-theme-primary shadow-lg flex items-center justify-between px-6"
          >
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2 mr-3">
                <ShoppingBag className="w-5 h-5 text-theme-primary" />
              </div>
              <span className="font-bold">{state.itemCount}</span>
            </div>
            <div className="font-bold text-lg">${state.total.toFixed(2)}</div>
          </Button>
        </div>
      )}

      {/* Desktop Cart Content - Integrated with right sidebar */}
      <div className="hidden lg:block">
        {state.itemCount === 0 ? (
          <div className="fixed right-0 top-0 w-80 h-full bg-white border-l border-gray-200 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">You haven't added any products yet. When you do, you'll see them here!</p>
            </div>
          </div>
        ) : (
          <div className="fixed right-0 top-0 w-80 h-full bg-white border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
                             <p className="text-sm text-gray-600">Delivered directly by the establishment. 
                <button className="text-theme-primary hover:underline ml-1">Learn more</button>
               </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="w-12 h-12 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image_url || "/placeholder.svg?height=48&width=48"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-2 py-1">
                          <Button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 rounded-full hover:bg-gray-200"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </Button>
                          <span className="font-medium text-sm min-w-[20px] text-center text-gray-900">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 rounded-full hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </Button>
                        </div>
                        <span className="font-semibold text-sm text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


            </div>

            {/* Checkout Section */}
            <div className="border-t border-gray-100 p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-base text-gray-900">Total</span>
                  <span className="font-bold text-base text-gray-900">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={onCheckout}
                className="w-full text-white h-12 bg-theme-primary hover:opacity-90 rounded-lg text-sm font-medium"
              >
                Go to checkout
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cart Sheet */}
      <Sheet open={state.isOpen} onOpenChange={() => dispatch({ type: "TOGGLE_CART" })}>
        <SheetContent side="bottom" className="lg:hidden h-[85vh] rounded-t-3xl p-0 border-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold text-gray-900">Your Order</SheetTitle>
              </div>
            </SheetHeader>
            {/* Items - with reduced max height to ensure checkout button is visible */}
            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(100% - 200px)" }}>
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "var(--accent-light)" }}
                  >
                    <ShoppingBag className="w-8 h-8" style={{ color: "var(--primary)" }} />
                  </div>
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.image_url || "/placeholder.svg?height=64&width=64"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h4>
                        <p className="font-bold text-base" style={{ color: "var(--primary)" }}>
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 border border-gray-200 rounded-full px-2 py-1">
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" style={{ color: "var(--primary)" }} />
                        </Button>
                        <span className="font-semibold text-sm min-w-[20px] text-center text-gray-900">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" style={{ color: "var(--primary)" }} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Section - Always visible at bottom */}
            {state.items.length > 0 && (
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery fee</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    dispatch({ type: "CLOSE_CART" })
                    onCheckout()
                  }}
                  className="w-full text-white h-12 bg-theme-primary rounded-full text-base font-bold"
                  
                >
                  Go to checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
