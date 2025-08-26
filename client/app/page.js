export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Premium Stays
        </h1>
        <h2 className="text-3xl mb-8 opacity-90">
          Vacation Rental Platform
        </h2>
        
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-4">🎯 Core Feature: House Activation/Deactivation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-green-300">✅ Active Houses:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Visible on public site</li>
                <li>Searchable by guests</li>
                <li>Available for booking</li>
                <li>Real-time calendar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300">❌ Inactive Houses:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Hidden from public</li>
                <li>Admin-only visibility</li>
                <li>Cannot be booked</li>
                <li>Toggle control in dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">🏗️ Full-Stack Architecture</h3>
            <p className="text-sm">Next.js + Express.js + PostgreSQL</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">🔐 Admin Dashboard</h3>
            <p className="text-sm">JWT authentication with activation controls</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">📱 Modern UI</h3>
            <p className="text-sm">Shadcn/UI components with Tailwind CSS</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">🚀 Ready to Deploy</h3>
          <p className="text-lg opacity-90">Complete vacation rental platform with critical activation feature</p>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h4 className="font-semibold mb-3">📋 Deployment Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Set up PostgreSQL database</li>
              <li>Configure environment variables</li>
              <li>Run: <code className="bg-black/30 px-2 py-1 rounded">npm run install:all</code></li>
              <li>Run: <code className="bg-black/30 px-2 py-1 rounded">npm run seed</code></li>
              <li>Run: <code className="bg-black/30 px-2 py-1 rounded">npm run dev</code></li>
            </ol>
          </div>

          <div className="mt-8 text-sm opacity-75">
            <p>📁 Project saved locally at: <strong>Desktop/hotel-project</strong></p>
            <p>🔗 Ready to push to: <strong>github.com/my-useless-apps/hotel</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}

