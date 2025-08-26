'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { publicApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Search, MapPin, Users, Bed, Bath, Wifi, Car, Waves, Flame, Filter } from 'lucide-react'

export default function HousesPage() {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    guests: '',
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async (searchFilters = {}) => {
    setLoading(true)
    try {
      const response = await publicApi.getHouses({
        ...filters,
        ...searchFilters,
        limit: 12
      })
      setHouses(response.data.houses)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch houses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchHouses(filters)
  }

  const clearFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      guests: '',
    })
    fetchHouses({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Premium Vacation Houses
        </h1>
        <p className="text-lg text-gray-600">
          Discover your perfect getaway from our curated collection of luxury homes
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Filter Properties</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                placeholder="Enter city..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="$1000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <Input
                type="number"
                placeholder="Any"
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', e.target.value)}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!loading && (
        <div className="mb-6">
          <p className="text-gray-600">
            {pagination.totalCount ? `${pagination.totalCount} properties found` : 'No properties found'}
          </p>
        </div>
      )}

      {/* Houses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : houses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {houses.map((house) => (
            <Card key={house.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                  {house.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{house.city}, {house.state}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{house.max_guests} guests</span>
                  </div>
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{house.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{house.bathrooms} baths</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {house.wifi && <Wifi className="h-4 w-4 text-blue-600" />}
                  {house.parking && <Car className="h-4 w-4 text-blue-600" />}
                  {house.pool && <Waves className="h-4 w-4 text-blue-600" />}
                  {house.fireplace && <Flame className="h-4 w-4 text-blue-600" />}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {house.description}
                </p>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(house.price_per_night)}
                    </span>
                    <span className="text-gray-600"> / night</span>
                  </div>
                  <Link href={`/houses/${house.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPreviousPage}
              onClick={() => fetchHouses({ ...filters, page: pagination.currentPage - 1 })}
            >
              Previous
            </Button>
            
            <span className="px-4 py-2 text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => fetchHouses({ ...filters, page: pagination.currentPage + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
