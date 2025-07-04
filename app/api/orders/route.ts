import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Create Supabase client with fallback for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    if (supabase) {
      // Use real Supabase
      const { data: order, error } = await supabase.from("orders").insert([orderData]).select().single()

      if (error) {
        console.error("Order creation error:", error)
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
      }

      return NextResponse.json({ order })
    } else {
      // Mock order creation for development
      console.log("Mock order created:", orderData)

      const mockOrder = {
        id: `order-${Date.now()}`,
        ...orderData,
        created_at: new Date().toISOString(),
        status: "pending",
      }

      return NextResponse.json({ order: mockOrder })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
