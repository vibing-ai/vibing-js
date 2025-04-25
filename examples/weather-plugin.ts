import React from 'react';
import { createPlugin } from '../src/plugin';

// Mock API for weather data
const weatherApi = {
  /**
   * Get weather data for a location
   * @param location Location to get weather for
   * @returns Weather data
   */
  getWeather: async (location: string): Promise<any> => {
    // In a real implementation, this would call an actual weather API
    // Mock response for demonstration
    return {
      location,
      temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
      conditions: ['Sunny', 'Rainy', 'Cloudy', 'Partly Cloudy', 'Stormy'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 30),
      forecast: Array.from({ length: 5 }, () => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(Math.random() * 7)],
        temperature: Math.floor(Math.random() * 30) + 5,
        conditions: ['Sunny', 'Rainy', 'Cloudy', 'Partly Cloudy', 'Stormy'][Math.floor(Math.random() * 5)]
      }))
    };
  }
};

// Weather Card Component
const WeatherCard = ({ data }: { data: any }) => (
  <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h3>{data.location}</h3>
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.temperature}°C</div>
    </div>
    <div>{data.conditions}</div>
    <div>Humidity: {data.humidity}%</div>
    <div>Wind: {data.windSpeed} km/h</div>
  </div>
);

// Weather Panel Component
const WeatherPanel = ({ data }: { data: any }) => (
  <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h2>{data.location} Weather</h2>
      <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data.temperature}°C</div>
    </div>
    <div style={{ fontSize: '18px' }}>{data.conditions}</div>
    <div>Humidity: {data.humidity}%</div>
    <div>Wind: {data.windSpeed} km/h</div>
    
    <h3 style={{ marginTop: '24px' }}>5-Day Forecast</h3>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {data.forecast.map((day: any, index: number) => (
        <div key={index} style={{ textAlign: 'center' }}>
          <div>{day.day}</div>
          <div>{day.temperature}°C</div>
          <div>{day.conditions}</div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Weather Plugin Example
 * 
 * This plugin provides weather information and demonstrates:
 * 1. Creating a function that can be called by the Super Agent
 * 2. Rendering weather information in conversation cards
 * 3. Displaying detailed weather in a context panel
 * 4. Using memory to store recent locations
 * 5. Proper permission handling
 */
const weatherPlugin = createPlugin({
  id: 'com.vibing.weather',
  name: 'Weather Plugin',
  version: '1.0.0',
  description: 'Get weather information for any location',
  
  // Request necessary permissions
  permissions: [
    { resource: 'memory', actions: ['read', 'write'] },
    { resource: 'network', actions: ['fetch'] }
  ],
  
  // Configure surfaces
  surfaces: {
    // Card configuration for showing weather in conversation
    cards: {
      defaultContent: 'Weather information will appear here',
      handlers: {
        onClick: (event) => {
          console.log('Weather card clicked');
        }
      }
    },
    
    // Panel configuration for detailed weather view
    panels: {
      defaultTitle: 'Weather Forecast',
      defaultContent: 'Select a location to view weather',
      defaultWidth: 400,
      handlers: {
        onClose: () => {
          console.log('Weather panel closed');
        }
      }
    }
  },
  
  // Register functions that the Super Agent can call
  functions: [
    {
      name: 'getWeather',
      description: 'Get weather information for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city or location to get weather for'
          }
        },
        required: ['location']
      },
      handler: async (params) => {
        try {
          // Get weather data
          const weatherData = await weatherApi.getWeather(params.location);
          
          // Return both the data and UI components
          return {
            data: weatherData,
            card: <WeatherCard data={weatherData} />,
            panel: <WeatherPanel data={weatherData} />
          };
        } catch (error) {
          console.error('Error fetching weather:', error);
          return {
            error: 'Failed to get weather information'
          };
        }
      }
    }
  ],
  
  // Initialize the plugin
  onInitialize: async (context) => {
    console.log('Weather plugin initialized');
    
    // Store default locations in memory
    try {
      await context.memory.set('recentLocations', [
        'New York',
        'London',
        'Tokyo',
        'Sydney',
        'Paris'
      ]);
      
      // Register event handlers
      context.events.on('user:location_changed', async (data: any) => {
        // When user location changes, automatically fetch weather
        try {
          const weatherData = await weatherApi.getWeather(data.location);
          
          // Update the card with new weather
          context.surfaces.cards.update({
            content: <WeatherCard data={weatherData} />
          });
          
          // Add to recent locations
          const recentLocations = await context.memory.get('recentLocations') || [];
          if (!recentLocations.includes(data.location)) {
            await context.memory.set('recentLocations', 
              [data.location, ...recentLocations].slice(0, 5)
            );
          }
        } catch (error) {
          console.error('Error handling location change:', error);
        }
      });
    } catch (error) {
      console.error('Error initializing weather plugin:', error);
    }
  }
});

export default weatherPlugin; 