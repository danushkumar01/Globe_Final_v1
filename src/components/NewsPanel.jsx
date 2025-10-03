import React, { useState } from 'react';

// Note: Sample news data has been moved to DataService.js as fallback
// Real news data is now loaded via useCountryNews hook from Supabase

// Get severity color
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return 'text-red-400 bg-red-900';
    case 'medium': return 'text-yellow-400 bg-yellow-900';
    case 'low': return 'text-green-400 bg-green-900';
    default: return 'text-gray-400 bg-gray-900';
  }
};

// Get category icon
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Technology': return '💻';
    case 'Environment': return '🌱';
    case 'Entertainment': return '🎬';
    case 'Finance': return '💰';
    case 'Politics': return '🏛️';
    case 'Sports': return '⚽';
    default: return '📰';
  }
};

const NewsPanel = ({ selectedCountry, selectedCity, onCitySelect, onClose, newsData, newsLoading }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!selectedCountry) return null;

  // Use newsData from props (loaded via useCountryNews hook in parent component)
  const countryNews = newsData || {};
  const cityNews = selectedCity ? countryNews[selectedCity.name] || [] : [];

  const allCountryNews = Object.values(countryNews).flat();
  const totalNews = allCountryNews.length;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-gray-900 bg-opacity-96 backdrop-blur-sm text-white shadow-2xl border-l border-gray-600 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-blue-400">{selectedCountry.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="flex space-x-4 text-sm">
          <div className="bg-blue-600 px-2 py-1 rounded">
            {selectedCountry.cities.length} Cities
          </div>
          <div className="bg-green-600 px-2 py-1 rounded">
            {totalNews} News Items
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'overview' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'news' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          News Feed
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-green-400 mb-3">Cities & Activity</h3>
            
            {selectedCountry.cities.map((city) => {
              const cityNewsCount = countryNews[city.name]?.length || 0;
              const isSelected = selectedCity?.name === city.name;
              
              return (
                <div 
                  key={city.name} 
                  className={`p-3 rounded cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-700 border border-blue-500' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => onCitySelect(isSelected ? null : city)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-lg">{city.name}</div>
                      <div className="text-sm text-gray-400">
                        📍 {city.lat.toFixed(2)}, {city.lon.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <div 
                          className="w-4 h-4 rounded-full animate-pulse"
                          style={{ backgroundColor: city.newsCount > 15 ? '#ff4444' : city.newsCount > 10 ? '#ffaa00' : '#44ff44' }}
                        ></div>
                        <span className="font-bold text-lg">{city.newsCount}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {cityNewsCount} articles
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="mt-6 p-3 bg-gray-800 rounded">
              <h4 className="font-medium text-yellow-400 mb-3">Activity Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>High Activity (15+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Medium Activity (10-15)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Low Activity (0-10)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="p-4">
            {selectedCity ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-400">
                    {selectedCity.name} News
                  </h3>
                  <button
                    onClick={() => onCitySelect(null)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    ← Back to Overview
                  </button>
                </div>
                
                {cityNews.length > 0 ? (
                  <div className="space-y-3">
                    {cityNews.map((news) => (
                      <div key={news.id} className="bg-gray-800 rounded p-3 border-l-4 border-blue-500">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span>{getCategoryIcon(news.category)}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(news.severity)}`}>
                              {news.severity.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(news.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="font-medium mb-2">{news.title}</h4>
                        <p className="text-sm text-gray-400">{news.summary}</p>
                        <div className="mt-2 text-xs text-blue-400">
                          {news.category}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No news available for {selectedCity.name}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-4">All Country News</h3>
                {allCountryNews.length > 0 ? (
                  <div className="space-y-3">
                    {allCountryNews
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((news) => (
                        <div key={news.id} className="bg-gray-800 rounded p-3 border-l-4 border-green-500">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span>{getCategoryIcon(news.category)}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(news.severity)}`}>
                                {news.severity.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(news.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <h4 className="font-medium mb-2">{news.title}</h4>
                          <p className="text-sm text-gray-400">{news.summary}</p>
                          <div className="mt-2 text-xs text-blue-400">
                            {news.category}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No news available for this country
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPanel;