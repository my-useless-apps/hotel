const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.message || 'API request failed', response.status, data)
  }

  return data
}

// Auth API
export const authApi = {
  login: async (email, password) => {
    const response = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  verifyToken: async () => {
    try {
      return await fetchWithAuth('/api/auth/verify-token', { method: 'POST' })
    } catch (error) {
      authApi.logout()
      throw error
    }
  },
}

// Public API
export const publicApi = {
  getHouses: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    const url = `/api/houses${params.toString() ? `?${params.toString()}` : ''}`
    return await fetchWithAuth(url)
  },

  getHouse: async (id) => {
    return await fetchWithAuth(`/api/houses/${id}`)
  },

  checkAvailability: async (houseId, startDate, endDate) => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })
    
    return await fetchWithAuth(`/api/houses/${houseId}/availability?${params.toString()}`)
  },

  createBooking: async (bookingData) => {
    return await fetchWithAuth('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  },

  getBooking: async (id) => {
    return await fetchWithAuth(`/api/bookings/${id}`)
  },
}

// Admin API
export const adminApi = {
  getHouses: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value)
    })
    
    const url = `/admin/api/houses${params.toString() ? `?${params.toString()}` : ''}`
    return await fetchWithAuth(url)
  },

  getHouse: async (id) => {
    return await fetchWithAuth(`/admin/api/houses/${id}`)
  },

  createHouse: async (houseData) => {
    return await fetchWithAuth('/admin/api/houses', {
      method: 'POST',
      body: JSON.stringify(houseData),
    })
  },

  updateHouse: async (id, houseData) => {
    return await fetchWithAuth(`/admin/api/houses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(houseData),
    })
  },

  toggleHouseActivation: async (id) => {
    return await fetchWithAuth(`/admin/api/houses/${id}/toggle`, {
      method: 'PATCH',
    })
  },

  deleteHouse: async (id) => {
    return await fetchWithAuth(`/admin/api/houses/${id}`, {
      method: 'DELETE',
    })
  },

  getBookings: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    const url = `/admin/api/bookings${params.toString() ? `?${params.toString()}` : ''}`
    return await fetchWithAuth(url)
  },

  addBlockedDates: async (houseId, dates, reason) => {
    return await fetchWithAuth(`/admin/api/houses/${houseId}/blocked-dates`, {
      method: 'POST',
      body: JSON.stringify({ dates, reason }),
    })
  },
}

export { ApiError }
