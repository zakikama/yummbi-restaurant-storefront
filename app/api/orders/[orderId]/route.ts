import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = params.orderId

    if (!supabase) {
      // Mock data for development
      const mockOrder = {
        id: orderId,
        order_number: `ORD-${Date.now()}`,
        customer_name: "John Doe",
        customer_phone: "+1 (555) 123-4567",
        delivery_address: "123 Main Street, Apt 4B, Floor 2",
        restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607", // Add this line
        items: [
          { name: "Margherita Pizza", quantity: 2, price: 18.99 },
          { name: "Tiramisu", quantity: 1, price: 8.99 },
        ],
        subtotal: 46.97,
        delivery_fee: 2.99,
        tax: 3.76,
        total: 53.72,
        payment_method: "cash",
        created_at: new Date().toISOString(),
        status: {
          id: "2",
          name: "preparing",
          description: "Your order is being prepared",
          color: "#f59e0b",
          sort_order: 2,
        },
        tracking: {
          estimated_delivery_time: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
          driver_name: "Mike Johnson",
          driver_phone: "+1 (555) 987-6543",
        },
        status_history: [
          {
            status: { name: "pending", description: "Order received" },
            created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            status: { name: "confirmed", description: "Order confirmed" },
            created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          },
          {
            status: { name: "preparing", description: "Being prepared" },
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
        ],
      }
      return NextResponse.json(mockOrder)
    }

    // Fetch order with all related data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        status:order_statuses(id, name, description, color, sort_order),
        tracking:order_tracking(*),
        items:order_items(
          *,
          menu_item:menu_items(name, image_url)
        ),
        restaurant:restaurants(name, logo)
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Fetch status history
    const { data: statusHistory } = await supabase
      .from("order_status_history")
      .select(`
        *,
        status:order_statuses(name, description, color)
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      ...order,
      status_history: statusHistory || [],
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
