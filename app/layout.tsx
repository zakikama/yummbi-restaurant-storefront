import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/contexts/theme-context"
import { CartProvider } from "@/contexts/cart-context"
import { StripeProvider } from "@/components/stripe-provider"
import type { Metadata } from "next"
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { RestaurantFooter } from '@/components/restaurant-footer'

const inter = Inter({ subsets: ["latin"] })

interface Restaurant {
  id: string
  name: string
  logo?: string
  description?: string
  address?: string
  phone?: string
  email?: string
}

export const metadata: Metadata = {
  title: "Restaurant Storefront",
  description: "A modern restaurant storefront with online ordering",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Add Google Maps API key as environment variable */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <script
            async
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          ></script>
        )}
      </head>
      <body className={inter.className}>
        <StripeProvider>
          <CartProvider>
            <ThemeProvider>
              {children}
              <RestaurantFooter />
            </ThemeProvider>
          </CartProvider>
        </StripeProvider>
      </body>
    </html>
  )
}
