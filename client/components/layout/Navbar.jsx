'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api'
import { Home, UserCog, LogOut, Calendar, Settings } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authApi.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authApi.logout()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Premium Stays</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/houses">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Browse Houses</span>
              </Button>
            </Link>
            
            <Link href="/bookings">
              <Button variant="ghost">My Bookings</Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {(user.role === 'admin' || user.role === 'staff') && (
                  <Link href="/admin">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center space-x-2">
                  <UserCog className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/admin/login">
                <Button className="flex items-center space-x-2">
                  <UserCog className="h-4 w-4" />
                  <span>Admin Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
