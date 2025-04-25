/**
 * Plugin Showcase - Interactive Example
 * 
 * This example demonstrates how to create various types of plugins with
 * different surface integrations and functionality.
 * 
 * Run this example with:
 * npx ts-node examples/interactive/plugin-showcase.ts
 */

import {
  createPlugin,
  createCardSurface,
  createPanelSurface,
  createModalSurface,
  PluginOptions,
  VERSION
} from '../../src';

console.log(`Creating plugin showcase using Vibing SDK v${VERSION}`);

// ------------------------------------------------------------------
// Step 1: Create a basic conversation plugin
// ------------------------------------------------------------------
console.log('Creating conversation plugin...');

const conversationPlugin = createPlugin({
  name: 'conversation-helper',
  description: 'A plugin that assists with conversation analysis',
  version: '1.0.0',
  permissions: ['conversation:read', 'conversation:write'],
  surfaces: ['card', 'panel']
});

// Set up event handlers
conversationPlugin.addEventListener('install', () => {
  console.log('Conversation plugin installed');
  
  // Create and show a card when the plugin is installed
  const welcomeCard = createCardSurface({
    title: 'Conversation Helper',
    description: 'This plugin helps analyze conversations',
    content: `
      <div class="welcome">
        <h3>Welcome to Conversation Helper!</h3>
        <p>This plugin will analyze your conversations and provide insights.</p>
        <p>Features include:</p>
        <ul>
          <li>Sentiment analysis</li>
          <li>Topic extraction</li>
          <li>Summary generation</li>
        </ul>
      </div>
    `,
    actions: [
      {
        type: 'button',
        text: 'Show Demo',
        style: 'primary',
        onClick: () => {
          // Show a simulated conversation analysis
          showConversationAnalysis();
        }
      }
    ]
  });
  
  // Register the welcome card
  conversationPlugin.registerSurface(welcomeCard);
});

// Function to show a simulated conversation analysis
function showConversationAnalysis() {
  const sampleConversation = [
    { role: 'user', content: 'I need help with my project.' },
    { role: 'assistant', content: 'I\'d be happy to help! What kind of project are you working on?' },
    { role: 'user', content: 'I\'m building a web application and struggling with the database design.' }
  ];
  
  const analysisPanelSurface = createPanelSurface({
    title: 'Conversation Analysis',
    position: 'right',
    width: 'wide',
    content: `
      <div class="analysis-panel">
        <h3>Analysis Results</h3>
        <div class="analysis-section">
          <h4>Sentiment</h4>
          <div class="meter">
            <div class="meter-fill" style="width: 65%"></div>
          </div>
          <p>Neutral to slightly positive</p>
        </div>
        
        <div class="analysis-section">
          <h4>Topics Detected</h4>
          <ul class="topics-list">
            <li>Web Development</li>
            <li>Database Design</li>
            <li>Project Help</li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>Conversation Summary</h4>
          <p>User is seeking assistance with database design for a web application project.</p>
        </div>
        
        <div class="analysis-section">
          <h4>Suggested Responses</h4>
          <div class="suggestion">
            <p>"Can you tell me more about the specific database challenges you're facing?"</p>
            <button class="use-suggestion">Use</button>
          </div>
          <div class="suggestion">
            <p>"What database technology are you planning to use for your web application?"</p>
            <button class="use-suggestion">Use</button>
          </div>
        </div>
      </div>
    `,
    actions: [
      {
        type: 'button',
        text: 'Refresh Analysis',
        onClick: () => {
          console.log('Refreshing analysis...');
          // Simulate loading
          analysisPanelSurface.update({
            content: '<div class="loading">Analyzing conversation...</div>'
          });
          
          // Show updated analysis after a delay
          setTimeout(() => {
            analysisPanelSurface.update({
              content: `
                <div class="analysis-panel">
                  <h3>Updated Analysis</h3>
                  <div class="analysis-section">
                    <h4>Sentiment</h4>
                    <div class="meter">
                      <div class="meter-fill" style="width: 70%"></div>
                    </div>
                    <p>Positive - User seems engaged</p>
                  </div>
                  
                  <div class="analysis-section">
                    <h4>Topics Detected</h4>
                    <ul class="topics-list">
                      <li>Web Development</li>
                      <li>Database Design</li>
                      <li>Project Help</li>
                      <li>Application Architecture</li>
                    </ul>
                  </div>
                  
                  <div class="analysis-section">
                    <h4>Conversation Summary</h4>
                    <p>User is seeking assistance with database design for a web application project.</p>
                  </div>
                  
                  <div class="analysis-section">
                    <h4>Suggested Responses</h4>
                    <div class="suggestion">
                      <p>"What specific database operations are you finding challenging?"</p>
                      <button class="use-suggestion">Use</button>
                    </div>
                    <div class="suggestion">
                      <p>"Are you using SQL or NoSQL for your database?"</p>
                      <button class="use-suggestion">Use</button>
                    </div>
                  </div>
                </div>
              `
            });
          }, 1500);
        }
      },
      {
        type: 'button',
        text: 'Close',
        style: 'secondary',
        onClick: () => {
          analysisPanelSurface.close();
        }
      }
    ]
  });
  
  // Register and show the analysis panel
  conversationPlugin.registerSurface(analysisPanelSurface);
  analysisPanelSurface.show();
}

