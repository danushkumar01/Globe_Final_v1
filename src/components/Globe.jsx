import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { loadAllEarthTextures } from './RealEarthTextures';
import { useCountriesData, useCountryNews } from '../hooks/useData';

// Create fallback texture
const createFallbackTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Bright ocean background
  const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
  gradient.addColorStop(0, '#1e40af');
  gradient.addColorStop(0.5, '#0ea5e9');
  gradient.addColorStop(1, '#1e40af');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2048, 1024);
  
  // Continents
  ctx.fillStyle = '#10b981';
  ctx.fillRect(200, 250, 400, 350);
  ctx.fillRect(550, 450, 250, 400);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(950, 250, 250, 200);
  ctx.fillRect(950, 450, 350, 350);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(1250, 150, 600, 500);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// Note: Countries data is now loaded from Supabase via useCountriesData hook
// The hardcoded data has been moved to DataService.js as fallback

// Convert latitude/longitude to 3D position on sphere
// Using standard geographic coordinate system
const latLonToVector3 = (lat, lon, radius = 5.01) => {
  // Convert degrees to radians
  const phi = (90 - lat) * (Math.PI / 180);      // Colatitude (0 at north pole, PI at south pole)
  const theta = (lon + 180) * (Math.PI / 180);   // Longitude (0-2PI, adjusted for texture mapping)
  
  // Convert spherical coordinates to Cartesian (x, y, z)
  // This matches the standard Earth texture mapping
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

const getNewsColor = (newsCount) => {
  // Based on sentiment legend colors
  if (newsCount >= 50) return '#1a5f3d';   // 🟢 Very Positive (Dark Green)
  if (newsCount >= 30) return '#4ade80';   // 🟢 Positive (Light Green)
  if (newsCount >= 20) return '#9ca3af';   // ⚪ Neutral (Gray)
  if (newsCount >= 10) return '#f97316';   // 🟠 Negative (Orange)
  return '#dc2626';                         // 🔴 Very Negative (Red)
};

const CountryMarker = ({ country, onClick, isSelected }) => {
  const meshRef = useRef();
  const position = latLonToVector3(country.lat, country.lon, 5.2);
  
  // Use sentiment-based color instead of selection color
  const color = getNewsColor(country.newsCount);
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(country)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh scale={[2, 2, 2]}>
        <ringGeometry args={[0.08, 0.12, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {country.name}
        </Text>
      </Billboard>
    </group>
  );
};

const RealisticEarth = ({ selectedCountry, onCountryClick, countries }) => {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const [textures, setTextures] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadTextures = async () => {
      try {
        console.log('🌍 Starting to load textures...');
        const loadedTextures = await loadAllEarthTextures();
        
        if (isMounted) {
          if (loadedTextures) {
            console.log('✅ Textures loaded successfully!');
            setTextures(loadedTextures);
          } else {
            // If loading failed, use fallback
            console.warn('⚠️ Using fallback texture');
            const fallback = createFallbackTexture();
            setTextures({
              earthDay: fallback,
              earthNight: fallback,
              specular: fallback,
              bump: fallback,
              clouds: fallback,
            });
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error loading textures:', error);
        if (isMounted) {
          // Use fallback on error
          const fallback = createFallbackTexture();
          setTextures({
            earthDay: fallback,
            earthNight: fallback,
            specular: fallback,
            bump: fallback,
            clouds: fallback,
          });
          setLoading(false);
        }
      }
    };
    
    loadTextures();
    
    return () => { isMounted = false; };
  }, []);

  // NO AUTOMATIC ROTATION - Globe is completely static
  useFrame(() => {
    // Removed all automatic rotation
    // Globe only rotates when user drags it
  });

  if (loading || !textures) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[5, 64, 32]} />
          <meshPhongMaterial color="#1a5490" />
        </mesh>
        <Text position={[0, 0, 6]} fontSize={0.5} color="white">
          Loading Earth...
        </Text>
      </group>
    );
  }

  return (
    <group>
      {/* Main Earth - SUPER BRIGHT REALISTIC TEXTURES */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 256, 128]} />
        <meshStandardMaterial 
          map={textures.earthDay}
          bumpMap={textures.bump}
          bumpScale={0.05}
          roughnessMap={textures.specular}
          roughness={0.7}
          metalness={0.1}
          emissive={new THREE.Color(0x222244)}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={1.008}>
        <sphereGeometry args={[5, 128, 64]} />
        <meshStandardMaterial 
          map={textures.clouds}
          transparent
          opacity={0.6}
          depthWrite={false}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={1.015}>
        <sphereGeometry args={[5, 32, 16]} />
        <meshBasicMaterial 
          color={new THREE.Color(0.5, 0.8, 1.0)}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Country markers - now from Supabase data */}
      {countries.map((country) => (
        <CountryMarker
          key={country.id}
          country={country}
          onClick={onCountryClick}
          isSelected={selectedCountry?.id === country.id}
        />
      ))}
    </group>
  );
};

