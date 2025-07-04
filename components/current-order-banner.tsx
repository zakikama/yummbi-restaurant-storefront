"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Package, Truck, CheckCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface CurrentOrder {
  id: string
  order_number?: string
  created_at: string
  total: number
  status: {
    name: string
    description: string
    color: string
  }
  tracking?: {
    estimated_delivery_time?: string
  }
  restaurant: {
    name: string
  }
  items: Array<{
    name: string
    quantity: number
  }>
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Package,
  ready: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
}

interface CurrentOrderBannerProps {
  restaurantId: string;
  primaryColor?: string;
  accentColor?: string;
}

export function CurrentOrderBanner({ restaurantId, primaryColor = '#00a082', accentColor = '#ffc244' }: CurrentOrderBannerProps) {
  const router = useRouter()
  const [currentOrder, setCurrentOrder] = useState<CurrentOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false) // Used to prevent hydration mismatch
  const [renderKey, setRenderKey] = useState(0) // Force re-render when needed

  // Mount check to prevent hydration mismatch
  useEffect(() => {
    console.log("CurrentOrderBanner - Initial mount effect running")
    setMounted(true)
    // Force a re-render after mounting to ensure all state is applied properly
    setTimeout(() => {
      setRenderKey(prev => prev + 1)
      console.log("CurrentOrderBanner - Forced re-render after mounting")
    }, 50)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function fetchCurrentOrder() {
      try {
        // Check localStorage for recent order ID
        const recentOrderId = localStorage.getItem("currentOrderId")
        const orderRestaurantId = localStorage.getItem("currentOrderRestaurantId")
        const orderTimestamp = localStorage.getItem("currentOrderTimestamp")
        
        // Debug logging
        console.log("CurrentOrderBanner - Debug Info:", {
          recentOrderId,
          orderRestaurantId,
          restaurantId,
          orderTimestamp,
          currentTime: Date.now(),
          timeDiff: orderTimestamp ? Date.now() - Number.parseInt(orderTimestamp) : null,
          timeWindow: 2 * 60 * 60 * 1000,
          condition: recentOrderId && orderRestaurantId === restaurantId && 
            orderTimestamp && Date.now() - Number.parseInt(orderTimestamp) < 2 * 60 * 60 * 1000
        })
        
        // Only proceed if we have a recent order for this restaurant
        if (recentOrderId && orderRestaurantId === restaurantId && 
            orderTimestamp && Date.now() - Number.parseInt(orderTimestamp) < 2 * 60 * 60 * 1000) {
          
          // Fetch order with status and restaurant data
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select(`
              id, 
              customer_name, 
              customer_phone, 
              items,
              total, 
              created_at,
              status_id,
              restaurant_id,
              order_statuses(id, name, description, color),
              restaurants(id, name)
            `)
            .eq("id", recentOrderId)
            .single()
          
          if (orderError || !orderData) {
            console.error("Error fetching order:", orderError)
            return
          }
          
          // Get the order status
          const orderStatus = Array.isArray(orderData.order_statuses) && orderData.order_statuses.length > 0
            ? orderData.order_statuses[0].name
            : "pending"
            
          console.log("Order status:", orderStatus)
          
          // Only fetch tracking information if the order is out for delivery
          let firstTrackingData = null
          if (orderStatus === "out_for_delivery") {
            const { data: trackingData, error: trackingError } = await supabase
              .from("order_tracking")
              .select("*")
              .eq("order_id", recentOrderId)
              
            console.log("Banner tracking data result:", { trackingData, trackingError })
            
            // Get the first tracking entry if any exist
            firstTrackingData = Array.isArray(trackingData) && trackingData.length > 0 ? trackingData[0] : null
          }
          
          // Parse items from JSONB
          let parsedItems: Array<{name: string; quantity: number}> = [];
          try {
            const items = typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items;
            
            parsedItems = Array.isArray(items) ? items.map((item: any) => ({
              name: item.name || item.item_name || "Item",
              quantity: item.quantity || 1
            })) : [];
          } catch (e) {
            console.error("Error parsing order items:", e);
          }
          
          // Format the order data
          const formattedOrder: CurrentOrder = {
            id: orderData.id,
            order_number: `ORD-${orderData.id.slice(-8)}`,
            created_at: orderData.created_at,
            total: orderData.total,
            status: Array.isArray(orderData.order_statuses) && orderData.order_statuses.length > 0
              ? orderData.order_statuses[0]
              : {
                  name: "pending",
                  description: "Order received",
                  color: "#6b7280",
                },
            tracking: firstTrackingData || { estimated_delivery_time: new Date(Date.now() + 20 * 60 * 1000).toISOString() },
            restaurant: Array.isArray(orderData.restaurants) && orderData.restaurants.length > 0
              ? { name: orderData.restaurants[0].name }
              : { name: "Restaurant" },
            items: parsedItems.length > 0 ? parsedItems : [{ name: "Your order", quantity: 1 }]
          }
          
          console.log("Setting currentOrder state with:", formattedOrder)
          setCurrentOrder(formattedOrder)
          console.log("CurrentOrder state should be set now")
        }
      } catch (error) {
        console.error("Error fetching current order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentOrder()
  }, [restaurantId, mounted])

  // Update time remaining
  useEffect(() => {
    if (!currentOrder?.tracking?.estimated_delivery_time) return

    const updateTime = () => {
      const now = new Date()
      const estimated = new Date(currentOrder.tracking!.estimated_delivery_time!)
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
  }, [currentOrder?.tracking?.estimated_delivery_time])

  // All hook calls must be above any conditional rendering
  // Now we'll use these variables for conditional rendering
  const StatusIcon = currentOrder?.status?.name ? 
    (statusIcons[currentOrder.status.name as keyof typeof statusIcons] || Clock) : 
    Clock;
  const isOutForDelivery = currentOrder?.status?.name === "out_for_delivery";
  
  // Debug information after all hooks
  console.log("CurrentOrderBanner - Render Decision: [" + renderKey + "]", { 
    loading,
    hasCurrentOrder: !!currentOrder,
    mounted,
    currentOrderData: currentOrder,
    statusName: currentOrder?.status?.name
  })
  
  // Handle different render conditions
  if (!mounted) {
    console.log("CurrentOrderBanner - Not mounted yet, returning placeholder")
    return (
      <div className="mb-4 p-3 h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg">
        <div className="h-full w-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading order information...</span>
        </div>
      </div>
    )
  }

  if (loading) {
    console.log("CurrentOrderBanner - Not rendering: still loading")
    return (
      <div className="mb-4 p-3 h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg">
        <div className="h-full w-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading your order...</span>
        </div>
      </div>
    )
  }

  if (!currentOrder) {
    console.log("CurrentOrderBanner - Not rendering: no current order")
    return null;
  }

  // Don't show if order is delivered
  if (currentOrder.status?.name === "delivered") {
    console.log("CurrentOrderBanner - Not rendering: order delivered")
    return null;
  }
  
  console.log("CurrentOrderBanner - Should be rendering now!")

  // Since we've already checked currentOrder isn't null above, we can safely use it here
  return (
    <div key={`order-banner-${renderKey}`}>
      {/* Only render the banner if we have a current order */}
      <Button
        onClick={() => router.push(`/order/${currentOrder.id}`)}
        className="w-full p-0 h-auto border-0"
        style={{ 
          position: "relative", 
          borderRadius: 0,
          backgroundColor: `${primaryColor}15`, // Light version of primary color 
          borderBottom: `1px solid ${primaryColor}40`,
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseOver={(e) => {
          // @ts-ignore - This is fine for inline hover effect
          e.currentTarget.style.backgroundColor = `${primaryColor}25`;
        }}
        onMouseOut={(e) => {
          // @ts-ignore - This is fine for inline hover effect
          e.currentTarget.style.backgroundColor = `${primaryColor}15`;
        }}
        variant="ghost"
      >
        <div className="w-full px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Status Icon */}
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-sm"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <StatusIcon className="w-4 h-4" style={{ color: primaryColor }} />
              </div>

              {/* Order Info */}
              <div>
                <div className="flex items-center">
                  <p className="font-semibold text-gray-900 text-sm">{currentOrder.status?.description || 'Processing order...'}</p>
                  {timeRemaining && (
                    <span className="ml-2 text-xs font-medium" style={{ color: primaryColor }}>{timeRemaining} mins</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600">Order #{currentOrder.order_number ? currentOrder.order_number.split('-')[1] : currentOrder.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>

            {/* Middle section with Glovo-style progress indicator */}
            <div className="hidden md:block flex-grow mx-4 my-1">
              <div className="w-full flex flex-col py-1">
                {/* Slim progress bar with space between segments - exactly like Glovo */}
                <div className="w-full flex items-center justify-between relative mb-2">
                  <div className="flex items-center justify-between w-full">
                    {/* First section */}
                    <div className="h-[2px] flex-1 rounded-l-full transition-all duration-300"
                      style={{ 
                        backgroundColor: ['pending', 'preparing'].includes(currentOrder.status?.name || '') ? primaryColor : '#eeeeee'
                      }}>
                    </div>
                    
                    {/* Tiny gap */}
                    <div className="w-[2px]"></div>
                    
                    {/* Second section */}
                    <div className="h-[2px] flex-1 transition-all duration-300"
                      style={{ 
                        backgroundColor: ['ready'].includes(currentOrder.status?.name || '') ? primaryColor : '#eeeeee'
                      }}>
                    </div>
                    
                    {/* Tiny gap */}
                    <div className="w-[2px]"></div>
                    
                    {/* Third section */}
                    <div className="h-[2px] flex-1 rounded-r-full transition-all duration-300"
                      style={{ 
                        backgroundColor: ['out_for_delivery', 'delivered'].includes(currentOrder.status?.name || '') ? primaryColor : '#eeeeee'
                      }}>
                    </div>
                  </div>
                </div>
                
                {/* Text labels below progress bar - exactly like in the image */}
                <div className="w-full flex justify-between">
                  <div className="text-center flex-1">
                    <span 
                      className="text-[9px] font-medium transition-all duration-300"
                      style={{ 
                        color: ['pending', 'preparing'].includes(currentOrder.status?.name || '') ? primaryColor : '#777777'
                      }}
                    >
                      In progress
                    </span>
                  </div>
                  
                  <div className="text-center flex-1">
                    <span 
                      className="text-[9px] font-medium transition-all duration-300"
                      style={{ 
                        color: ['ready'].includes(currentOrder.status?.name || '') ? primaryColor : '#777777'
                      }}
                    >
                      Pick up
                    </span>
                  </div>
                  
                  <div className="text-center flex-1">
                    <span 
                      className="text-[9px] font-medium transition-all duration-300"
                      style={{ 
                        color: ['out_for_delivery', 'delivered'].includes(currentOrder.status?.name || '') ? primaryColor : '#777777'
                      }}
                    >
                      Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center">
              {/* Items summary */}
              <div className="text-right mr-2 text-xs text-gray-600 hidden md:block">
                {currentOrder.items?.length || 0} {!currentOrder.items || currentOrder.items.length === 1 ? 'item' : 'items'} •{' '}
                ${(currentOrder.total || 0).toFixed(2)}
              </div>

              <div className="ml-auto">
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </Button>
    </div>
  )
}

function getProgressWidth(status: string): string {
  const progressMap = {
    pending: "16%",
    confirmed: "33%",
    preparing: "50%",
    ready: "66%",
    out_for_delivery: "83%",
    delivered: "100%",
  }
  return progressMap[status as keyof typeof progressMap] || "0%"
}
