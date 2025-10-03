import { useState, useEffect, useCallback } from 'react'
import DataService from '../services/DataService'

/**
 * Custom hook for managing countries data with real-time updates
 */
export const useCountriesData = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await DataService.getCountriesData()
      setCountries(data)
      setLastUpdated(new Date())
      
      console.log(`✅ Loaded ${data.length} countries from Supabase`)
    } catch (err) {
      console.error('Error fetching countries:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCountries()

    // Set up real-time subscription
    const subscription = DataService.subscribeToCountriesChanges((payload) => {
      console.log('🔄 Countries data changed:', payload)
      // Refresh data when changes occur
      fetchCountries()
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [fetchCountries])

  const refreshData = useCallback(() => {
    fetchCountries()
  }, [fetchCountries])

  return {
    countries,
    loading,
    error,
    lastUpdated,
    refreshData
  }
}

/**
 * Custom hook for managing news data for a specific country
 */
export const useCountryNews = (countryId) => {
  const [newsData, setNewsData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    if (!countryId) {
      setNewsData({})
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = await DataService.getNewsForCountry(countryId)
      setNewsData(data)
      
      console.log(`✅ Loaded news for country ${countryId}`)
    } catch (err) {
      console.error('Error fetching news:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [countryId])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  useEffect(() => {
    if (!countryId) return

    // Set up real-time subscription for news changes
    const subscription = DataService.subscribeToNewsChanges((payload) => {
      // Only refresh if the change affects this country
      if (payload.new?.country_id === countryId || payload.old?.country_id === countryId) {
        console.log(`🔄 News data changed for country ${countryId}:`, payload)
        fetchNews()
      }
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [countryId, fetchNews])

  return {
    newsData,
    loading,
    error,
    refreshNews: fetchNews
  }
}

/**
 * Custom hook for managing sentiment data (for 2D map coloring)
 */
export const useSentimentData = () => {
  const [sentimentData, setSentimentData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSentiment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await DataService.getSentimentData()
      setSentimentData(data)
      
      console.log('✅ Loaded sentiment data from Supabase')
    } catch (err) {
      console.error('Error fetching sentiment data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSentiment()
  }, [fetchSentiment])

  return {
    sentimentData,
    loading,
    error,
    refreshSentiment: fetchSentiment
  }
}