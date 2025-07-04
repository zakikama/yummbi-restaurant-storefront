"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Package, Truck, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CurrentOrder {
  id: string
  order_number?: string
  status: {
    name: string
    description: string
    color: string
  }
  tracking?: {
    estimated_delivery_time?: string
  }
  total: number
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Package,
  ready: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
}

export function CurrentOrderCompact({ restaurantId }: { restaurantId: string }) {
  const router = useRouter()
  const [currentOrder, setCurrentOrder] = useState<CurrentOrder | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  useEffect(() => {
    // Check for current order (same logic as banner)
    const recentOrderId = localStorage.getItem("currentOrderId")
    const orderRestaurantId = localStorage.getItem("currentOrderRestaurantId")
    const orderTimestamp = localStorage.getItem("currentOrderTimestamp")

    if (
      recentOrderId &&
      orderRestaurantId === restaurantId &&
      orderTimestamp &&
      Date.now() - Number.parseInt(orderTimestamp) < 2 * 60 * 60 * 1000
    ) {
      // Fetch the actual order data from Supabase
      async function fetchOrderData() {
        try {
          // Fetch order details with status information in a single query
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select(`
              id, 
              total, 
              payment_status, 
              created_at,
              status_id,
              order_statuses(name, description, color)
            `)
            .eq("id", recentOrderId)
            .single()

          if (orderError || !orderData) {
            console.error("Error fetching order:", orderError)
            return
          }

          // Get status data from the joined query - it comes as an array with one item
          const statusData = Array.isArray(orderData.order_statuses) 
            ? orderData.order_statuses[0] 
            : orderData.order_statuses

          if (!statusData) {
            console.error("No status data found for order")
            return
          }

          // Only fetch tracking information if the order is out for delivery
          let firstTrackingData = null
          if (statusData.name === "out_for_delivery") {
            const { data: trackingData, error: trackingError } = await supabase
              .from("order_tracking")
              .select("estimated_delivery_time")
              .eq("order_id", recentOrderId)
              
            console.log("Compact tracking data result:", { trackingData, trackingError })
            
            // Get the first tracking entry if any exist
            firstTrackingData = Array.isArray(trackingData) && trackingData.length > 0 ? trackingData[0] : null
          }
          
          console.log("Order status for compact banner:", statusData.name)

          // Create the order object with real data
          const realOrder: CurrentOrder = {
            id: orderData.id,
            order_number: `ORD-${orderData.id.slice(-8)}`,
            status: {
              name: statusData.name || "pending",
              description: statusData.description || "Pending",
              color: statusData.color || "#6b7280",
            },
            tracking: firstTrackingData ? {
              estimated_delivery_time: firstTrackingData.estimated_delivery_time,
            } : {
              estimated_delivery_time: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
            },
            total: orderData.total,
          }
          
          setCurrentOrder(realOrder)
        } catch (error) {
          console.error("Error fetching order data:", error)
        }
      }

      fetchOrderData()
    }
  }, [restaurantId])

  // Update time remaining
  useEffect(() => {
    if (!currentOrder?.tracking?.estimated_delivery_time) return

    const updateTime = () => {
      const now = new Date()
      const estimated = new Date(currentOrder.tracking?.estimated_delivery_time!)
      const diff = estimated.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Arriving now")
        return
      }

      const minutes = Math.floor(diff / (1000 * 60))
      setTimeRemaining(`${minutes} min`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [currentOrder?.tracking?.estimated_delivery_time])

  if (!currentOrder || currentOrder.status.name === "delivered") {
    return null
  }

  const StatusIcon = statusIcons[currentOrder.status.name as keyof typeof statusIcons] || Clock

  return (
    <div className="fixed top-4 left-4 right-4 z-30">
      <button
        onClick={() => router.push(`/order/${currentOrder.id}`)}
        className="w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-3 flex items-center space-x-3 hover:shadow-xl transition-shadow"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${currentOrder.status.color}20` }}
        >
          <StatusIcon className="w-5 h-5" style={{ color: currentOrder.status.color }} />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900 text-sm">
              {currentOrder.order_number || `Order #${currentOrder.id.slice(-8)}`}
            </p>
            {timeRemaining && (
              <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                {timeRemaining}
              </span>
            )}
          </div>
          <p className="text-xs font-medium" style={{ color: currentOrder.status.color }}>
            {currentOrder.status.description} • ${currentOrder.total.toFixed(2)}
          </p>
        </div>

        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentOrder.status.color }} />
      </button>
    </div>
  )
}