// ------------------------------------------------------------------
// Step 2: Create a tool integration plugin
// ------------------------------------------------------------------
console.log('Creating tool integration plugin...');

const toolPlugin = createPlugin({
  name: 'code-assistant',
  description: 'A plugin that provides coding assistance',
  version: '1.0.0',
  permissions: ['function:call', 'content:read'],
  surfaces: ['modal', 'panel']
});

// Set up event handlers
toolPlugin.addEventListener('install', () => {
  console.log('Tool plugin installed');
});

// Define function calling capabilities
toolPlugin.defineFunctions([
  {
    name: 'generateCode',
    description: 'Generates code based on a description',
    parameters: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          description: 'Programming language to generate code for',
          enum: ['javascript', 'python', 'typescript', 'html', 'css']
        },
        description: {
          type: 'string',
          description: 'Description of what the code should do'
        }
      },
      required: ['language', 'description']
    },
    handler: async (params) => {
      console.log(`Generating ${params.language} code for: ${params.description}`);
      
      // Simulate code generation
      const codeExamples = {
        javascript: `
function processData(data) {
  // Transform the input data
  const result = data.map(item => {
    return {
      id: item.id,
      value: item.value * 2,
      processed: true
    };
  });
  
  return result;
}`,
        python: `
def process_data(data):
    # Transform the input data
    result = []
    for item in data:
        processed_item = {
            'id': item['id'],
            'value': item['value'] * 2,
            'processed': True
        }
        result.append(processed_item)
    
    return result`,
        typescript: `
interface DataItem {
  id: string;
  value: number;
  processed?: boolean;
}

function processData(data: DataItem[]): DataItem[] {
  // Transform the input data
  const result = data.map(item => {
    return {
      id: item.id,
      value: item.value * 2,
      processed: true
    };
  });
  
  return result;
}`,
        html: `
<div class="container">
  <h1>Data Processing Results</h1>
  <div class="results-panel">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="results-table">
        <!-- Results will be inserted here -->
      </tbody>
    </table>
  </div>
  <button id="process-btn">Process Data</button>
</div>`,
        css: `
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.results-panel {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

#process-btn {
  padding: 10px 15px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#process-btn:hover {
  background-color: #0052a3;
}`
      };
      
      // Show the generated code in a modal
      const codeModal = createModalSurface({
        title: `Generated ${params.language.toUpperCase()} Code`,
        size: 'large',
        content: `
          <div class="code-container">
            <h3>Based on: "${params.description}"</h3>
            <pre><code class="language-${params.language}">${codeExamples[params.language]}</code></pre>
          </div>
        `,
        actions: [
          {
            type: 'button',
            text: 'Copy Code',
            style: 'primary',
            onClick: () => {
              console.log('Code copied to clipboard');
              codeModal.update({
                content: `
                  <div class="code-container">
                    <h3>Based on: "${params.description}"</h3>
                    <div class="success-message">Code copied to clipboard!</div>
                    <pre><code class="language-${params.language}">${codeExamples[params.language]}</code></pre>
                  </div>
                `
              });
            }
          },
          {
            type: 'button',
            text: 'Close',
            style: 'secondary',
            onClick: () => {
              codeModal.close();
            }
          }
        ]
      });
      
      toolPlugin.registerSurface(codeModal);
      codeModal.show();
      
      return {
        success: true,
        language: params.language,
        code: codeExamples[params.language]
      };
    }
  }
]);

// ------------------------------------------------------------------
// Step 3: Create a content provider plugin
// ------------------------------------------------------------------
console.log('Creating content provider plugin...');

const contentPlugin = createPlugin({
  name: 'data-visualizer',
  description: 'A plugin that visualizes data from various sources',
  version: '1.0.0',
  permissions: ['data:read'],
  surfaces: ['card', 'panel']
});

// Set up event handlers
contentPlugin.addEventListener('install', () => {
  console.log('Content plugin installed');
  
  // Create a card showing data visualization options
  const dataCard = createCardSurface({
    title: 'Data Visualizer',
    description: 'Visualize your data in different formats',
    content: `
      <div class="data-card">
        <h3>Available Visualizations</h3>
        <ul class="visualization-options">
          <li>Bar Chart</li>
          <li>Line Graph</li>
          <li>Pie Chart</li>
          <li>Table View</li>
        </ul>
      </div>
    `,
    actions: [
      {
        type: 'button',
        text: 'Show Sample',
        style: 'primary',
        onClick: () => {
          showDataVisualization();
        }
      }
    ]
  });
  
  // Register the data card
  contentPlugin.registerSurface(dataCard);
});

