"use client"
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface Restaurant {
  id: string
  name: string
  logo?: string
  description?: string
  address?: string
  phone?: string
  email?: string
}

export function RestaurantFooter() {
  const pathname = usePathname()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    // Try to extract restaurantId from the URL
    const match = pathname.match(/([a-f0-9\-]{36})/)
    const restaurantId = match ? match[1] : null
    if (!restaurantId) return
    async function fetchRestaurant() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()
      if (!error && data) setRestaurant(data as Restaurant)
    }
    fetchRestaurant()
  }, [pathname])

  if (!restaurant) return null
  return (
    <footer className="bg-white text-black border-t border-gray-100 py-6 px-4 text-center mt-2 flex flex-col items-center gap-2">
      {restaurant.logo && (
        <Image src={restaurant.logo} alt={restaurant.name} width={48} height={48} className="rounded-lg object-cover mb-2" />
      )}
      <h3 className="text-lg font-bold text-theme-text">{restaurant.name}</h3>
      {restaurant.description && <p className="text-theme-muted text-sm mb-1">{restaurant.description}</p>}
      {restaurant.address && <p className="text-theme-muted text-sm flex items-center justify-center gap-1"><span>📍</span>{restaurant.address}</p>}
      {restaurant.phone && <p className="text-theme-muted text-sm flex items-center justify-center gap-1"><span>📞</span>{restaurant.phone}</p>}
      {restaurant.email && <p className="text-theme-muted text-sm flex items-center justify-center gap-1"><span>✉️</span>{restaurant.email}</p>}
    </footer>
  )
} 