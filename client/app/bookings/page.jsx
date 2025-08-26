'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { publicApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Calendar, MapPin, Users, Phone, Mail, MessageSquare } from 'lucide-react'

export default function BookingsPage() {
  const [bookingId, setBookingId] = useState('')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!bookingId.trim()) {
      setError('Please enter a booking ID')
      return
    }

    setLoading(true)
    setError('')
    setBooking(null)

    try {
      const response = await publicApi.getBooking(bookingId.trim())
      setBooking(response.data.booking)
    } catch (error) {
      console.error('Failed to fetch booking:', error)
      if (error.status === 404) {
        setError('Booking not found. Please check your booking ID.')
      } else {
        setError('Failed to fetch booking. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'cancelled':
        return 'destructive'
      case 'completed':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Booking
        </h1>
        <p className="text-lg text-gray-600">
          Enter your booking ID to view details and manage your reservation
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Booking Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID
              </label>
              <Input
                placeholder="Enter your booking ID (e.g., 12345)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      {booking && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  Booking #{booking.id}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {booking.house_title}
                </p>
              </div>
              <Badge variant={getStatusColor(booking.status)} className="text-sm">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Property Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-lg">{booking.house_title}</h4>
                <p className="text-gray-600">{booking.house_address}, {booking.house_city}</p>
              </div>
            </div>

            {/* Stay Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stay Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Check-in</div>
                  <div className="font-medium">
                    {formatDate(booking.check_in_date)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Check-out</div>
                  <div className="font-medium">
                    {formatDate(booking.check_out_date)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Total Nights</div>
                  <div className="font-medium">
                    {booking.total_nights} night{booking.total_nights !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guest Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {booking.guest_first_name} {booking.guest_last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{booking.guest_email}</span>
                </div>
                {booking.guest_phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{booking.guest_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Special Requests
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{booking.special_requests}</p>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount</span>
                  <span>{formatCurrency(booking.total_amount)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Booked on {formatDate(booking.created_at)}
                </div>
              </div>
            </div>

            {/* Actions */}
            {booking.status === 'confirmed' && (
              <div className="flex gap-4 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  Contact Host
                </Button>
                <Button variant="outline" className="flex-1">
                  Modify Booking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Can't find your booking?</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Check your email for the booking confirmation</li>
                <li>• Make sure you're using the correct booking ID</li>
                <li>• The booking ID is usually sent via email</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contact Support</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Email: support@premiumstays.com</li>
                <li>• Phone: 1-800-PREMIUM</li>
                <li>• Available 24/7</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
