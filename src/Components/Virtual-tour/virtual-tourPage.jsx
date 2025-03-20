import { useState, useEffect } from 'react'

const VirtualTour = () => {
  const [tourData, setTourData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get tour data from localStorage
    try {
      const storedData = localStorage.getItem('tourData')
      if (storedData) {
        setTourData(JSON.parse(storedData))
      } else {
        setError('No tour data found. Please create a tour first.')
      }
    } catch (err) {
      setError('Error loading tour data: ' + err.message)
      console.error('Error parsing tour data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading tour data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button 
          className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md"
          onClick={() => window.location.href = '/home'}
        >
          Return to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Virtual Tour Details</h1>
        
        {tourData && (
          <div>
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Tour ID</p>
                  <p className="font-medium">{tourData.tour_id}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Trip</p>
                  <p className="font-medium">{tourData.origin} to {tourData.destination}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Travel Dates</p>
                  <p className="font-medium">{tourData.travel_dates}</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Raw JSON Response:</h2>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(tourData, null, 2)}
            </pre>

            <div className="mt-6 flex justify-between">
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-5 rounded-md transition-colors"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </button>
              
              <button 
                className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md border-2 border-viridian-green hover:bg-transparent hover:text-viridian-green transition-colors"
                onClick={() => {
                  // You can implement saving or other actions here
                  alert('This feature will be implemented later!')
                }}
              >
                Save Tour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VirtualTour