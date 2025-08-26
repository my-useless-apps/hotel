'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { publicApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Search, MapPin, Users, Bed, Bath, Wifi, Car, Waves, Flame } from 'lucide-react'

export default function HomePage() {
  const [featuredHouses, setFeaturedHouses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedHouses = async () => {
      try {
        const response = await publicApi.getHouses({ limit: 3 })
        setFeaturedHouses(response.data.houses)
      } catch (error) {
        console.error('Failed to fetch featured houses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedHouses()
  }, [])

  const features = [
    {
      icon: Search,
      title: 'Easy Search',
      description: 'Find your perfect vacation home with advanced filters'
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Curated properties in the most desirable destinations'
    },
    {
      icon: Users,
      title: 'All Group Sizes',
      description: 'From romantic getaways to large family reunions'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your Perfect Getaway Awaits
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Discover and book premium vacation homes for unforgettable experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/houses">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Browse Houses
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Premium Stays?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide exceptional vacation rental experiences with carefully curated properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Houses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
          <p className="text-lg text-gray-600">
            Handpicked homes for your next vacation
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHouses.map((house) => (
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
                  <h3 className="text-xl font-semibold mb-2">{house.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{house.city}, {house.state}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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

                  <div className="flex items-center gap-2 mb-4">
                    {house.wifi && <Wifi className="h-4 w-4 text-gray-600" />}
                    {house.parking && <Car className="h-4 w-4 text-gray-600" />}
                    {house.pool && <Waves className="h-4 w-4 text-gray-600" />}
                    {house.fireplace && <Flame className="h-4 w-4 text-gray-600" />}
                  </div>

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

        <div className="text-center mt-12">
          <Link href="/houses">
            <Button size="lg" variant="outline">
              View All Properties
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Next Adventure?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust Premium Stays for their vacation rentals
          </p>
          <Link href="/houses">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Your Search
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