const Globe = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  // Load countries data from Supabase
  const { countries, loading: countriesLoading, error: countriesError, lastUpdated } = useCountriesData();
  
  // Load news data for selected country
  const { newsData, loading: newsLoading } = useCountryNews(selectedCountry?.id);

  const handleCountryClick = (country) => {
    setSelectedCountry(selectedCountry?.id === country.id ? null : country);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-black touch-manipulation">
      {/* Background stars */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Header - Responsive */}
      <div className="global-header absolute top-2 sm:top-4 left-2 sm:left-4 z-10 max-w-xs sm:max-w-md lg:max-w-lg">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
          🌍 Global News Sentiment Monitor
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm">
          Country colors reflect sentiment levels: 🟢 Positive • ⚪ Neutral • 🟠 Negative
        </p>
        
        {/* Data status indicator */}
        <div className="mt-1 sm:mt-2 text-xs">
          {countriesLoading ? (
            <span className="text-yellow-400">📡 Loading live data...</span>
          ) : countriesError ? (
            <span className="text-red-400">⚠️ Using offline data</span>
          ) : (
            <span className="text-green-400">
              ✅ Live data • {countries.length} countries
              {lastUpdated && (
                <span className="text-gray-400 ml-2">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Controls info - Responsive */}
      <div className="controls-info absolute bottom-4 left-4 z-10 text-white text-sm bg-black bg-opacity-50 p-2 sm:p-3 rounded max-w-xs">
        <div className="hidden sm:block">🖱️ Drag: Rotate</div>
        <div className="hidden sm:block">📱 Scroll: Zoom</div>
        <div className="hidden sm:block">🎯 Click markers: View Details</div>
        {/* Simplified mobile version */}
        <div className="sm:hidden text-xs space-y-1">
          <div>Drag: Rotate</div>
          <div>Scroll: Zoom</div>
          <div>Click: Details</div>
        </div>
      </div>

      {/* Legend - Responsive */}
      <div className="sentiment-legend absolute bottom-4 right-4 z-10 bg-black bg-opacity-80 text-white p-2 sm:p-4 rounded-lg max-w-xs sm:max-w-sm">
        <h3 className="text-xs sm:text-sm font-bold mb-1 sm:mb-2">Sentiment Legend</h3>
        <div className="space-y-0.5 sm:space-y-1 text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="color-indicator w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#1a5f3d' }}></div>
            <span className="text-xs truncate">Very Positive (≥50)</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="color-indicator w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#4ade80' }}></div>
            <span className="text-xs truncate">Positive (30-49)</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="color-indicator w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#9ca3af' }}></div>
            <span className="text-xs truncate">Neutral (20-29)</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="color-indicator w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#f97316' }}></div>
            <span className="text-xs truncate">Negative (10-19)</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="color-indicator w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-xs truncate">Very Negative (&lt;10)</span>
          </div>
        </div>
      </div>

      {/* News Panel - RIGHT SIDE - Responsive */}
      {selectedCountry && (
        <div className="news-panel absolute top-0 right-0 h-screen w-full sm:w-80 md:w-72 lg:w-80 xl:w-96 bg-black bg-opacity-95 text-white z-20 flex flex-col shadow-2xl overflow-hidden">
          {/* Panel Header - Responsive */}
          <div className="news-panel-header p-3 sm:p-6 border-b border-gray-700">
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <h2 className="text-lg sm:text-2xl font-bold text-blue-400 truncate pr-2">{selectedCountry.name}</h2>
              <button 
                onClick={() => {
                  setSelectedCountry(null);
                }}
                className="text-gray-400 hover:text-white text-xl sm:text-2xl leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              📍 {selectedCountry.lat.toFixed(2)}°, {selectedCountry.lon.toFixed(2)}°
            </p>
          </div>

          {/* Country Details - Responsive */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 space-y-2 sm:space-y-4">
            <h3 className="news-activity-title text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-300">News Activity Overview</h3>
            
            <div className="news-count-section bg-gray-800 bg-opacity-50 p-2 sm:p-5 rounded-lg">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <span className="text-gray-400 text-xs sm:text-base">News Count</span>
                <span className="news-count-large text-xl sm:text-3xl font-bold text-white">{selectedCountry.newsCount}</span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-3 mb-2 sm:mb-4">
                <div 
                  className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getNewsColor(selectedCountry.newsCount) }}
                />
                <span className="text-gray-300 font-medium text-xs sm:text-base leading-tight">
                  {selectedCountry.newsCount >= 50 ? 'Very Positive Sentiment' : 
                   selectedCountry.newsCount >= 30 ? 'Positive Sentiment' : 
                   selectedCountry.newsCount >= 20 ? 'Neutral Sentiment' : 
                   selectedCountry.newsCount >= 10 ? 'Negative Sentiment' : 'Very Negative Sentiment'}
                </span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${Math.min(selectedCountry.newsCount * 1.5, 100)}%`,
                    backgroundColor: getNewsColor(selectedCountry.newsCount)
                  }}
                />
              </div>
            </div>

            <div className="news-details-section bg-gray-800 bg-opacity-50 p-3 sm:p-5 rounded-lg">
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Sentiment: {selectedCountry.sentiment}</h4>
              <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 leading-tight">
                This country has {selectedCountry.newsCount} news articles currently being monitored.
                The color indicator reflects the volume of news activity.
              </p>
              
              {/* Real-time news data section */}
              <div className="mt-3 sm:mt-4">
                <h5 className="font-medium text-white mb-2 text-xs sm:text-sm">Latest News</h5>
                {newsLoading ? (
                  <div className="text-xs text-gray-400">📡 Loading news...</div>
                ) : (
                  <div className="text-xs text-gray-500 space-y-0.5 sm:space-y-1">
                    {Object.keys(newsData).length > 0 ? (
                      Object.keys(newsData).map(city => (
                        <p key={city}>📍 {city}: {newsData[city].length} articles</p>
                      ))
                    ) : (
                      <p>No recent news available</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 space-y-0.5 sm:space-y-1 mt-3">
                <p>• More articles = Higher activity level</p>
                <p>• Colors range from green (low) to red (very high)</p>
                <p>• Real-time monitoring of global news trends</p>
              </div>
            </div>

            <div className="geographic-section bg-gray-800 bg-opacity-50 p-3 sm:p-5 rounded-lg">
              <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">Geographic Data</h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Latitude:</span>
                  <span className="text-white font-mono text-xs sm:text-sm">{selectedCountry.lat.toFixed(4)}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Longitude:</span>
                  <span className="text-white font-mono text-xs sm:text-sm">{selectedCountry.lon.toFixed(4)}°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-2 sm:p-4 border-t border-gray-700 bg-gray-900">
            <p className="text-xs text-gray-400 text-center">
              🌍 Real-time global news monitoring
            </p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        className="w-full h-full"
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
      >
        {/* SUPER BRIGHT lighting for realistic Earth */}
        <ambientLight intensity={1.2} />
        <hemisphereLight 
          skyColor="#ffffff" 
          groundColor="#444444" 
          intensity={1.0} 
        />
        <directionalLight position={[10, 10, 5]} intensity={3.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1.2} color="#aabbff" />
        <pointLight position={[20, 0, 10]} intensity={1.0} color="#ffffff" />
        <pointLight position={[-20, 0, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, 20, 10]} intensity={0.6} color="#ffffff" />
        <spotLight position={[0, 0, 20]} intensity={1.5} angle={0.6} penumbra={0.5} />
        
        <RealisticEarth 
          selectedCountry={selectedCountry}
          onCountryClick={handleCountryClick}
          countries={countries}
        />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={30}
          autoRotate={false}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default Globe;