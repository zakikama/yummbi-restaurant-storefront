"use client"

import { useEffect, useState, useRef } from "react"
import { CheckCircle, Clock, CreditCard, Utensils, Truck, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type ProgressStatus = "processing" | "success" | "payment_failed" | "order_failed"

interface OrderProgressAnimationProps {
  onComplete: () => void
  onRetry?: () => void
  onBackToCheckout?: () => void
  status?: ProgressStatus
  errorMessage?: string
}

export function OrderProgressAnimation({ 
  onComplete, 
  onRetry, 
  onBackToCheckout,
  status = "processing", 
  errorMessage 
}: OrderProgressAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [allStepsComplete, setAllStepsComplete] = useState(false)
  const [failedStep, setFailedStep] = useState<number | null>(null)
  const animationCompleted = useRef(false)

  const steps = [
    { icon: CreditCard, label: "Processing payment", duration: 1000, key: "payment" },
    { icon: Utensils, label: "Confirming order", duration: 800, key: "order" },
    { icon: Clock, label: "Estimating delivery", duration: 600, key: "delivery" },
    { icon: Truck, label: "Notifying restaurant", duration: 500, key: "notification" },
  ]

  useEffect(() => {
    // Prevent re-running the animation if it's already completed
    if (animationCompleted.current) return

    const timeouts: NodeJS.Timeout[] = []
    let progressInterval: NodeJS.Timeout | null = null

    // Handle different status scenarios
    if (status === "payment_failed") {
      // Show payment step as failed immediately
      setCurrentStep(1)
      setFailedStep(0)
      setProgress(25) // Partial progress for payment step
      return
    }

    if (status === "order_failed") {
      // Show payment success but order failed
      setCurrentStep(2)
      setFailedStep(1)
      setProgress(50) // Progress up to order step
      return
    }

    if (status === "success" || status === "processing") {
      // Start progress animation for processing/success
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 2, 100)
          return newProgress
        })
      }, 30)

      // Animate through steps
      let cumulativeTime = 500 // Start delay
      steps.forEach((step, index) => {
        const timeout = setTimeout(() => {
          setCurrentStep(index + 1)
        }, cumulativeTime)
        timeouts.push(timeout)
        cumulativeTime += step.duration
      })

      // Mark all steps as complete for success
      if (status === "success") {
        const allCompleteTimeout = setTimeout(() => {
          setAllStepsComplete(true)
        }, cumulativeTime + 200)
        timeouts.push(allCompleteTimeout)

        // Complete animation and call onComplete
        const completeTimeout = setTimeout(() => {
          if (progressInterval) clearInterval(progressInterval)
          animationCompleted.current = true
          onComplete()
        }, cumulativeTime + 800)
        timeouts.push(completeTimeout)
      }
    }

    return () => {
      timeouts.forEach(clearTimeout)
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [onComplete, status])

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-10">
            <div
              className="h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--primary)",
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep > index + 1 || allStepsComplete
              const isCurrent = currentStep === index + 1 && !allStepsComplete && failedStep === null
              const isFailed = failedStep === index

              return (
                <div key={index} className="flex items-center space-x-5">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isFailed
                        ? "bg-red-500 text-white scale-110"
                        : isActive
                          ? "text-white scale-110"
                          : isCurrent
                            ? "text-white scale-105"
                            : "bg-gray-100 text-gray-400"
                    }`}
                    style={{
                      backgroundColor: isFailed 
                        ? "#ef4444" 
                        : isActive || isCurrent 
                          ? "var(--primary)" 
                          : undefined,
                      boxShadow: isActive || isCurrent || isFailed ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : undefined,
                    }}
                  >
                    {isFailed ? (
                      <XCircle className="w-6 h-6" />
                    ) : isActive ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${isCurrent ? "animate-pulse" : ""}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold transition-all duration-300 ${
                        isFailed 
                          ? "text-red-600" 
                          : isActive 
                            ? "text-gray-900" 
                            : isCurrent 
                              ? "text-gray-900" 
                              : "text-gray-400"
                      }`}
                    >
                      {isFailed ? 
                        step.key === "payment" ? "Payment failed" : "Order failed"
                        : step.label
                      }
                    </p>
                    {isCurrent && !allStepsComplete && failedStep === null && (
                      <div className="flex items-center mt-1">
                        <div className="flex space-x-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ backgroundColor: "var(--primary)", animationDelay: "0ms" }}
                          />
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ backgroundColor: "var(--primary)", animationDelay: "150ms" }}
                          />
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ backgroundColor: "var(--primary)", animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    )}
                    {isFailed && errorMessage && (
                      <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center">
          {status === "payment_failed" ? (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">
                {errorMessage || "There was an issue processing your payment. Please try again."}
              </p>
              {onRetry && (
                <div className="space-y-3">
                  <Button 
                    onClick={onRetry}
                    className="w-full text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={onBackToCheckout || onComplete}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Checkout
                  </Button>
                </div>
              )}
            </>
          ) : status === "order_failed" ? (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Order Failed</h2>
              <p className="text-gray-600 mb-6">
                {errorMessage || "There was an issue creating your order. Your payment was not charged."}
              </p>
              {onRetry && (
                <div className="space-y-3">
                  <Button 
                    onClick={onRetry}
                    className="w-full text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={onBackToCheckout || onComplete}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Checkout
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {allStepsComplete ? "Order Confirmed!" : "Processing Your Order"}
              </h2>
              <p className="text-gray-600">
                {allStepsComplete
                  ? "Your order has been successfully placed"
                  : "Please wait while we confirm your order details"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
