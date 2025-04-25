import { createPlugin } from '../src/plugin/createPlugin';
import React, { useEffect, useState } from 'react';
import { createConversationCard } from '../src/surfaces/cards';
import { createContextPanel } from '../src/surfaces/panels';

/**
 * Plugin Chain Example
 * 
 * This example demonstrates communication between multiple plugins:
 * - DataSource plugin: Provides mock data
 * - Analyzer plugin: Processes data from DataSource
 * - Visualizer plugin: Presents results from Analyzer
 * 
 * The plugins communicate through events and shared memory
 */

// Shared event types for plugin communication
enum EventTypes {
  DATA_AVAILABLE = 'data:available',
  DATA_REQUESTED = 'data:requested',
  ANALYSIS_COMPLETE = 'analysis:complete',
  ANALYSIS_REQUESTED = 'analysis:requested',
  VISUALIZATION_COMPLETE = 'visualization:complete',
  VISUALIZATION_REQUESTED = 'visualization:requested',
  ERROR = 'error'
}

// ==============================================
// DataSource Plugin
// ==============================================
const DataSourcePlugin = createPlugin({
  id: 'vibing.example.data-source',
  name: 'Data Source',
  version: '1.0.0',
  description: 'Provides data for analysis',
  permissions: [
    { type: 'memory', scope: 'data', access: 'read-write' },
    { type: 'event', scope: 'publish', access: 'read-write' },
    { type: 'event', scope: 'subscribe', access: 'read-write' },
  ],
  
  onInitialize: async (ctx) => {
    console.log('DataSource plugin initialized');
    
    // Subscribe to data requests
    ctx.events.subscribe(EventTypes.DATA_REQUESTED, async (payload) => {
      try {
        console.log('Data requested:', payload);
        const data = await generateMockData(payload.dataType);
        
        // Store data in memory for other plugins to access
        await ctx.memory.set(`data:${payload.dataType}`, data);
        
        // Publish event that data is available
        ctx.events.publish(EventTypes.DATA_AVAILABLE, {
          dataType: payload.dataType,
          dataId: `data:${payload.dataType}`,
          timestamp: new Date().toISOString()
        });
        
        // Show notification in conversation
        createConversationCard({
          content: (
            <div>
              <h3>Data Generated</h3>
              <p>Generated {payload.dataType} data is now available</p>
              <pre style={{ maxHeight: '100px', overflow: 'auto' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )
        });
        
      } catch (error) {
        console.error('Error generating data:', error);
        ctx.events.publish(EventTypes.ERROR, {
          source: 'DataSource',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });
  },
  
  // No UI surfaces registered for this plugin
  surfaces: {}
});

// Mock data generation function
const generateMockData = async (dataType: string) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  switch (dataType) {
    case 'sales':
      return {
        type: 'sales',
        period: 'Q1 2023',
        items: [
          { id: 'product1', name: 'Widget A', sales: 240, growth: 0.12 },
          { id: 'product2', name: 'Widget B', sales: 180, growth: 0.05 },
          { id: 'product3', name: 'Widget C', sales: 320, growth: 0.28 },
          { id: 'product4', name: 'Widget D', sales: 90, growth: -0.15 }
        ]
      };
      
    case 'user-activity':
      return {
        type: 'user-activity',
        period: 'Last 30 days',
        metrics: {
          totalUsers: 12500,
          activeUsers: 8750,
          newUsers: 1250,
          churnRate: 0.035
        },
        activities: [
          { action: 'login', count: 52000 },
          { action: 'feature_use', count: 143000 },
          { action: 'share', count: 7800 },
          { action: 'export', count: 2300 }
        ]
      };
      
    case 'performance':
      return {
        type: 'performance',
        period: 'Current',
        metrics: {
          responseTime: 245, // ms
          errorRate: 0.012,
          uptime: 0.9985,
          throughput: 1240 // req/s
        },
        components: [
          { name: 'API Gateway', status: 'healthy', latency: 12 },
          { name: 'Auth Service', status: 'healthy', latency: 45 },
          { name: 'Database', status: 'degraded', latency: 110 },
          { name: 'Storage', status: 'healthy', latency: 78 }
        ]
      };
      
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
};

// ==============================================
// Analyzer Plugin
// ==============================================
const AnalyzerPlugin = createPlugin({
  id: 'vibing.example.analyzer',
  name: 'Data Analyzer',
  version: '1.0.0',
  description: 'Analyzes data from the DataSource plugin',
  permissions: [
    { type: 'memory', scope: 'data', access: 'read-write' },
    { type: 'memory', scope: 'analysis', access: 'read-write' },
    { type: 'event', scope: 'publish', access: 'read-write' },
    { type: 'event', scope: 'subscribe', access: 'read-write' },
    { type: 'surface', scope: 'card', access: 'read-write' },
  ],
  
  onInitialize: async (ctx) => {
    console.log('Analyzer plugin initialized');
    
    // Subscribe to data available events
    ctx.events.subscribe(EventTypes.DATA_AVAILABLE, async (payload) => {
      try {
        console.log('Data available for analysis:', payload);
        
        // Retrieve data from memory
        const data = await ctx.memory.get(payload.dataId);
        if (!data) {
          throw new Error(`Data not found for ID: ${payload.dataId}`);
        }
        
        // Show processing card
        createConversationCard({
          content: (
            <div>
              <h3>Analyzing Data</h3>
              <p>Processing {payload.dataType} data...</p>
            </div>
          )
        });
        
        // Process the data
        const analysis = await analyzeData(data);
        
        // Store analysis in memory
        const analysisId = `analysis:${payload.dataType}`;
        await ctx.memory.set(analysisId, analysis);
        
        // Publish analysis complete event
        ctx.events.publish(EventTypes.ANALYSIS_COMPLETE, {
          dataType: payload.dataType,
          analysisId,
          timestamp: new Date().toISOString()
        });
        
        // Show analysis results
        createConversationCard({
          content: (
            <div>
              <h3>Analysis Complete</h3>
              <p>Key findings from {payload.dataType} data:</p>
              <ul>
                {analysis.insights.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
              <button onClick={() => {
                ctx.events.publish(EventTypes.VISUALIZATION_REQUESTED, {
                  dataType: payload.dataType,
                  analysisId,
                  timestamp: new Date().toISOString()
                });
              }}>
                Visualize Results
              </button>
            </div>
          )
        });
        
      } catch (error) {
        console.error('Error analyzing data:', error);
        ctx.events.publish(EventTypes.ERROR, {
          source: 'Analyzer',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Subscribe to analysis requests directly
    ctx.events.subscribe(EventTypes.ANALYSIS_REQUESTED, async (payload) => {
      try {
        // Check if data exists
        const data = await ctx.memory.get(payload.dataId);
        if (!data) {
          // Request data if it doesn't exist
          ctx.events.publish(EventTypes.DATA_REQUESTED, {
            dataType: payload.dataType,
            requestor: 'Analyzer',
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        // If data exists, proceed with analysis (same as above)
        const analysis = await analyzeData(data);
        const analysisId = `analysis:${payload.dataType}`;
        await ctx.memory.set(analysisId, analysis);
        
        ctx.events.publish(EventTypes.ANALYSIS_COMPLETE, {
          dataType: payload.dataType,
          analysisId,
          timestamp: new Date().toISOString()
        });
        
        createConversationCard({
          content: (
            <div>
              <h3>Analysis Complete</h3>
              <p>Key findings from {payload.dataType} data:</p>
              <ul>
                {analysis.insights.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          )
        });
        
      } catch (error) {
        console.error('Error in analysis request:', error);
        ctx.events.publish(EventTypes.ERROR, {
          source: 'Analyzer',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });
  },
  
  surfaces: {
    // Register surfaces if needed
  }
});

// Mock data analysis function
const analyzeData = async (data: any) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Extract data type
  const dataType = data.type;
  
  // Generate analysis based on data type
  switch (dataType) {
    case 'sales':
      return {
        type: 'sales-analysis',
        summary: {
          totalSales: data.items.reduce((sum: number, item: any) => sum + item.sales, 0),
          averageGrowth: data.items.reduce((sum: number, item: any) => sum + item.growth, 0) / data.items.length,
          topPerformer: data.items.reduce((best: any, item: any) => item.sales > best.sales ? item : best, data.items[0]).name
        },
        insights: [
          `Total sales for ${data.period}: ${data.items.reduce((sum: number, item: any) => sum + item.sales, 0)} units`,
          `${data.items.reduce((best: any, item: any) => item.sales > best.sales ? item : best, data.items[0]).name} was the top performing product`,
          `Average growth rate was ${(data.items.reduce((sum: number, item: any) => sum + item.growth, 0) / data.items.length * 100).toFixed(1)}%`,
          `${data.items.filter((item: any) => item.growth < 0).length} products showed negative growth`
        ]
      };
      
    case 'user-activity':
      return {
        type: 'user-activity-analysis',
        summary: {
          engagementRate: data.metrics.activeUsers / data.metrics.totalUsers,
          actionsPerActiveUser: data.activities.reduce((sum: number, act: any) => sum + act.count, 0) / data.metrics.activeUsers,
          mostPopularAction: data.activities.reduce((most: any, act: any) => act.count > most.count ? act : most, data.activities[0]).action
        },
        insights: [
          `Active user rate: ${((data.metrics.activeUsers / data.metrics.totalUsers) * 100).toFixed(1)}%`,
          `New users make up ${((data.metrics.newUsers / data.metrics.totalUsers) * 100).toFixed(1)}% of total users`,
          `Average ${(data.activities.reduce((sum: number, act: any) => sum + act.count, 0) / data.metrics.activeUsers).toFixed(1)} actions per active user`,
          `Most popular activity: ${data.activities.reduce((most: any, act: any) => act.count > most.count ? act : most, data.activities[0]).action} (${data.activities.reduce((most: any, act: any) => act.count > most.count ? act : most, data.activities[0]).count} times)`
        ]
      };
      
    case 'performance':
      return {
        type: 'performance-analysis',
        summary: {
          systemHealth: data.components.every((c: any) => c.status === 'healthy') ? 'healthy' : 'degraded',
          averageLatency: data.components.reduce((sum: number, c: any) => sum + c.latency, 0) / data.components.length,
          bottleneck: data.components.reduce((slowest: any, c: any) => c.latency > slowest.latency ? c : slowest, data.components[0]).name
        },
        insights: [
          `System overall status: ${data.components.every((c: any) => c.status === 'healthy') ? 'Healthy' : 'Degraded'}`,
          `Response time (${data.metrics.responseTime}ms) is ${data.metrics.responseTime < 300 ? 'acceptable' : 'concerning'}`,
          `${data.components.reduce((slowest: any, c: any) => c.latency > slowest.latency ? c : slowest, data.components[0]).name} is the current bottleneck`,
          `Error rate is ${(data.metrics.errorRate * 100).toFixed(2)}%, ${data.metrics.errorRate < 0.02 ? 'within' : 'outside'} acceptable range`
        ]
      };
      
    default:
      throw new Error(`Unknown data type for analysis: ${dataType}`);
  }
};

// ==============================================
// Visualizer Plugin 
// ==============================================
const VisualizerPlugin = createPlugin({
  id: 'vibing.example.visualizer',
  name: 'Data Visualizer',
  version: '1.0.0',
  description: 'Visualizes analysis results',
  permissions: [
    { type: 'memory', scope: 'data', access: 'read' },
    { type: 'memory', scope: 'analysis', access: 'read' },
    { type: 'event', scope: 'publish', access: 'read-write' },
    { type: 'event', scope: 'subscribe', access: 'read-write' },
    { type: 'surface', scope: 'panel', access: 'read-write' },
    { type: 'surface', scope: 'card', access: 'read-write' },
  ],
  
  onInitialize: async (ctx) => {
    console.log('Visualizer plugin initialized');
    
    // Subscribe to visualization requests
    ctx.events.subscribe(EventTypes.VISUALIZATION_REQUESTED, async (payload) => {
      try {
        console.log('Visualization requested:', payload);
        
        // Retrieve analysis from memory
        const analysis = await ctx.memory.get(payload.analysisId);
        if (!analysis) {
          throw new Error(`Analysis not found for ID: ${payload.analysisId}`);
        }
        
        // Retrieve original data for context
        const dataId = `data:${payload.dataType}`;
        const originalData = await ctx.memory.get(dataId);
        
        // Show processing notification
        createConversationCard({
          content: (
            <div>
              <h3>Generating Visualization</h3>
              <p>Creating visualization for {payload.dataType} analysis...</p>
            </div>
          )
        });
        
        // Generate visualization content
        const visualizationContent = await generateVisualization(analysis, originalData);
        
        // Show visualization in a context panel
        createContextPanel({
          title: `${visualizationContent.title}`,
          content: (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3>{visualizationContent.title}</h3>
                <p>{visualizationContent.description}</p>
              </div>
              
              {/* Mock visualization component */}
              <div style={{ 
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
                  {visualizationContent.chartType} Chart
                </div>
                <div>
                  {/* This would be an actual chart component in a real implementation */}
                  <div style={{ 
                    height: '180px',
                    background: 'linear-gradient(to right, #e0f7fa, #80deea, #26c6da, #00acc1)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    [Visualization for {payload.dataType} data]
                  </div>
                </div>
              </div>
              
              <div>
                <h4>Key Metrics</h4>
                <ul>
                  {visualizationContent.keyMetrics.map((metric, idx) => (
                    <li key={idx}>{metric}</li>
                  ))}
                </ul>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <button onClick={() => {
                  // Request different data type
                  ctx.events.publish(EventTypes.DATA_REQUESTED, {
                    dataType: getRelatedDataType(payload.dataType),
                    requestor: 'Visualizer',
                    timestamp: new Date().toISOString()
                  });
                }}>
                  Get Related Data
                </button>
              </div>
            </div>
          ),
          width: '380px'
        });
        
        // Publish visualization complete event
        ctx.events.publish(EventTypes.VISUALIZATION_COMPLETE, {
          dataType: payload.dataType,
          analysisId: payload.analysisId,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error visualizing data:', error);
        ctx.events.publish(EventTypes.ERROR, {
          source: 'Visualizer',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Subscribe to analysis complete events to optionally auto-visualize
    ctx.events.subscribe(EventTypes.ANALYSIS_COMPLETE, async (payload) => {
      console.log('Analysis complete, could auto-visualize:', payload);
      // For this example, we don't auto-visualize to show explicit flow
    });
  },
  
  surfaces: {
    // Register surfaces if needed
  }
});

// Helper to get a related data type for the "Get Related Data" button
const getRelatedDataType = (currentType: string): string => {
  const dataTypes = ['sales', 'user-activity', 'performance'];
  const currentIndex = dataTypes.indexOf(currentType);
  return dataTypes[(currentIndex + 1) % dataTypes.length];
};

// Mock visualization generator
const generateVisualization = async (analysis: any, originalData: any) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate visualization content based on analysis type
  switch (analysis.type) {
    case 'sales-analysis':
      return {
        title: 'Sales Performance Visualization',
        description: `Sales analysis for ${originalData.period} showing product performance`,
        chartType: 'Bar',
        keyMetrics: [
          `Total Sales: ${analysis.summary.totalSales} units`,
          `Average Growth: ${(analysis.summary.averageGrowth * 100).toFixed(1)}%`,
          `Top Performer: ${analysis.summary.topPerformer}`
        ]
      };
      
    case 'user-activity-analysis':
      return {
        title: 'User Engagement Visualization',
        description: `User activity analysis for ${originalData.period}`,
        chartType: 'Pie',
        keyMetrics: [
          `Engagement Rate: ${(analysis.summary.engagementRate * 100).toFixed(1)}%`,
          `Actions per User: ${analysis.summary.actionsPerActiveUser.toFixed(1)}`,
          `Most Popular: ${analysis.summary.mostPopularAction}`
        ]
      };
      
    case 'performance-analysis':
      return {
        title: 'System Performance Visualization',
        description: `Current system performance metrics and health`,
        chartType: 'Line',
        keyMetrics: [
          `System Health: ${analysis.summary.systemHealth}`,
          `Average Latency: ${analysis.summary.averageLatency.toFixed(1)}ms`,
          `Bottleneck: ${analysis.summary.bottleneck}`
        ]
      };
      
    default:
      throw new Error(`Unknown analysis type for visualization: ${analysis.type}`);
  }
};

// ==============================================
// Plugin Chain Controller - coordinates the plugins
// ==============================================
const PluginChainController = createPlugin({
  id: 'vibing.example.plugin-chain-controller',
  name: 'Plugin Chain Controller',
  version: '1.0.0',
  description: 'Controls and demonstrates the plugin chain',
  permissions: [
    { type: 'event', scope: 'publish', access: 'read-write' },
    { type: 'event', scope: 'subscribe', access: 'read-write' },
    { type: 'surface', scope: 'card', access: 'read-write' },
  ],
  
  onInitialize: async (ctx) => {
    console.log('Plugin Chain Controller initialized');
    
    // Subscribe to error events from all plugins
    ctx.events.subscribe(EventTypes.ERROR, (payload) => {
      console.error('Error in plugin chain:', payload);
      createConversationCard({
        content: (
          <div style={{ color: 'red' }}>
            <h3>Error Occurred</h3>
            <p><strong>Source:</strong> {payload.source}</p>
            <p><strong>Error:</strong> {payload.error}</p>
            <p><strong>Time:</strong> {new Date(payload.timestamp).toLocaleTimeString()}</p>
          </div>
        )
      });
    });
    
    // Display welcome card and instructions
    createConversationCard({
      content: (
        <div>
          <h3>Plugin Chain Example</h3>
          <p>This example demonstrates communication between multiple plugins:</p>
          <ol>
            <li><strong>Data Source Plugin:</strong> Provides mock data</li>
            <li><strong>Analyzer Plugin:</strong> Processes data from Data Source</li>
            <li><strong>Visualizer Plugin:</strong> Presents results from Analyzer</li>
          </ol>
          <p>Select a data type to begin the chain:</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {['sales', 'user-activity', 'performance'].map(dataType => (
              <button 
                key={dataType}
                onClick={() => {
                  ctx.events.publish(EventTypes.DATA_REQUESTED, {
                    dataType,
                    requestor: 'Controller',
                    timestamp: new Date().toISOString()
                  });
                }}
              >
                {dataType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Data
              </button>
            ))}
          </div>
        </div>
      )
    });
    
    // Subscribe to completion events to show the flow
    ctx.events.subscribe(EventTypes.DATA_AVAILABLE, (payload) => {
      console.log(`Controller: Data for ${payload.dataType} is now available`);
    });
    
    ctx.events.subscribe(EventTypes.ANALYSIS_COMPLETE, (payload) => {
      console.log(`Controller: Analysis for ${payload.dataType} is complete`);
    });
    
    ctx.events.subscribe(EventTypes.VISUALIZATION_COMPLETE, (payload) => {
      console.log(`Controller: Visualization for ${payload.dataType} is complete`);
      
      // Show completion card
      createConversationCard({
        content: (
          <div style={{ padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
            <h4>Plugin Chain Complete! ✅</h4>
            <p>Successfully processed {payload.dataType} data through the entire plugin chain.</p>
            <p>Flow: Data Source → Analyzer → Visualizer</p>
          </div>
        )
      });
    });
  },
  
  surfaces: {
    // Register surfaces if needed
  }
});

// Export all plugins for use in the application
export {
  DataSourcePlugin,
  AnalyzerPlugin,
  VisualizerPlugin,
  PluginChainController,
  EventTypes
};

export default PluginChainController; 