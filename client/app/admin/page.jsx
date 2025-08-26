'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { authApi, adminApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { 
  Settings, Home, Users, Calendar, Plus, 
  MapPin, Bed, Bath, Eye, EyeOff, Edit,
  TrendingUp, Activity, DollarSign
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [houses, setHouses] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [toggleLoading, setToggleLoading] = useState({})

  useEffect(() => {
    const currentUser = authApi.getCurrentUser()
    if (!currentUser) {
      router.push('/admin/login')
      return
    }
    
    if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
      router.push('/')
      return
    }

    setUser(currentUser)
    fetchHouses()
  }, [router])

  const fetchHouses = async () => {
    try {
      const response = await adminApi.getHouses({ includeInactive: true })
      setHouses(response.data.houses)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Failed to fetch houses:', error)
      if (error.status === 401) {
        authApi.logout()
        router.push('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActivation = async (houseId) => {
    setToggleLoading(prev => ({ ...prev, [houseId]: true }))
    
    try {
      const response = await adminApi.toggleHouseActivation(houseId)
      
      // Update the house in the state
      setHouses(prev => prev.map(house => 
        house.id === houseId 
          ? { ...house, is_active: response.data.house.isActive }
          : house
      ))

      // Update stats
      setStats(prev => {
        const newActive = response.data.house.isActive ? prev.active + 1 : prev.active - 1
        const newInactive = response.data.house.isActive ? prev.inactive - 1 : prev.inactive + 1
        return {
          ...prev,
          active: newActive,
          inactive: newInactive
        }
      })

      console.log(response.data.message)
    } catch (error) {
      console.error('Failed to toggle house activation:', error)
      alert('Failed to update house status. Please try again.')
    } finally {
      setToggleLoading(prev => ({ ...prev, [houseId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-8 w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Welcome back, {user.firstName}! Manage your vacation rental properties.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New House
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Houses</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-gray-500 mt-1">Visible to public</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Houses</p>
                <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
                <p className="text-xs text-gray-500 mt-1">Hidden from public</p>
              </div>
              <EyeOff className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Feature Highlight */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              🎯 House Activation System - Core Feature
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Active Houses:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Visible on public website</li>
                <li>• Available for booking</li>
                <li>• Searchable by guests</li>
                <li>• Real-time availability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">❌ Inactive Houses:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Hidden from public view</li>
                <li>• Cannot be booked</li>
                <li>• Admin-only visibility</li>
                <li>• Toggle anytime below</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Houses Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {houses.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No properties yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first vacation rental property
              </p>
              <Button>Add First Property</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {houses.map((house) => (
                <Card key={house.id} className="overflow-hidden">
                  <div className="relative h-48">
                    {house.images && house.images.length > 0 ? (
                      <Image
                        src={house.images[0]}
                        alt={house.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge 
                        variant={house.is_active ? 'success' : 'secondary'}
                        className="shadow-sm"
                      >
                        {house.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Activation Toggle */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={house.is_active}
                            onCheckedChange={() => handleToggleActivation(house.id)}
                            disabled={toggleLoading[house.id]}
                            className="data-[state=checked]:bg-green-600"
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {house.is_active ? 'Public' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {house.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{house.city}, {house.state}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{house.max_guests}</span>
                      </div>
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{house.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{house.bathrooms}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(house.price_per_night)}
                        </span>
                        <span className="text-gray-600 text-sm"> / night</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Bookings
                      </Button>
                    </div>

                    {/* Activation Status Indicator */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {house.is_active ? 'Bookable by guests' : 'Not available for booking'}
                        </span>
                        {toggleLoading[house.id] ? (
                          <span className="text-blue-600">Updating...</span>
                        ) : (
                          <span className={house.is_active ? 'text-green-600' : 'text-gray-600'}>
                            {house.is_active ? '● Live' : '● Hidden'}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Bookings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Guest Management
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold">$12,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Month</span>
                <span className="font-semibold">$9,320</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Properties</span>
                <span className="font-semibold text-green-600">{stats.active}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
