import { supabase, TABLES } from '../lib/supabase'

/**
 * Data service for fetching country and news data from Supabase
 */
class DataService {
  
  /**
   * Fetch all countries with their current sentiment data
   * Expected table structure:
   * - id: number
   * - name: string
   * - lat: number  
   * - lon: number
   * - news_count: number
   * - sentiment: string ('very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative')
   * - updated_at: timestamp
   */
  async getCountriesData() {
    try {
      const { data, error } = await supabase
        .from(TABLES.COUNTRIES)
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching countries data:', error)
        return this.getMockCountriesData() // Fallback to mock data
      }

      // Transform the data to match our existing structure
      return data.map(country => ({
        id: country.id,
        name: country.name,
        lat: country.lat,
        lon: country.lon,
        newsCount: country.news_count || 0,
        sentiment: country.sentiment || 'neutral'
      }))

    } catch (error) {
      console.error('Network error fetching countries:', error)
      return this.getMockCountriesData()
    }
  }

  /**
   * Fetch news data for a specific country
   * Expected table structure:
   * - id: number
   * - country_id: number (foreign key)
   * - city: string
   * - title: string
   * - summary: string
   * - category: string
   * - severity: string ('high' | 'medium' | 'low')
   * - timestamp: timestamp
   */
  async getNewsForCountry(countryId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .eq('country_id', countryId)
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching news data:', error)
        return this.getMockNewsData(countryId)
      }

      // Group news by city
      const newsByCity = {}
      data.forEach(news => {
        const city = news.city || 'Unknown'
        if (!newsByCity[city]) {
          newsByCity[city] = []
        }
        newsByCity[city].push({
          id: news.id,
          title: news.title,
          summary: news.summary,
          category: news.category,
          severity: news.severity,
          timestamp: news.timestamp
        })
      })

      return newsByCity

    } catch (error) {
      console.error('Network error fetching news:', error)
      return this.getMockNewsData(countryId)
    }
  }

  /**
   * Fetch real-time sentiment data for map coloring
   */
  async getSentimentData() {
    try {
      const { data, error } = await supabase
        .from(TABLES.SENTIMENT_DATA)
        .select('country_name, sentiment_score, color_code')

      if (error) {
        console.error('Error fetching sentiment data:', error)
        return this.getMockSentimentData()
      }

      // Convert to key-value pairs for easy lookup
      const sentimentMap = {}
      data.forEach(item => {
        sentimentMap[item.country_name] = {
          score: item.sentiment_score,
          color: item.color_code
        }
      })

      return sentimentMap

    } catch (error) {
      console.error('Network error fetching sentiment data:', error)
      return this.getMockSentimentData()
    }
  }

  /**
   * Subscribe to real-time changes in countries data
   */
  subscribeToCountriesChanges(callback) {
    const subscription = supabase
      .channel('countries_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.COUNTRIES 
        }, 
        callback
      )
      .subscribe()

    return subscription
  }

  /**
   * Subscribe to real-time changes in news data
   */
  subscribeToNewsChanges(callback) {
    const subscription = supabase
      .channel('news_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.NEWS 
        }, 
        callback
      )
      .subscribe()

    return subscription
  }

  // Fallback mock data methods (existing hardcoded data as backup)
  getMockCountriesData() {
    console.warn('Using mock countries data as fallback')
    return [
      // VERY POSITIVE (≥50) - 5 countries
      { id: 1, name: "USA", lat: 37.0902, lon: -95.7129, newsCount: 65, sentiment: "very-positive" },
      { id: 44, name: "China", lat: 35.8617, lon: 104.1954, newsCount: 67, sentiment: "very-positive" },
      { id: 41, name: "India", lat: 20.5937, lon: 78.9629, newsCount: 58, sentiment: "very-positive" },
      { id: 10, name: "UK", lat: 55.3781, lon: -3.4360, newsCount: 52, sentiment: "very-positive" },
      { id: 25, name: "Russia", lat: 61.5240, lon: 105.3188, newsCount: 55, sentiment: "very-positive" },
      
      // POSITIVE (30-49) - 12 countries
      { id: 12, name: "France", lat: 46.2276, lon: 2.2137, newsCount: 42, sentiment: "positive" },
      { id: 11, name: "Germany", lat: 51.1657, lon: 10.4515, newsCount: 38, sentiment: "positive" },
      { id: 30, name: "Ukraine", lat: 48.3794, lon: 31.1656, newsCount: 44, sentiment: "positive" },
      { id: 45, name: "Japan", lat: 36.2048, lon: 138.2529, newsCount: 36, sentiment: "positive" },
      { id: 4, name: "Brazil", lat: -14.2350, lon: -51.9253, newsCount: 34, sentiment: "positive" },
      { id: 33, name: "Israel", lat: 31.0461, lon: 34.8516, newsCount: 40, sentiment: "positive" },
      { id: 32, name: "Turkey", lat: 38.9637, lon: 35.2433, newsCount: 33, sentiment: "positive" },
      { id: 14, name: "Italy", lat: 41.8719, lon: 12.5674, newsCount: 35, sentiment: "positive" },
      { id: 46, name: "South Korea", lat: 35.9078, lon: 127.7669, newsCount: 31, sentiment: "positive" },
      { id: 2, name: "Canada", lat: 56.1304, lon: -106.3468, newsCount: 37, sentiment: "positive" },
      { id: 61, name: "Australia", lat: -25.2744, lon: 133.7751, newsCount: 32, sentiment: "positive" },
      { id: 42, name: "Pakistan", lat: 30.3753, lon: 69.3451, newsCount: 30, sentiment: "positive" },
      
      // NEUTRAL (20-29) - 15 countries
      { id: 3, name: "Mexico", lat: 23.6345, lon: -102.5528, newsCount: 27, sentiment: "neutral" },
      { id: 13, name: "Spain", lat: 40.4637, lon: -3.7492, newsCount: 24, sentiment: "neutral" },
      { id: 36, name: "Iran", lat: 32.4279, lon: 53.6880, newsCount: 26, sentiment: "neutral" },
      { id: 56, name: "Egypt", lat: 26.8206, lon: 30.8025, newsCount: 25, sentiment: "neutral" },
      { id: 34, name: "Saudi Arabia", lat: 23.8859, lon: 45.0792, newsCount: 23, sentiment: "neutral" },
      { id: 54, name: "Nigeria", lat: 9.0820, lon: 8.6753, newsCount: 22, sentiment: "neutral" },
      { id: 37, name: "Iraq", lat: 33.2232, lon: 43.6793, newsCount: 21, sentiment: "neutral" },
      { id: 35, name: "UAE", lat: 23.4241, lon: 53.8478, newsCount: 28, sentiment: "neutral" },
      { id: 26, name: "Poland", lat: 51.9194, lon: 19.1451, newsCount: 20, sentiment: "neutral" },
      { id: 47, name: "Indonesia", lat: -0.7893, lon: 113.9213, newsCount: 29, sentiment: "neutral" },
      { id: 43, name: "Bangladesh", lat: 23.6850, lon: 90.3563, newsCount: 22, sentiment: "neutral" },
      { id: 53, name: "South Africa", lat: -30.5595, lon: 22.9375, newsCount: 24, sentiment: "neutral" },
      { id: 9, name: "Venezuela", lat: 6.4238, lon: -66.5897, sentiment: "neutral", newsCount: 26 },
      { id: 52, name: "Singapore", lat: 1.3521, lon: 103.8198, newsCount: 21, sentiment: "neutral" },
      { id: 15, name: "Netherlands", lat: 52.1326, lon: 5.2913, newsCount: 20, sentiment: "neutral" },
      
      // NEGATIVE (10-19) - 20 countries
      { id: 5, name: "Argentina", lat: -38.4161, lon: -63.6167, newsCount: 18, sentiment: "negative" },
      { id: 7, name: "Colombia", lat: 4.5709, lon: -74.2973, newsCount: 17, sentiment: "negative" },
      { id: 48, name: "Thailand", lat: 15.8700, lon: 100.9925, newsCount: 16, sentiment: "negative" },
      { id: 50, name: "Philippines", lat: 12.8797, lon: 121.7740, newsCount: 15, sentiment: "negative" },
      { id: 39, name: "Lebanon", lat: 33.8547, lon: 35.8623, newsCount: 14, sentiment: "negative" },
      { id: 49, name: "Vietnam", lat: 14.0583, lon: 108.2772, newsCount: 19, sentiment: "negative" },
      { id: 31, name: "Greece", lat: 39.0742, lon: 21.8243, newsCount: 16, sentiment: "negative" },
      { id: 17, name: "Switzerland", lat: 46.8182, lon: 8.2275, newsCount: 18, sentiment: "negative" },
      { id: 21, name: "Sweden", lat: 60.1282, lon: 18.6435, newsCount: 17, sentiment: "negative" },
      { id: 51, name: "Malaysia", lat: 4.2105, lon: 101.9758, newsCount: 15, sentiment: "negative" },
      { id: 55, name: "Kenya", lat: -0.0236, lon: 37.9062, newsCount: 14, sentiment: "negative" },
      { id: 16, name: "Belgium", lat: 50.5039, lon: 4.4699, newsCount: 13, sentiment: "negative" },
      { id: 29, name: "Romania", lat: 45.9432, lon: 24.9668, newsCount: 16, sentiment: "negative" },
      { id: 38, name: "Qatar", lat: 25.3548, lon: 51.1839, newsCount: 12, sentiment: "negative" },
      { id: 58, name: "Morocco", lat: 31.7917, lon: -7.0926, newsCount: 14, sentiment: "negative" },
      { id: 18, name: "Austria", lat: 47.5162, lon: 14.5501, newsCount: 15, sentiment: "negative" },
      { id: 40, name: "Jordan", lat: 30.5852, lon: 36.2384, newsCount: 11, sentiment: "negative" },
      { id: 22, name: "Norway", lat: 60.4720, lon: 8.4689, newsCount: 13, sentiment: "negative" },
      { id: 27, name: "Czech Republic", lat: 49.8175, lon: 15.4730, newsCount: 17, sentiment: "negative" },
      { id: 59, name: "Ethiopia", lat: 9.1450, lon: 40.4897, newsCount: 12, sentiment: "negative" },
      
      // VERY NEGATIVE (<10) - 10 countries
      { id: 6, name: "Chile", lat: -35.6751, lon: -71.5430, newsCount: 8, sentiment: "very-negative" },
      { id: 8, name: "Peru", lat: -9.1900, lon: -75.0152, newsCount: 7, sentiment: "very-negative" },
      { id: 19, name: "Portugal", lat: 39.3999, lon: -8.2245, newsCount: 9, sentiment: "very-negative" },
      { id: 20, name: "Ireland", lat: 53.4129, lon: -8.2439, newsCount: 6, sentiment: "very-negative" },
      { id: 23, name: "Denmark", lat: 56.2639, lon: 9.5018, newsCount: 8, sentiment: "very-negative" },
      { id: 24, name: "Finland", lat: 61.9241, lon: 25.7482, newsCount: 7, sentiment: "very-negative" },
      { id: 28, name: "Hungary", lat: 47.1625, lon: 19.5033, newsCount: 9, sentiment: "very-negative" },
      { id: 57, name: "Ghana", lat: 7.9465, lon: -1.0232, newsCount: 6, sentiment: "very-negative" },
      { id: 60, name: "Tanzania", lat: -6.3690, lon: 34.8888, newsCount: 5, sentiment: "very-negative" },
      { id: 62, name: "New Zealand", lat: -40.9006, lon: 174.8860, newsCount: 8, sentiment: "very-negative" },
    ]
  }

  getMockNewsData(countryId) {
    console.warn(`Using mock news data for country ${countryId} as fallback`)
    
    const mockNewsDatabase = {
      1: { // United States
        'New York': [
          {
            id: 1,
            title: 'Tech Innovation Hub Expands in Manhattan',
            summary: 'Major tech companies announce new offices in NYC...',
            category: 'Technology',
            severity: 'high',
            timestamp: '2025-10-02T10:30:00Z'
          }
        ]
      }
    }

    return mockNewsDatabase[countryId] || {}
  }

  getMockSentimentData() {
    console.warn('Using mock sentiment data as fallback')
    return {
      'United States': { score: 0.8, color: '#4ade80' },
      'China': { score: 0.7, color: '#4ade80' },
      'India': { score: 0.6, color: '#4ade80' },
      // Add more mock sentiment data as needed
    }
  }
}

const dataServiceInstance = new DataService();
export default dataServiceInstance;