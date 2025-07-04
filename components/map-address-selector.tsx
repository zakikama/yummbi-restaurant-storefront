"use client"

/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, MapPin, Loader2, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MapAddressSelectorProps {
  onAddressSelect: (address: {
    fullAddress: string
    lat: number
    lng: number
    streetAddress?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }) => void
  initialAddress?: string
}

export function MapAddressSelector({ onAddressSelect, initialAddress }: MapAddressSelectorProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [searchInput, setSearchInput] = useState(initialAddress || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState("")
  const [addressDetails, setAddressDetails] = useState<{
    streetAddress?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>({})
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      setIsLoading(true)
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        setIsLoading(false)
        initMap()
      }
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    } else if (window.google) {
      initMap()
    }
  }, [])

  // Initialize map
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return

    // Default to a central location if no geolocation
    const defaultLocation = { lat: 40.7128, lng: -74.006 }

    const mapOptions: google.maps.MapOptions = {
      center: defaultLocation,
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    }

    const newMap = new google.maps.Map(mapRef.current, mapOptions)
    setMap(newMap)

    const newMarker = new google.maps.Marker({
      position: defaultLocation,
      map: newMap,
      draggable: true,
      animation: google.maps.Animation.DROP,
    })
    setMarker(newMarker)

    // Handle marker drag events
    google.maps.event.addListener(newMarker, "dragend", () => {
      const position = newMarker.getPosition()
      if (position) {
        reverseGeocode(position.lat(), position.lng())
      }
    })

    // Handle map click events
    google.maps.event.addListener(newMap, "click", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        // Update marker position
        newMarker.setPosition(event.latLng)
        
        // Animate marker to indicate selection
        newMarker.setAnimation(google.maps.Animation.DROP)
        
        // Get address from coordinates and update input field
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        reverseGeocode(lat, lng)
        
        // Center map on clicked location
        newMap.panTo(event.latLng)
      }
    })

    // Initialize autocomplete
    if (window.google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("address-search") as HTMLInputElement,
        { types: ["address"] },
      )
      autocompleteRef.current = autocomplete

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place.geometry && place.geometry.location) {
          // Center map and position marker
          newMap.setCenter(place.geometry.location)
          newMap.setZoom(16) // Zoom in to show the selected location clearly
          newMarker.setPosition(place.geometry.location)
          newMarker.setAnimation(google.maps.Animation.DROP) // Animate marker

          if (place.formatted_address) {
            // Update both the selected address display and the search input field
            setSelectedAddress(place.formatted_address)
            setSearchInput(place.formatted_address)
            extractAddressComponents(place)
          } else {
            // If no formatted address, use the name or a fallback
            const addressText = place.name || `Location (${place.geometry.location.lat().toFixed(6)}, ${place.geometry.location.lng().toFixed(6)})`
            setSelectedAddress(addressText)
            setSearchInput(addressText)
            extractAddressComponents(place)
          }
        }
      })
    }

    // Try to get user's location
    getUserLocation()
  }, [])

  // Get user's current location
  const getUserLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          if (map && marker) {
            // Set zoom level to make location clearly visible
            map.setZoom(16)
            map.setCenter(userLocation)
            marker.setPosition(userLocation)
            
            // Get address from coordinates and update UI
            reverseGeocode(userLocation.lat, userLocation.lng)
          }
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLocating(false)
          alert("Could not get your location. Please check your browser permissions.")
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
      setIsLocating(false)
      alert("Geolocation is not supported by your browser.")
    }
  }

  // Reverse geocode to get address from coordinates
  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return

    const geocoder = new google.maps.Geocoder()
    
    // Use detailed geocoder options
    const geocoderRequest = {
      location: { lat, lng },
      language: "en"
    }
    
    // Show loading state while geocoding
    setIsLoading(true)
    
    geocoder.geocode(geocoderRequest, (results, status) => {
      setIsLoading(false)
      
      if (status === "OK" && results && results[0]) {
        const address = results[0].formatted_address
        // Update the selected address display
        setSelectedAddress(address)
        
        // Extract and pass address components to parent component
        extractAddressComponents(results[0])
      } else {
        console.error("Geocoder failed due to: " + status)
        
        // Try a second approach with a different geocoder configuration
        const alternativeRequest = {
          location: { lat, lng },
          language: "en"
        }
        
        geocoder.geocode(alternativeRequest, (altResults, altStatus) => {
          if (altStatus === "OK" && altResults && altResults[0]) {
            const altAddress = altResults[0].formatted_address
            setSelectedAddress(altAddress)
            extractAddressComponents(altResults[0])
          } else {
            // If all geocoding attempts fail, create a simple coordinate-based address
            const fallbackAddress = `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
            setSelectedAddress(fallbackAddress)
            setSearchInput(fallbackAddress)
            
            // Create minimal address data with coordinates
            const addressData = {
              fullAddress: fallbackAddress,
              lat,
              lng,
              streetAddress: "",
              city: "",
              state: "",
              postalCode: "",
              country: "",
            }
            
            onAddressSelect(addressData)
          }
        })
      }
    })
  }


  // Extract address components from geocoder result
  const extractAddressComponents = (place: google.maps.places.PlaceResult | google.maps.GeocoderResult) => {
    if (!place.geometry || !place.geometry.location) return

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    let streetNumber = ""
    let route = ""
    let streetAddress = ""
    let neighborhood = ""
    let city = ""
    let state = ""
    let postalCode = ""
    let country = ""

    if (place.address_components) {
      // First pass: collect all components
      for (const component of place.address_components) {
        // Check all types for more complete information
        for (const type of component.types) {
          switch (type) {
            case "street_number":
              streetNumber = component.long_name
              break
            case "route":
              route = component.long_name
              break
            case "neighborhood":
            case "sublocality_level_1":
              neighborhood = component.long_name
              break
            case "locality":
              city = component.long_name
              break
            case "administrative_area_level_1":
              state = component.short_name
              break
            case "postal_code":
              postalCode = component.long_name
              break
            case "country":
              country = component.long_name
              break
          }
        }
      }
      
      // Construct street address from components
      if (streetNumber && route) {
        streetAddress = `${streetNumber} ${route}`
      } else if (route) {
        streetAddress = route
      } else if (neighborhood) {
        // If no street info, use neighborhood as fallback
        streetAddress = neighborhood
      }
    }
    
    // Create a human-readable address if formatted_address is not available
    let fullAddress = place.formatted_address || "";
    if (!fullAddress) {
      const addressParts = [];
      if (streetAddress) addressParts.push(streetAddress);
      if (city) addressParts.push(city);
      if (state) addressParts.push(state);
      if (postalCode) addressParts.push(postalCode);
      if (country) addressParts.push(country);
      
      fullAddress = addressParts.join(", ");
      
      // If we still don't have an address, use coordinates as last resort
      if (!fullAddress) {
        fullAddress = `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
      }
    }

    const addressData = {
      fullAddress: fullAddress,
      lat,
      lng,
      streetAddress,
      city,
      state,
      postalCode,
      country,
    }

    // Update the search input with a meaningful address
    setSearchInput(fullAddress);
    
    // Update address details for display
    setAddressDetails({
      streetAddress,
      city,
      state,
      postalCode,
      country
    });
    
    // Pass the address data to the parent component
    onAddressSelect(addressData)
  }

  // Handle search button click
  const handleSearch = () => {
    if (!searchInput.trim() || !window.google || !map || !marker) return

    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === "OK" && results && results[0] && results[0].geometry) {
        const location = results[0].geometry.location
        map.setCenter(location)
        marker.setPosition(location)
        setSelectedAddress(results[0].formatted_address || searchInput)
        extractAddressComponents(results[0])
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          id="address-search"
          placeholder="Search for your address"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pr-10 h-12 rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSearch()
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="absolute right-0 top-0 h-full px-3"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100"></div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}

        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="absolute bottom-3 right-3 flex items-center gap-1 bg-white shadow-md"
          onClick={getUserLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Locating...
            </>
          ) : (
            <>
              <Navigation className="h-3 w-3" /> Use my location
            </>
          )}
        </Button>
      </div>

      {selectedAddress && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-start">
          <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0 mr-2" />
          <div className="w-full">
            <p className="font-medium text-green-800">Selected location</p>
            
            {/* Detailed address information */}
            <div className="text-sm text-green-700 space-y-1">
              {/* Street address */}
              {addressDetails.streetAddress && (
                <p className="font-medium">{addressDetails.streetAddress}</p>
              )}
              
              {/* City, State, Postal Code */}
              <p>
                {[addressDetails.city, addressDetails.state, addressDetails.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              
              {/* Country */}
              {addressDetails.country && (
                <p>{addressDetails.country}</p>
              )}
              
              {/* If no detailed address components are available, show the full address */}
              {!addressDetails.streetAddress && 
               !addressDetails.city && 
               !addressDetails.state && 
               !addressDetails.country && (
                <p>{selectedAddress}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}