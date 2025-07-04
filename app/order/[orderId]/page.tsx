"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, Phone, MapPin, CheckCircle, Package, Truck, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface OrderStatus {
  id: string
  name: string
  description: string
  color: string
  sort_order: number
}

interface OrderTracking {
  estimated_delivery_time?: string
  actual_delivery_time?: string
  driver_name?: string
  driver_phone?: string
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  menu_item?: {
    name: string
    image_url?: string
  }
  name?: string
}

interface Order {
  id: string
  order_number?: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  tax: number
  total: number
  payment_method: string
  created_at: string
  status: OrderStatus
  tracking?: OrderTracking
  status_history: Array<{
    status: { name: string; description: string }
    created_at: string
  }>
  restaurant?: {
    name: string
    logo?: string
  }
  restaurant_id?: string
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: ChefHat,
  ready: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
}

const statusSteps = [
  { key: "pending", label: "Order Placed", description: "We received your order" },
  { key: "confirmed", label: "Confirmed", description: "Restaurant confirmed your order" },
  { key: "preparing", label: "Preparing", description: "Your food is being prepared" },
  { key: "ready", label: "Ready", description: "Order is ready for pickup/delivery" },
  { key: "out_for_delivery", label: "On the Way", description: "Driver is on the way" },
  { key: "delivered", label: "Delivered", description: "Order has been delivered" },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  useEffect(() => {
    async function fetchOrder() {
      try {
        console.log("Fetching order with ID:", orderId)
        
        // Fetch the basic order data first without joins
        const { data: basicOrderData, error: basicOrderError } = await supabase
          .from("orders")
          .select(`
            id, 
            customer_name, 
            customer_phone, 
            customer_email,
            delivery_address, 
            delivery_coordinates,
            items,
            subtotal, 
            tax, 
            delivery_fee, 
            tip,
            total, 
            payment_method, 
            payment_status,
            created_at,
            updated_at,
            status_id,
            restaurant_id,
            notes
          `)
          .eq("id", orderId)
          .single()
        
        console.log("Basic order data result:", { basicOrderData, basicOrderError })

        if (basicOrderError || !basicOrderData) {
          console.error("Error fetching basic order details:", basicOrderError)
          throw new Error(basicOrderError?.message || "Order not found")
        }
        
        // Now fetch status data separately
        let statusData = null
        if (basicOrderData.status_id) {
          const { data: status } = await supabase
            .from("order_statuses")
            .select("id, name, description, color, sort_order")
            .eq("id", basicOrderData.status_id)
            .single()
          
          statusData = status
        }
        
        // Fetch restaurant data separately
        let restaurantData = null
        if (basicOrderData.restaurant_id) {
          const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id, name, logo_url")
            .eq("id", basicOrderData.restaurant_id)
            .single()
          
          restaurantData = restaurant
        }

        // Only fetch tracking information if we have a status and it's "out_for_delivery"
        let firstTrackingData = null
        if (statusData?.name === "out_for_delivery") {
          const { data: trackingData, error: trackingError } = await supabase
            .from("order_tracking")
            .select("*")
            .eq("order_id", orderId)
          
          console.log("Tracking data result:", { trackingData, trackingError })
          
          // Get the first tracking entry if any exist
          firstTrackingData = Array.isArray(trackingData) && trackingData.length > 0 ? trackingData[0] : null
        }
        
        console.log("Order status for order page:", statusData?.name)

        // Fetch order status history
        const { data: statusHistoryData } = await supabase
          .from("order_status_history")
          .select(`
            id,
            created_at,
            order_statuses(name, description)
          `)
          .eq("order_id", orderId)
          .order("created_at", { ascending: false })

        // Parse items from JSONB
        let parsedItems: OrderItem[] = [];
        try {
          const items = typeof basicOrderData.items === 'string' ? JSON.parse(basicOrderData.items) : basicOrderData.items;
          
          parsedItems = Array.isArray(items) ? items.map((item: any) => ({
            id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
            name: item.name || item.item_name || "Item",
            quantity: item.quantity || 1,
            price: item.price || 0,
            menu_item: {
              name: item.name || item.item_name || "Item",
              image_url: item.image_url || "/placeholder.svg"
            }
          })) : [];
        } catch (e) {
          console.error("Error parsing order items:", e);
          parsedItems = [];
        }

        // Format the order data
        const formattedOrder: Order = {
          id: basicOrderData.id,
          order_number: `ORD-${basicOrderData.id.slice(-8)}`, // Generate order number from ID
          customer_name: basicOrderData.customer_name,
          customer_phone: basicOrderData.customer_phone,
          delivery_address: basicOrderData.delivery_address,
          items: parsedItems,
          subtotal: basicOrderData.subtotal,
          delivery_fee: basicOrderData.delivery_fee,
          tax: basicOrderData.tax,
          total: basicOrderData.total,
          payment_method: basicOrderData.payment_method,
          created_at: basicOrderData.created_at,
          status: statusData || {
            id: "pending",
            name: "pending",
            description: "Order received",
            color: "#6b7280",
            sort_order: 0
          },
          tracking: firstTrackingData,
          status_history: statusHistoryData?.map((history: any) => ({
            status: history.order_statuses || { name: "pending", description: "Order received" },
            created_at: history.created_at
          })) || [],
          restaurant: restaurantData ? {
            name: restaurantData.name,
            logo: restaurantData.logo_url
          } : undefined,
          restaurant_id: basicOrderData.restaurant_id
        }

        setOrder(formattedOrder)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  // Update time remaining
  useEffect(() => {
    if (!order?.tracking?.estimated_delivery_time) return

    const updateTime = () => {
      const now = new Date()
      const estimated = new Date(order?.tracking?.estimated_delivery_time!)
      const diff = estimated.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Arriving now")
        return
      }

      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${remainingMinutes}m`)
      } else {
        setTimeRemaining(`${remainingMinutes} min`)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [order?.tracking?.estimated_delivery_time])

  const handleBackNavigation = () => {
    // Try to get the restaurant ID from the order or localStorage
    const restaurantId = order?.restaurant_id || localStorage.getItem("currentOrderRestaurantId")

    if (restaurantId) {
      // Navigate back to the restaurant menu page
      router.push(`/${restaurantId}`)
    } else {
      // Fallback to browser back
      router.back()
    }
  }

  const handleOrderAgain = () => {
    const restaurantId = order?.restaurant_id || localStorage.getItem("currentOrderRestaurantId")

    if (restaurantId) {
      router.push(`/${restaurantId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-600 text-lg font-medium">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The order you're looking for doesn't exist"}</p>
          <Button onClick={handleBackNavigation} className="bg-green-600 hover:bg-green-700 text-white">
            Go Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  const currentStatusIndex = statusSteps.findIndex((step) => step.key === order.status.name)
  const isDelivered = order.status.name === "delivered"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="p-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="mr-3 h-10 w-10 p-0 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Order {order.order_number || `#${order.id.slice(-8)}`}</h1>
            <p className="text-sm text-gray-600">
              Placed {new Date(order.created_at).toLocaleDateString()} at{" "}
              {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Delivery Estimate */}
        {!isDelivered && order.tracking?.estimated_delivery_time && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">{timeRemaining}</h2>
              <p className="text-green-700 font-medium">Estimated delivery time</p>
              <p className="text-sm text-green-600 mt-1">
                Expected by{" "}
                {new Date(order.tracking.estimated_delivery_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Order Status Progress */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>

          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex
              const StatusIcon = statusIcons[step.key as keyof typeof statusIcons] || Clock

              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-600 text-white scale-110"
                          : isCurrent
                            ? "bg-green-100 text-green-600 border-2 border-green-600 animate-pulse"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <p
                        className={`font-semibold transition-colors duration-300 ${isCompleted ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {step.label}
                      </p>
                      <p
                        className={`text-sm transition-colors duration-300 ${isCompleted ? "text-gray-600" : "text-gray-400"}`}
                      >
                        {step.description}
                      </p>

                      {/* Show timestamp for completed steps */}
                      {isCompleted && order.status_history.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          {(() => {
                            const historyItem = order.status_history.find((h) => h.status.name === step.key)
                            return historyItem
                              ? new Date(historyItem.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""
                          })()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress line */}
                  {index < statusSteps.length - 1 && (
                    <div className="absolute left-9 mt-12 w-0.5 h-8 bg-gray-200">
                      {isCompleted && <div className="w-full h-full bg-green-600 transition-all duration-500" />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Driver Information */}
        {order.tracking?.driver_name && order.status.name === "out_for_delivery" && (
          <div className="bg-white rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Driver</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold text-lg">{order.tracking.driver_name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.tracking.driver_name}</p>
                  <p className="text-sm text-gray-600">Delivery driver</p>
                </div>
              </div>
              {order.tracking.driver_phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => window.open(`tel:${order.tracking!.driver_phone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Details</h3>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                {(item.menu_item?.image_url || item.name) && (
                  <div className="w-12 h-12 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.menu_item?.image_url ? (
                      <Image
                        src={item.menu_item.image_url || "/placeholder.svg"}
                        alt={item.menu_item.name || item.name || "Item"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.menu_item?.name || item.name || "Item"}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>

                <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-6 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery fee</span>
              <span className="font-medium">${order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-green-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p className="text-gray-600 mt-1">{order.delivery_address}</p>
              <p className="text-sm text-gray-500 mt-1">{order.customer_phone}</p>
            </div>
          </div>
        </div>

        {/* Contact Restaurant */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open(`tel:${order.restaurant?.name || "restaurant"}`)}
            >
              <Phone className="w-4 h-4 mr-3" />
              Contact Restaurant
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleOrderAgain}>
              <Package className="w-4 h-4 mr-3" />
              Order Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
