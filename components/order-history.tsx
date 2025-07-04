"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Package, CheckCircle, Truck } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface OrderSummary {
  id: string
  order_number?: string
  created_at: string
  total: number
  status: {
    name: string
    description: string
    color: string
  }
  items: Array<{
    name: string
    quantity: number
    image_url?: string
  }>
  restaurant: {
    name: string
    logo?: string
  }
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Package,
  ready: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
}

export function OrderHistory({ customerPhone }: { customerPhone: string }) {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Fetch orders by phone number with joined tables for status and restaurant info
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            id, 
            created_at, 
            total, 
            status_id, 
            restaurant_id, 
            items,
            order_statuses(name, description, color),
            restaurants(name, logo_url)
          `)
          .eq("customer_phone", customerPhone)
          .order("created_at", { ascending: false })
          .limit(10)

        if (ordersError || !ordersData) {
          console.error("Error fetching orders:", ordersError)
          return
        }

        // Process each order to get complete data
        const processedOrders = ordersData.map((order) => {
            // Get status data from the joined query
            const statusData = Array.isArray(order.order_statuses) && order.order_statuses.length > 0
              ? order.order_statuses[0]
              : null;
              
            // Get restaurant data from the joined query
            const restaurantData = Array.isArray(order.restaurants) && order.restaurants.length > 0
              ? order.restaurants[0]
              : null;

            // Parse items from JSONB
            let parsedItems: Array<{name: string; quantity: number; image_url?: string}> = [];
            try {
              // Items might be stored as a string or as a JSON object
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              
              parsedItems = Array.isArray(items) ? items.map((item: any) => ({
                name: item.name || item.item_name || "Item",
                quantity: item.quantity || 1,
                image_url: item.image_url || "/placeholder.svg?height=64&width=64"
              })) : [];
            } catch (e) {
              console.error("Error parsing order items:", e);
              parsedItems = [];
            }

            // Create the complete order summary
            return {
              id: order.id,
              order_number: `ORD-${order.id.slice(-8)}`,
              created_at: order.created_at,
              total: order.total,
              status: statusData || {
                name: "pending",
                description: "Pending",
                color: "#6b7280",
              },
              items: parsedItems,
              restaurant: {
                name: restaurantData?.name || "Restaurant",
                logo: restaurantData?.logo_url || "/placeholder.svg?height=40&width=40",
              },
            };
        });

        setOrders(processedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders()
  }, [customerPhone])

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600">Your order history will appear here</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Orders</h2>

      {orders.map((order) => {
        const StatusIcon = statusIcons[order.status.name as keyof typeof statusIcons] || Clock

        return (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/order/${order.id}`)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${order.status.color}20` }}
                >
                  <StatusIcon className="w-4 h-4" style={{ color: order.status.color }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.order_number || `Order #${order.id.slice(-8)}`}</p>
                  <p className="text-sm text-gray-600">{order.restaurant.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center">
                    {item.image_url && (
                      <div className="w-8 h-8 relative rounded-lg overflow-hidden mr-2">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="text-sm text-gray-600">
                      {item.quantity}x {item.name}
                      {index < Math.min(order.items.length, 3) - 1 && ", "}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center">
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${order.status.color}20`,
                    color: order.status.color,
                  }}
                >
                  {order.status.description}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
