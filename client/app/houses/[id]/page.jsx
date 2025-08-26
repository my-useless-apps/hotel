'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { publicApi } from '@/lib/api'
import { formatCurrency, formatDate, calculateNights } from '@/lib/utils'
import { 
  MapPin, Users, Bed, Bath, Square, Wifi, Car, Waves, Flame, 
  AirVent, Utensils, Tv, Washer, Calendar, ArrowLeft, Star 
} from 'lucide-react'

export default function HouseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [house, setHouse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState({
    guestEmail: '',
    guestFirstName: '',
    guestLastName: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: ''
  })
  const [availability, setAvailability] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchHouse()
    }
  }, [params.id])

  useEffect(() => {
    if (bookingData.checkInDate && bookingData.checkOutDate) {
      checkAvailability()
    }
  }, [bookingData.checkInDate, bookingData.checkOutDate])

  const fetchHouse = async () => {
    try {
      const response = await publicApi.getHouse(params.id)
      setHouse(response.data.house)
    } catch (error) {
      console.error('Failed to fetch house:', error)
      if (error.status === 404) {
        router.push('/houses')
      }
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async () => {
    try {
      const response = await publicApi.checkAvailability(
        params.id,
        new Date(bookingData.checkInDate),
        new Date(bookingData.checkOutDate)
      )
      setAvailability(response.data)
    } catch (error) {
      console.error('Failed to check availability:', error)
      setAvailability({ available: false })
    }
  }

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  const handleBooking = async () => {
    if (!availability?.available) {
      alert('Selected dates are not available')
      return
    }

    setBookingLoading(true)
    try {
      const nights = calculateNights(bookingData.checkInDate, bookingData.checkOutDate)
      const response = await publicApi.createBooking({
        houseId: parseInt(params.id),
        ...bookingData
      })

      setBookingSuccess(true)
      alert(`Booking confirmed! Booking ID: ${response.data.booking.id}`)
    } catch (error) {
      console.error('Booking failed:', error)
      alert(error.message || 'Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const amenities = [
    { key: 'wifi', icon: Wifi, label: 'WiFi' },
    { key: 'parking', icon: Car, label: 'Parking' },
    { key: 'pool', icon: Waves, label: 'Pool' },
    { key: 'fireplace', icon: Flame, label: 'Fireplace' },
    { key: 'air_conditioning', icon: AirVent, label: 'AC' },
    { key: 'kitchen', icon: Utensils, label: 'Kitchen' },
    { key: 'tv', icon: Tv, label: 'TV' },
    { key: 'washer_dryer', icon: Washer, label: 'Washer/Dryer' },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            </div>
            <div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!house) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              House not found
            </h2>
            <Button onClick={() => router.push('/houses')}>
              Back to Houses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nights = bookingData.checkInDate && bookingData.checkOutDate 
    ? calculateNights(bookingData.checkInDate, bookingData.checkOutDate) 
    : 0
  const totalAmount = nights * house.price_per_night

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            {house.images && house.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative h-96 md:col-span-2">
                  <Image
                    src={house.images[0]}
                    alt={house.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                {house.images.slice(1, 3).map((image, index) => (
                  <div key={index} className="relative h-48">
                    <Image
                      src={image}
                      alt={`${house.title} ${index + 2}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>

          {/* House Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {house.title}
            </h1>
            
            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{house.address}, {house.city}, {house.state}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span>{house.max_guests} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-600" />
                <span>{house.bedrooms} bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-600" />
                <span>{house.bathrooms} bathrooms</span>
              </div>
              {house.square_feet && (
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-gray-600" />
                  <span>{house.square_feet} sq ft</span>
                </div>
              )}
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-6">
              {formatCurrency(house.price_per_night)} 
              <span className="text-lg font-normal text-gray-600"> / night</span>
            </div>
          </div>

          {/* Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About this place</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {house.description}
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity) => (
                  house[amenity.key] && (
                    <div key={amenity.key} className="flex items-center gap-2">
                      <amenity.icon className="h-5 w-5 text-blue-600" />
                      <span>{amenity.label}</span>
                    </div>
                  )
                ))}
              </div>

              {house.custom_amenities && house.custom_amenities.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Special Features</h4>
                  <div className="space-y-2">
                    {house.custom_amenities.map((amenity, index) => (
                      <div key={index}>
                        <div className="font-medium">{amenity.name}</div>
                        {amenity.description && (
                          <div className="text-sm text-gray-600">{amenity.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Book Your Stay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <Input
                    type="date"
                    value={bookingData.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <Input
                    type="date"
                    value={bookingData.checkOutDate}
                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Availability Status */}
              {bookingData.checkInDate && bookingData.checkOutDate && availability && (
                <div className="p-3 rounded-lg border">
                  {availability.available ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="font-medium">Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="font-medium">Not Available</span>
                    </div>
                  )}
                </div>
              )}

              {/* Guest Information */}
              <div className="space-y-3">
                <h4 className="font-medium">Guest Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="First Name"
                    value={bookingData.guestFirstName}
                    onChange={(e) => handleInputChange('guestFirstName', e.target.value)}
                  />
                  <Input
                    placeholder="Last Name"
                    value={bookingData.guestLastName}
                    onChange={(e) => handleInputChange('guestLastName', e.target.value)}
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={bookingData.guestEmail}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={bookingData.guestPhone}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                />
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Special requests (optional)"
                  rows={3}
                  value={bookingData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                />
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>{formatCurrency(house.price_per_night)} × {nights} nights</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <Button
                className="w-full"
                onClick={handleBooking}
                disabled={
                  bookingLoading || 
                  !availability?.available || 
                  !bookingData.guestEmail || 
                  !bookingData.guestFirstName || 
                  !bookingData.guestLastName ||
                  !bookingData.checkInDate ||
                  !bookingData.checkOutDate ||
                  bookingSuccess
                }
              >
                {bookingLoading ? 'Booking...' : bookingSuccess ? 'Booked!' : 'Book Now'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You won't be charged yet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