// Function to show a sample data visualization
function showDataVisualization() {
  const dataPanelSurface = createPanelSurface({
    title: 'Data Visualization',
    position: 'bottom',
    height: 'tall',
    content: `
      <div class="visualization-panel">
        <h3>Monthly Sales Data</h3>
        <div class="chart-container">
          <div class="bar-chart">
            <div class="bar" style="height: 60%;">
              <span class="value">$12k</span>
              <span class="label">Jan</span>
            </div>
            <div class="bar" style="height: 80%;">
              <span class="value">$16k</span>
              <span class="label">Feb</span>
            </div>
            <div class="bar" style="height: 70%;">
              <span class="value">$14k</span>
              <span class="label">Mar</span>
            </div>
            <div class="bar" style="height: 90%;">
              <span class="value">$18k</span>
              <span class="label">Apr</span>
            </div>
            <div class="bar" style="height: 75%;">
              <span class="value">$15k</span>
              <span class="label">May</span>
            </div>
            <div class="bar" style="height: 85%;">
              <span class="value">$17k</span>
              <span class="label">Jun</span>
            </div>
          </div>
        </div>
        
        <div class="controls">
          <label for="chart-type">Chart Type:</label>
          <select id="chart-type">
            <option value="bar">Bar Chart</option>
            <option value="line">Line Graph</option>
            <option value="pie">Pie Chart</option>
            <option value="table">Table View</option>
          </select>
          
          <label for="data-range">Data Range:</label>
          <select id="data-range">
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m" selected>Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>
    `,
    actions: [
      {
        type: 'button',
        text: 'Export Data',
        onClick: () => {
          console.log('Exporting data...');
          // Show export options in a modal
          const exportModal = createModalSurface({
            title: 'Export Options',
            size: 'small',
            content: `
              <div class="export-options">
                <h3>Select Export Format</h3>
                <ul class="export-format-list">
                  <li>
                    <input type="radio" id="csv" name="format" value="csv" checked>
                    <label for="csv">CSV</label>
                  </li>
                  <li>
                    <input type="radio" id="json" name="format" value="json">
                    <label for="json">JSON</label>
                  </li>
                  <li>
                    <input type="radio" id="xlsx" name="format" value="xlsx">
                    <label for="xlsx">Excel (XLSX)</label>
                  </li>
                  <li>
                    <input type="radio" id="pdf" name="format" value="pdf">
                    <label for="pdf">PDF</label>
                  </li>
                </ul>
              </div>
            `,
            actions: [
              {
                type: 'button',
                text: 'Export',
                style: 'primary',
                onClick: () => {
                  console.log('Data exported');
                  exportModal.update({
                    content: `
                      <div class="export-success">
                        <h3>Export Successful!</h3>
                        <p>Your data has been exported successfully.</p>
                      </div>
                    `
                  });
                  
                  // Auto-close after delay
                  setTimeout(() => {
                    exportModal.close();
                  }, 2000);
                }
              },
              {
                type: 'button',
                text: 'Cancel',
                style: 'secondary',
                onClick: () => {
                  exportModal.close();
                }
              }
            ]
          });
          
          contentPlugin.registerSurface(exportModal);
          exportModal.show();
        }
      },
      {
        type: 'button',
        text: 'Close',
        style: 'secondary',
        onClick: () => {
          dataPanelSurface.close();
        }
      }
    ]
  });
  
  // Register and show the data panel
  contentPlugin.registerSurface(dataPanelSurface);
  dataPanelSurface.show();
}

// ------------------------------------------------------------------
// Step 4: Error handling demonstration
// ------------------------------------------------------------------
console.log('Setting up error handling demonstration...');

// Example of handling errors in plugins
conversationPlugin.addEventListener('error', (error) => {
  console.error('Conversation plugin error:', error);
  
  // Show error in a modal
  const errorModal = createModalSurface({
    title: 'Error Occurred',
    size: 'small',
    content: `
      <div class="error-container">
        <h3>Something went wrong</h3>
        <p>Error: ${error.message || 'Unknown error'}</p>
        <p>Please try again or contact support if the issue persists.</p>
      </div>
    `,
    actions: [
      {
        type: 'button',
        text: 'Close',
        onClick: () => {
          errorModal.close();
        }
      }
    ]
  });
  
  conversationPlugin.registerSurface(errorModal);
  errorModal.show();
});

// Function to simulate an error
function simulateError() {
  try {
    // Simulate an error condition
    throw new Error('Failed to analyze conversation data');
  } catch (error) {
    // Dispatch error event
    conversationPlugin.dispatchEvent('error', error);
  }
}

// ------------------------------------------------------------------
// Step 5: Install and start the plugins
// ------------------------------------------------------------------
console.log('Installing plugins...');

// Install the plugins
conversationPlugin.install();
toolPlugin.install();
contentPlugin.install();

// Simulate an error after a delay
setTimeout(() => {
  simulateError();
}, 5000);

// ------------------------------------------------------------------
// USAGE NOTES:
// ------------------------------------------------------------------
// 1. Each plugin demonstrates different functionality and surface types
// 2. Try exploring the conversation plugin's analysis features
// 3. The tool plugin shows how to implement function calling
// 4. The content plugin demonstrates data visualization capabilities
// 5. Error handling is demonstrated with the simulated error
// ------------------------------------------------------------------ 