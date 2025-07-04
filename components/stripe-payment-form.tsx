"use client"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { AlertCircle, CreditCard } from "lucide-react"

interface StripePaymentFormProps {
  amount: number // Amount in cents
  onSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  isProcessing: boolean
}

export function StripePaymentForm({ 
  amount, 
  onSuccess, 
  onError, 
  isProcessing 
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardError, setCardError] = useState<string | null>(null)
  const [isCardComplete, setIsCardComplete] = useState(false)

  const handleCardChange = async (event: any) => {
    setCardError(event.error ? event.error.message : null)
    setIsCardComplete(event.complete)
    
    // Automatically create payment method when card is complete
    if (event.complete && !event.error && stripe && elements) {
      const cardElement = elements.getElement(CardElement)
      if (cardElement) {
        try {
          const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
          })

          if (methodError) {
            onError(methodError.message || "Failed to create payment method")
          } else if (paymentMethod) {
            onSuccess(paymentMethod.id)
          }
        } catch (error) {
          onError("An unexpected error occurred. Please try again.")
        }
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError("Stripe has not loaded yet. Please try again.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError("Card element not found.")
      return
    }

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      })

      if (methodError) {
        onError(methodError.message || "Failed to create payment method")
        return
      }

      if (paymentMethod) {
        onSuccess(paymentMethod.id)
      }
    } catch (error) {
      onError("An unexpected error occurred. Please try again.")
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        fontFamily: '"Inter", sans-serif',
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true,
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center mb-3">
          <CreditCard className="w-5 h-5 mr-2" style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold text-gray-900">Card Information</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={`bg-white rounded-xl border-2 p-4 transition-colors ${
            cardError 
              ? 'border-red-300 focus-within:border-red-500' 
              : isCardComplete 
                ? 'border-theme-primary/30 focus-within:border-theme-primary'
                : 'border-gray-200 focus-within:border-theme-primary'
          }`}>
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          
          {isCardComplete && !cardError && (
            <div className="mt-3 flex items-center text-theme-primary text-sm">
              <CreditCard className="w-4 h-4 mr-1" />
              Card information is valid ✓
            </div>
          )}
          
          {cardError && (
            <div className="mt-3 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {cardError}
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500">
            Your payment information is encrypted and secure. We never store your card details.
          </div>
        </form>
      </div>

      <div className="text-center text-sm text-gray-600">
        <div className="flex items-center justify-center space-x-2">
          <span>Secured by</span>
          <span className="font-bold" style={{ color: "var(--primary)" }}>Stripe</span>
        </div>
      </div>
    </div>
  )
} 