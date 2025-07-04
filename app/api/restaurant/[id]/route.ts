import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Create Supabase client with fallback for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

// Mock data for development/testing
const mockData = {
  restaurant: {
    id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
    name: "Bella's Italian Kitchen",
    description: "Authentic Italian cuisine made with love",
    logo: "/placeholder.svg?height=100&width=100",
    address: "123 Main Street, City",
    phone: "+1 (555) 123-4567",
    email: "info@bellas.com",
  },
  theme: {
    colors: {
      primary: "#e53e3e",
      secondary: "#38a169",
      accent: "#3182ce",
      background: "#ffffff",
      text: "#1a202c",
      muted: "#718096",
    },
    font_family: "Inter, sans-serif",
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  categories: [
    {
      id: "cat-1",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      name: "Appetizers",
      description: "Start your meal right",
      order: 1,
    },
    {
      id: "cat-2",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      name: "Pizza",
      description: "Wood-fired pizzas",
      order: 2,
    },
    {
      id: "cat-3",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      name: "Pasta",
      description: "Fresh homemade pasta",
      order: 3,
    },
    {
      id: "cat-4",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      name: "Desserts",
      description: "Sweet endings",
      order: 4,
    },
  ],
  menuItems: [
    // Appetizers
    {
      id: "item-1",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-1",
      name: "Bruschetta Trio",
      description: "Three varieties of our signature bruschetta with fresh tomatoes, basil, and mozzarella",
      price: 12.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
      featured: true,
    },
    {
      id: "item-2",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-1",
      name: "Calamari Fritti",
      description: "Crispy fried squid rings served with marinara sauce",
      price: 14.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
    },
    // Pizza
    {
      id: "item-3",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-2",
      name: "Margherita Pizza",
      description: "Classic pizza with fresh mozzarella, tomatoes, and basil",
      price: 18.99,
      original_price: 22.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
      featured: true,
    },
    {
      id: "item-4",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-2",
      name: "Pepperoni Supreme",
      description: "Loaded with pepperoni, mushrooms, bell peppers, and extra cheese",
      price: 24.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
    },
    {
      id: "item-5",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-2",
      name: "Quattro Stagioni",
      description: "Four seasons pizza with artichokes, ham, mushrooms, and olives",
      price: 26.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
    },
    // Pasta
    {
      id: "item-6",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-3",
      name: "Spaghetti Carbonara",
      description: "Classic Roman pasta with eggs, cheese, pancetta, and black pepper",
      price: 19.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
      featured: true,
    },
    {
      id: "item-7",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-3",
      name: "Fettuccine Alfredo",
      description: "Rich and creamy pasta with parmesan cheese and butter",
      price: 17.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
    },
    {
      id: "item-8",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-3",
      name: "Penne Arrabbiata",
      description: "Spicy tomato sauce with garlic, red peppers, and herbs",
      price: 16.99,
      original_price: 19.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
    },
    // Desserts
    {
      id: "item-9",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-4",
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
      price: 8.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
      featured: true,
    },
    {
      id: "item-10",
      restaurant_id: "2fb2a4e9-824d-4968-a15f-9ff896730607",
      category_id: "cat-4",
      name: "Cannoli Siciliani",
      description: "Crispy shells filled with sweet ricotta and chocolate chips",
      price: 7.99,
      image_url: "/placeholder.svg?height=200&width=300",
      available: true,
    },
  ],
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurantId = params.id

    // If Supabase is configured, use it
    if (supabase) {
      // Fetch restaurant data
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single()

      if (restaurantError || !restaurant) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
      }

      // Fetch restaurant theme
      const { data: theme, error: themeError } = await supabase
        .from("restaurant_themes")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_draft", false)
        .single()

      if (themeError) {
        console.error("Theme error:", themeError)
      }

      // Fetch categories
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("order", { ascending: true })

      if (categoriesError) {
        console.error("Categories error:", categoriesError)
      }

      // Fetch menu items
      const { data: menuItems, error: menuItemsError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("available", true)
        .order("order", { ascending: true })

      if (menuItemsError) {
        console.error("Menu items error:", menuItemsError)
      }

      return NextResponse.json({
        restaurant,
        theme: theme || null,
        categories: categories || [],
        menuItems: menuItems || [],
      })
    } else {
      // Use mock data for development
      console.log("Using mock data - Supabase not configured")

      // Check if the requested restaurant ID matches our mock data
      if (restaurantId === mockData.restaurant.id) {
        return NextResponse.json(mockData)
      } else {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
      }
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
