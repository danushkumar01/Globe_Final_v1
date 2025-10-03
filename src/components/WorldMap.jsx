import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../hooks/useTheme.jsx'
import { useSentimentData } from '../hooks/useData.js'

const WorldMap = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const countriesLayerRef = useRef(null)
  const lightTileLayerRef = useRef(null)
  const darkTileLayerRef = useRef(null)
  
  const { currentTheme } = useTheme()
  
  // Load sentiment data from Supabase
  const { sentimentData, loading: sentimentLoading, error: sentimentError } = useSentimentData()
  
  const [countryColors, setCountryColors] = useState({})
  
  const colors = ['#28a745', '#dc3545', '#fd7e14'] // Green, Red, Orange (fallback colors)

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Ensure the container is properly sized
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      console.warn('Map container not properly sized, retrying...')
      const retryTimer = setTimeout(() => {
        if (mapRef.current && !mapInstanceRef.current) {
          // Retry map initialization
          const map = L.map(mapRef.current, {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 18,
            worldCopyJump: true
          })
          mapInstanceRef.current = map
          initializeMapLayers(map)
        }
      }, 100)
      return () => clearTimeout(retryTimer)
    }

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true
    })

    mapInstanceRef.current = map
    initializeMapLayers(map)
    // Add map event listeners
    map.on('zoomend', function() {
      const zoom = map.getZoom()
      if (countriesLayerRef.current) {
        const weight = zoom > 4 ? 2 : 1
        countriesLayerRef.current.eachLayer(function(layer) {
          if (layer.feature) {
            layer.setStyle({ weight: weight })
          }
        })
      }
      if (zoom <= 2) {
        const center = map.getCenter()
        if (center.lat > 70 || center.lat < -50) {
          map.setView([10, center.lng], zoom, { animate: false })
        }
      }
    })

    // Initialize map layers
    initializeMapLayers(map)

    // Add loaded class for animation
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.classList.add('loaded')
      }
    }, 500)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Separate function to initialize map layers
  const initializeMapLayers = (map) => {
    if (!map) return

    const lightTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxZoom: 18,
      noWrap: false
    })

    const darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxZoom: 18,
      noWrap: false
    })

    lightTileLayerRef.current = lightTileLayer
    darkTileLayerRef.current = darkTileLayer

    if (currentTheme === 'dark') {
      darkTileLayer.addTo(map)
    } else {
      lightTileLayer.addTo(map)
    }

    map.zoomControl.setPosition('topright')
    
    // Wait for map to be ready before loading countries
    map.whenReady(() => {
      loadCountries(map)
    })
  }

  // Handle theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !lightTileLayerRef.current || !darkTileLayerRef.current) return

    const map = mapInstanceRef.current
    if (currentTheme === 'dark') {
      map.removeLayer(lightTileLayerRef.current)
      map.addLayer(darkTileLayerRef.current)
    } else {
      map.removeLayer(darkTileLayerRef.current)
      map.addLayer(lightTileLayerRef.current)
    }
    
    if (countriesLayerRef.current) {
      countriesLayerRef.current.eachLayer(function(layer) {
        if (layer.feature) {
          layer.setStyle(styleCountry(layer.feature))
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTheme])

  // ✅ Load country data safely
  const loadCountries = async (map) => {
    if (!map || !map.getContainer()) {
      console.warn('Map not ready for loading countries')
      return
    }

    console.log('Loading country data...')
    
    try {
      const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (!data || !data.features || !Array.isArray(data.features)) {
        throw new Error('Invalid GeoJSON data structure')
      }

      console.log(`Loaded ${data.features.length} countries`)

      // Filter out invalid features and log issues
      const validFeatures = data.features.filter(f => {
        if (!f.geometry || !f.geometry.coordinates) {
          console.warn("Skipping feature with missing geometry:", f.properties?.name)
          return false
        }
        return true
      })

      if (validFeatures.length === 0) {
        throw new Error('No valid country features found')
      }
      
      const newCountryColors = assignColorsToCountries(validFeatures)
      setCountryColors(newCountryColors)
      
      // More robust GeoJSON layer creation
      const mainLayer = L.geoJSON({...data, features: validFeatures}, {
        style: (feature) => styleCountry(feature, newCountryColors),
        onEachFeature: (feature, layer) => {
          try {
            onEachCountry(feature, layer, map, newCountryColors)
          } catch (err) {
            console.warn('Error setting up country interaction:', feature.properties?.name, err)
          }
        },
        coordsToLatLng: (coords) => {
          // Enhanced coordinate validation
          if (
            !Array.isArray(coords) ||
            coords.length < 2 ||
            typeof coords[0] !== 'number' ||
            typeof coords[1] !== 'number' ||
            isNaN(coords[0]) ||
            isNaN(coords[1]) ||
            !isFinite(coords[0]) ||
            !isFinite(coords[1])
          ) {
            console.warn("Invalid coordinates detected:", coords)
            return L.latLng(0, 0) // Safe fallback
          }
          return L.latLng(coords[1], coords[0])
        }
      })
      
      // Safely add layer to map
      if (map && map.getContainer()) {
        countriesLayerRef.current = mainLayer.addTo(map)
        map.setView([10, 0], 2)
        console.log('Countries loaded successfully')
      } else {
        throw new Error('Map container not available')
      }
      
    } catch (error) {
      console.error('Error loading country data:', error)
      // Use fallback map
      createFallbackMap(map)
    }
  }

  const assignColorsToCountries = (countries) => {
    const newCountryColors = {}
    countries.forEach(country => {
      const countryName = country.properties.name || country.properties.NAME || 'Unknown'
      
      // Try to use real sentiment data from Supabase first
      if (sentimentData[countryName]) {
        newCountryColors[countryName] = sentimentData[countryName].color
      } else {
        // Fallback to random colors if no sentiment data
        const colorIndex = Math.floor(Math.random() * colors.length)
        newCountryColors[countryName] = colors[colorIndex]
      }
    })
    return newCountryColors
  }

  const styleCountry = (feature, colors = countryColors) => {
    const countryName = feature.properties.name || feature.properties.NAME || 'Unknown'
    const color = colors[countryName] || colors[0]
    const borderColor = currentTheme === 'dark' ? '#374151' : '#ffffff'
    
    return {
      fillColor: color,
      weight: 0.5,
      opacity: 0.9,
      color: borderColor,
      fillOpacity: 0.85,
      dashArray: '0',
      className: 'country-polygon'
    }
  }

  const onEachCountry = (feature, layer, map, colors) => {
    const countryName = feature.properties.name || feature.properties.NAME || 'Unknown'
    
    setTimeout(() => {
      if (layer.options && !layer._originalStyle) {
        layer._originalStyle = {
          fillColor: layer.options.fillColor,
          weight: layer.options.weight,
          opacity: layer.options.opacity,
          color: layer.options.color,
          fillOpacity: layer.options.fillOpacity,
          dashArray: layer.options.dashArray
        }
      }
    }, 100)
    
    layer.on({
      mouseover: function(e) {
        highlightCountry(e)
        showTooltip(e, countryName)
      },
      mouseout: function(e) {
        resetCountryStyle(e)
        hideTooltip()
      },
      click: function(e) {
        showCountryInfo(countryName, map)
        map.fitBounds(e.target.getBounds())
      }
    })
  }

  const highlightCountry = (e) => {
    const layer = e.target
    if (!layer._originalStyle) {
      layer._originalStyle = { ...layer.options }
    }
    layer.setStyle({
      fillColor: layer._originalStyle.fillColor,
      weight: 3,
      color: '#ffffff',
      fillOpacity: layer._originalStyle.fillOpacity,
      opacity: 1,
      dashArray: '0'
    })
    layer.bringToFront()
  }

  const resetCountryStyle = (e) => {
    const layer = e.target
    if (layer._originalStyle) {
      layer.setStyle(layer._originalStyle)
    } else {
      layer.setStyle(styleCountry(layer.feature))
    }
  }

  const showTooltip = (e, countryName) => {
    const tooltip = document.createElement('div')
    tooltip.className = 'country-tooltip'
    tooltip.innerHTML = countryName
    tooltip.id = 'country-tooltip'
    
    const existingTooltip = document.getElementById('country-tooltip')
    if (existingTooltip) existingTooltip.remove()
    
    document.body.appendChild(tooltip)
    
    const handleMouseMove = (event) => {
      tooltip.style.position = 'fixed'
      tooltip.style.left = (event.clientX + 10) + 'px'
      tooltip.style.top = (event.clientY - 30) + 'px'
      tooltip.style.pointerEvents = 'none'
      tooltip.style.zIndex = '9999'
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    tooltip._handleMouseMove = handleMouseMove
  }

  const hideTooltip = () => {
    const tooltip = document.getElementById('country-tooltip')
    if (tooltip) {
      if (tooltip._handleMouseMove) {
        document.removeEventListener('mousemove', tooltip._handleMouseMove)
      }
      tooltip.remove()
    }
  }

  const showCountryInfo = (countryName, map) => {
    // Get sentiment data for this country
    const sentiment = sentimentData[countryName]
    
    const popupContent = `
      <div style="text-align: center; padding: 12px 16px;">
        <h3 style="margin: 0; color: var(--text-primary); font-size: 20px; font-weight: 600;">${countryName}</h3>
        ${sentiment ? `
          <div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px;">
            <div style="font-size: 14px; color: var(--text-secondary);">
              Sentiment Score: <strong>${sentiment.score.toFixed(2)}</strong>
            </div>
            <div style="width: 20px; height: 20px; background: ${sentiment.color}; border-radius: 50%; margin: 4px auto;"></div>
            <div style="font-size: 12px; color: var(--text-muted);">
              🔴 Live data from Supabase
            </div>
          </div>
        ` : `
          <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
            ⚪ No sentiment data available
          </div>
        `}
      </div>
    `
    
    L.popup({
      className: 'professional-popup',
      closeButton: true,
      autoClose: false,
      closeOnEscapeKey: true
    })
      .setLatLng(map.getCenter())
      .setContent(popupContent)
      .openOn(map)
  }

  // Fallback map creation (in case the external GeoJSON fails)
  const createFallbackMap = (map) => {
    if (!map || !map.getContainer()) {
      console.warn('Map not ready for fallback creation')
      return
    }

    console.log('Creating fallback map with sample countries')
    
    // Create sample countries with basic shapes
    const sampleCountries = [
      {
        name: "United States",
        bounds: [[24.396308, -125.0], [49.384358, -66.93457]],
        color: colors[0]
      },
      {
        name: "Canada", 
        bounds: [[41.676555, -141.0], [83.23324, -52.636291]],
        color: colors[1]
      },
      {
        name: "Brazil",
        bounds: [[-33.750706, -73.982817], [5.264877, -32.392998]],
        color: colors[2]
      },
      {
        name: "Russia",
        bounds: [[41.151416, 19.66064], [81.857361, 180.0]],
        color: colors[0]
      },
      {
        name: "China",
        bounds: [[15.775279, 73.557693], [53.560974, 134.77281]],
        color: colors[1]
      },
      {
        name: "Australia",
        bounds: [[-43.634597, 113.338953], [-10.668187, 153.569469]],
        color: colors[2]
      }
    ]
    
    try {
      sampleCountries.forEach(country => {
        // Validate bounds before creating rectangle
        if (!country.bounds || !Array.isArray(country.bounds) || country.bounds.length !== 2) {
          console.warn('Invalid bounds for country:', country.name)
          return
        }

        const rectangle = L.rectangle(country.bounds, {
          color: currentTheme === 'dark' ? '#374151' : '#ffffff',
          weight: 2,
          fillColor: country.color,
          fillOpacity: 0.7
        })
        
        // Safely add to map
        if (map && map.getContainer()) {
          rectangle.addTo(map)
          rectangle.bindPopup(`<strong>${country.name}</strong><br>Sample country area`)
          
          rectangle.on('mouseover', function() {
            this.setStyle({ fillOpacity: 0.9, weight: 3 })
          })
          
          rectangle.on('mouseout', function() {
            this.setStyle({ fillOpacity: 0.7, weight: 2 })
          })
        }
      })
      
      // Set a nice world view for the fallback
      map.setView([10, 0], 2)
      console.log('Fallback map created successfully')
      
    } catch (error) {
      console.error('Error creating fallback map:', error)
    }
  }

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />
      
      {/* Data status indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        {sentimentLoading ? (
          <span style={{ color: '#fbbf24' }}>📡 Loading sentiment data...</span>
        ) : sentimentError ? (
          <span style={{ color: '#f87171' }}>⚠️ Using fallback colors</span>
        ) : (
          <span style={{ color: '#4ade80' }}>
            ✅ Live sentiment data • {Object.keys(sentimentData).length} countries
          </span>
        )}
      </div>
    </div>
  )
}

export default WorldMap
