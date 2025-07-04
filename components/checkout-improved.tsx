"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, MapPin, CreditCard, CheckCircle, ChevronRight, Banknote, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/cart-context"
import { supabase } from "@/lib/supabase"
import { OrderProgressAnimation } from "@/components/order-progress-animation"
import { MapAddressSelector } from "@/components/map-address-selector"
import { StripePaymentForm } from "@/components/stripe-payment-form"
import { useStripe, useElements } from "@stripe/react-stripe-js"

interface CheckoutImprovedProps {
  restaurantId: string
  onClose: () => void
}

export function CheckoutImproved({ restaurantId, onClose }: CheckoutImprovedProps) {
  const { state, dispatch } = useCart()
  const stripe = useStripe()
  const elements = useElements()
  
  // Use null as initial state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState("cash")
  const [useMapSelector, setUseMapSelector] = useState(false)
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [progressStatus, setProgressStatus] = useState<"processing" | "success" | "payment_failed" | "order_failed">("processing")
  const [progressError, setProgressError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    delivery_address: "",
    building: "",
    floor: "",
    notes: "",
    lat: 0,
    lng: 0,
  })
  
  // Set mounted state to true after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const deliveryFee = 2.99
  const tax = state.total * 0.08
  const finalTotal = state.total + deliveryFee + tax

  const steps = [
    { id: 1, title: "Contact", icon: User },
    { id: 2, title: "Address", icon: MapPin },
    { id: 3, title: "Payment", icon: CreditCard },
    { id: 4, title: "Review & Confirm", icon: CheckCircle },
  ]

  const paymentMethods = [
    {
      id: "cash",
      name: "Cash on Delivery",
      description: "Pay when your order arrives",
      icon: Banknote,
      popular: true,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Pay securely online",
      icon: CreditCard,
      popular: false,
    },
    {
      id: "mobile",
      name: "Mobile Payment",
      description: "Apple Pay, Google Pay",
      icon: Smartphone,
      popular: false,
    },
  ]

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.customer_name && formData.customer_phone
      case 2:
        return formData.delivery_address
      case 3:
        if (selectedPayment === "card") {
          return paymentMethodId !== null
        }
        return selectedPayment
      case 4:
        return state.items.length > 0 && formData.customer_name && formData.customer_phone && formData.delivery_address && selectedPayment
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleAddressSelect = (addressData: {
    fullAddress: string
    lat: number
    lng: number
    streetAddress?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      delivery_address: addressData.fullAddress,
      lat: addressData.lat,
      lng: addressData.lng,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setShowProgress(true)
    setProgressStatus("processing")
    setProgressError(null)

    try {
      let paymentIntent: any = null
      
      // Handle Stripe payment if card is selected
      if (selectedPayment === "card" && paymentMethodId) {
        if (!stripe) {
          setProgressStatus("payment_failed")
          setProgressError("Stripe not loaded. Please refresh and try again.")
          setIsSubmitting(false)
          return
        }

        // Create payment intent
        const paymentResponse = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalTotal,
          }),
        })

        const { clientSecret, error: paymentError } = await paymentResponse.json()

        if (paymentError) {
          setProgressStatus("payment_failed")
          setProgressError(paymentError)
          setIsSubmitting(false)
          return
        }

        // Confirm payment with Stripe
        const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmPayment({
          clientSecret,
          redirect: "if_required",
          confirmParams: {
            payment_method: paymentMethodId,
          },
        })

        if (confirmError) {
          setProgressStatus("payment_failed")
          setProgressError(confirmError.message || "Payment failed. Please try again.")
          setIsSubmitting(false)
          return
        }

        if (confirmedPaymentIntent?.status !== "succeeded") {
          setProgressStatus("payment_failed")
          setProgressError("Payment was not completed. Please try again.")
          setIsSubmitting(false)
          return
        }

        paymentIntent = confirmedPaymentIntent
        console.log("Payment successful:", paymentIntent.id)
      }
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      // Format the complete address
      const fullAddress = `${formData.delivery_address}${formData.building ? `, ${formData.building}` : ""}${
        formData.floor ? `, Floor ${formData.floor}` : ""
      }`
      
      // Properly format the order data according to the database schema
      const orderData = {
        restaurant_id: restaurantId,
        user_id: user?.id || null, // Include user_id if authenticated
        customer_name: formData.customer_name,
        customer_email: `${formData.customer_phone.replace(/[^0-9]/g, '')}@temp.com`, // Clean phone number
        customer_phone: formData.customer_phone,
        delivery_address: fullAddress,
        delivery_coordinates: formData.lat && formData.lng ? JSON.stringify({ lat: formData.lat, lng: formData.lng }) : null, // Proper JSONB format as string
        items: state.items, // Supabase will handle the JSON conversion
        subtotal: Number(state.total.toFixed(2)), // Ensure numeric values are properly formatted
        tax: Number(tax.toFixed(2)),
        delivery_fee: Number(deliveryFee.toFixed(2)),
        total: Number(finalTotal.toFixed(2)),
        payment_method: selectedPayment,
        payment_method_id: selectedPayment === "card" ? paymentMethodId : null,
        payment_intent_id: selectedPayment === "card" && paymentIntent ? paymentIntent.id : null,
        payment_status: selectedPayment === "card" ? "completed" : "pending",
        notes: formData.notes || "",
      }

      console.log("Submitting order data:", orderData)
      
      const { data: orderResponse, error } = await supabase.from("orders").insert([orderData]).select().single()

      if (error) {
        console.error("Order error:", error)
        setProgressStatus("order_failed")
        setProgressError(error.message || 'Failed to place order. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Save current order info to localStorage for the banner
      localStorage.setItem("currentOrderId", orderResponse.id)
      localStorage.setItem("currentOrderRestaurantId", restaurantId)
      localStorage.setItem("currentOrderTimestamp", Date.now().toString())

      dispatch({ type: "CLEAR_CART" })
      setProgressStatus("success")

      // Redirect to order tracking after success animation
      setTimeout(() => {
        window.location.href = `/order/${orderResponse.id}`
      }, 3000) // Give time for the success animation to complete
    } catch (error) {
      console.error("Submit error:", error)
      setProgressStatus("order_failed")
      setProgressError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setShowProgress(false)
    setIsSubmitting(false)
    setProgressStatus("processing")
    setProgressError(null)
  }

  const handleBackToCheckout = () => {
    setShowProgress(false)
    setIsSubmitting(false)
    setProgressStatus("processing")
    setProgressError(null)
    // Reset to the payment step so user can try a different payment method
    setCurrentStep(3)
  }

  // Cart editing handlers
  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }
  const handleRemoveItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  if (showProgress) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        {mounted && (
          <OrderProgressAnimation 
            onComplete={() => setOrderComplete(true)} 
            onRetry={handleRetry}
            onBackToCheckout={handleBackToCheckout}
            status={progressStatus}
            errorMessage={progressError || undefined}
          />
        )}
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{ backgroundColor: "var(--accent-light)" }}
        >
          <CheckCircle className="w-12 h-12" style={{ color: "var(--primary)" }} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 text-center mb-2">Your order has been placed successfully</p>
        <p className="text-sm text-gray-500 text-center mb-12">We'll start preparing it right away</p>
        <Button
          onClick={onClose}
          className="text-white px-8 py-4 rounded-2xl text-lg font-semibold h-14"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl">
              {/* Header with close button */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 pb-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex-1 flex flex-col items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-1 ${currentStep === step.id ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-500'}`}>{<step.icon className="w-5 h-5" />}</div>
              <span className={`text-xs ${currentStep === step.id ? 'text-theme-primary font-bold' : 'text-gray-500'}`}>{step.title}</span>
              {idx < steps.length - 1 && <div className="w-full h-0.5 bg-gray-200 mt-1 mb-1" />}
            </div>
          ))}
        </div>
        {/* Step Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
        {currentStep === 1 && (
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">How can we reach you about your order?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base font-semibold text-gray-900 mb-2 block">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="John Doe"
                  className="h-14 text-lg rounded-2xl border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-semibold text-gray-900 mb-2 block">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="h-14 text-lg rounded-2xl border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Address</h2>
              <p className="text-gray-600">Where should we deliver your order?</p>
            </div>

            <div className="flex justify-between mb-6">
              <Button
                type="button"
                variant={useMapSelector ? "outline" : "default"}
                className={`flex-1 ${!useMapSelector ? "text-white" : ""}`}
                style={!useMapSelector ? { backgroundColor: "var(--primary)" } : {}}
                onClick={() => setUseMapSelector(false)}
              >
                Enter Manually
              </Button>
              <div className="w-4"></div>
              <Button
                type="button"
                variant={useMapSelector ? "default" : "outline"}
                className={`flex-1 ${useMapSelector ? "text-white" : ""}`}
                style={useMapSelector ? { backgroundColor: "var(--primary)" } : {}}
                onClick={() => setUseMapSelector(true)}
              >
                Use Map
              </Button>
            </div>

            {useMapSelector ? (
              <MapAddressSelector onAddressSelect={handleAddressSelect} initialAddress={formData.delivery_address} />
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="address" className="text-base font-semibold text-gray-900 mb-2 block">
                    Street Address *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, delivery_address: e.target.value }))}
                    placeholder="123 Main Street, City, State"
                    className="text-lg rounded-2xl border-gray-200 min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="building" className="text-base font-semibold text-gray-900 mb-2 block">
                      Building/Apt
                    </Label>
                    <Input
                      id="building"
                      value={formData.building}
                      onChange={(e) => setFormData((prev) => ({ ...prev, building: e.target.value }))}
                      placeholder="Apt 4B"
                      className="h-14 text-lg rounded-2xl border-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="floor" className="text-base font-semibold text-gray-900 mb-2 block">
                      Floor
                    </Label>
                    <Input
                      id="floor"
                      value={formData.floor}
                      onChange={(e) => setFormData((prev) => ({ ...prev, floor: e.target.value }))}
                      placeholder="2nd"
                      className="h-14 text-lg rounded-2xl border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Label htmlFor="notes" className="text-base font-semibold text-gray-900 mb-2 block">
                Delivery Instructions
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ring doorbell, leave at door..."
                className="text-lg rounded-2xl border-gray-200"
                rows={2}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment & Review</h2>
              <p className="text-gray-600">Choose your payment method and confirm your order</p>
            </div>

            {/* Payment Methods */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const MethodIcon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPayment(method.id)
                        setPaymentMethodId(null)
                        setStripeError(null)
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all ${
                        selectedPayment === method.id
                          ? "border-current shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderColor: selectedPayment === method.id ? "var(--primary)" : undefined,
                        backgroundColor: selectedPayment === method.id ? "var(--accent-light)" : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4"
                            style={{
                              backgroundColor: selectedPayment === method.id ? "var(--primary)" : "var(--accent-light)",
                            }}
                          >
                            <MethodIcon
                              className="w-6 h-6"
                              style={{
                                color: selectedPayment === method.id ? "white" : "var(--primary)",
                              }}
                            />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center">
                              <p className="font-bold text-gray-900">{method.name}</p>
                              {method.popular && (
                                <span
                                  className="ml-2 px-2 py-1 text-xs font-bold text-white rounded-full"
                                  style={{ backgroundColor: "var(--primary)" }}
                                >
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPayment === method.id ? "border-current" : "border-gray-300"
                          }`}
                          style={{
                            borderColor: selectedPayment === method.id ? "var(--primary)" : undefined,
                          }}
                        >
                          {selectedPayment === method.id && (
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stripe Payment Form - Show when card is selected */}
            {selectedPayment === "card" && (
              <div className="mb-8">
                <StripePaymentForm
                  amount={finalTotal}
                  onSuccess={(paymentMethodId) => {
                    setPaymentMethodId(paymentMethodId)
                    setStripeError(null)
                  }}
                  onError={(error) => {
                    setStripeError(error)
                    setPaymentMethodId(null)
                  }}
                  isProcessing={isSubmitting}
                />
                {stripeError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-600 text-sm">{stripeError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Order Summary - Concise */}
            <div className="space-y-4">
              {/* Items Summary */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900">
                    {state.itemCount} item{state.itemCount !== 1 ? "s" : ""}
                  </h3>
                  <span className="font-bold" style={{ color: "var(--primary)" }}>
                    ${state.total.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1">
                  {state.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {state.items.length > 2 && (
                    <p className="text-xs text-gray-500">+{state.items.length - 2} more items</p>
                  )}
                </div>
              </div>

              {/* Delivery Info - Concise */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-bold text-gray-900 mb-2">Delivery Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">{formData.customer_name}</span> • {formData.customer_phone}
                  </p>
                  <p className="line-clamp-2">
                    {formData.delivery_address}
                    {formData.building && `, ${formData.building}`}
                    {formData.floor && `, Floor ${formData.floor}`}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--accent-light)" }}>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery + Tax</span>
                    <span>${(deliveryFee + tax).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between" style={{ borderColor: "var(--primary-light)" }}>
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl" style={{ color: "var(--primary)" }}>
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Review & Confirm</h2>
            {/* Cart Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Your Cart</h3>
              {state.items.length === 0 ? (
                <p className="text-theme-muted">Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <div className="font-semibold text-theme-text">{item.name}</div>
                        <div className="text-sm text-theme-muted">Qty: {item.quantity}</div>
                        <div className="text-sm text-theme-muted">${item.price.toFixed(2)} each</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity === 1}>-</Button>
                        <span className="font-semibold">{item.quantity}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveItem(item.id)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="text-sm text-theme-muted">Contact: {formData.customer_name} ({formData.customer_phone})</div>
              <div className="text-sm text-theme-muted">Address: {formData.delivery_address}{formData.building && ", " + formData.building}{formData.floor && ", Floor " + formData.floor}</div>
              <div className="text-sm text-theme-muted">Payment: {paymentMethods.find(m => m.id === selectedPayment)?.name}</div>
              <div className="flex justify-between mt-2"><span>Subtotal</span><span>${state.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </div>
        {/* Step Navigation */}
        <div className="bg-white border-t border-gray-100 p-6 flex gap-3">
        {currentStep > 1 && (
          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={isSubmitting}>Back</Button>
        )}
        {currentStep < steps.length && (
          <Button onClick={handleNext} disabled={!validateStep(currentStep) || isSubmitting} className="flex-1">Next</Button>
        )}
        {currentStep === steps.length && (
          <Button onClick={handleSubmit} disabled={!validateStep(currentStep) || isSubmitting} className="flex-1">{isSubmitting ? 'Placing Order...' : 'Place Order'}</Button>
        )}
        </div>
      </div>
    </div>
  )
}
