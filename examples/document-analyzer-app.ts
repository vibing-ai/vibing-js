import { createApp, useMemory, usePermissions, useSuperAgent } from '../src';
import { useModal } from '../src/surfaces/modals';
import { createContextPanel } from '../src/surfaces/panels';
import { createConversationCard } from '../src/surfaces/cards';
import { useCanvas } from '../src/surfaces/canvas';
import React, { useEffect, useState } from 'react';

/**
 * Document Analyzer App
 * 
 * This example demonstrates integration across multiple surfaces:
 * - Takes a document as input
 * - Analyzes content (mock implementation)
 * - Shows analysis results in a context panel
 * - Displays key insights in conversation cards
 * - Uses canvas for visualization
 * - Shows detailed settings in a modal
 */
const DocumentAnalyzerApp = createApp({
  name: 'DocumentAnalyzer',
  version: '1.0.0',
  permissions: [
    { type: 'memory', scope: 'documents', access: 'read-write' },
    { type: 'memory', scope: 'analysis', access: 'read-write' },
    { type: 'surface', scope: 'panel', access: 'read-write' },
    { type: 'surface', scope: 'card', access: 'read-write' },
    { type: 'surface', scope: 'canvas', access: 'read-write' },
    { type: 'surface', scope: 'modal', access: 'read-write' },
  ],
  
  onInitialize: async (ctx) => {
    console.log('Document Analyzer initialized');
    // Initialize any required resources or state
  },
  
  onTerminate: async (ctx) => {
    console.log('Document Analyzer terminated');
    // Clean up resources
  },
  
  // Main app component
  render: () => <DocumentAnalyzerComponent />,
});

// Mock document data
const mockDocuments = [
  { id: 'doc1', title: 'Financial Report', content: 'This is a financial report with quarterly data...' },
  { id: 'doc2', title: 'Product Roadmap', content: 'The product roadmap for next year includes...' },
  { id: 'doc3', title: 'Customer Survey', content: 'The customer satisfaction survey shows that...' },
];

// Mock analyzer function
const analyzeDocument = async (docId: string) => {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock analysis results based on document ID
  switch (docId) {
    case 'doc1':
      return {
        sentiment: 'positive',
        topics: ['finance', 'quarterly report', 'growth'],
        keyMetrics: {
          growth: '12%',
          revenue: '$1.2M',
          costs: '$750K'
        },
        insights: [
          'Revenue increased by 12% compared to previous quarter',
          'Cost reduction initiatives successful',
          'New market expansion performing above expectations'
        ]
      };
    case 'doc2':
      return {
        sentiment: 'neutral',
        topics: ['product', 'roadmap', 'features'],
        keyMetrics: {
          newFeatures: 8,
          improvements: 15,
          targetReleases: 4
        },
        insights: [
          'Focus on AI-powered features in Q2',
          'User experience improvements prioritized',
          'Mobile platform enhancements scheduled for Q3'
        ]
      };
    case 'doc3':
      return {
        sentiment: 'mixed',
        topics: ['customer satisfaction', 'feedback', 'improvement'],
        keyMetrics: {
          satisfaction: '76%',
          nps: 42,
          respondents: 524
        },
        insights: [
          'Customer satisfaction improved by 4% from last survey',
          'UI/UX concerns remain in the top 3 issues',
          'Support response time received positive feedback'
        ]
      };
    default:
      return {
        sentiment: 'unknown',
        topics: [],
        keyMetrics: {},
        insights: ['No analysis available for this document']
      };
  }
};

// Main component
const DocumentAnalyzerComponent = () => {
  // Initialize hooks for all surfaces and capabilities
  const memory = useMemory();
  const permissions = usePermissions();
  const superAgent = useSuperAgent();
  const modal = useModal();
  const canvas = useCanvas();
  
  // Local state
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermissions = await permissions.checkPermission({
        type: 'memory',
        scope: 'documents',
        access: 'read-write'
      });
      
      if (!hasPermissions) {
        const granted = await permissions.requestPermission({
          type: 'memory',
          scope: 'documents',
          access: 'read-write',
          reason: 'To store and retrieve your documents for analysis'
        });
        
        if (!granted) {
          console.error('Document analysis requires document permissions');
        }
      }
    };
    
    checkPermissions();
    loadDocuments();
  }, []);
  
  // Load documents from memory
  const loadDocuments = async () => {
    try {
      const storedDocs = await memory.get('documents');
      if (!storedDocs) {
        // Initialize with mock data if no documents exist
        await memory.set('documents', mockDocuments);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };
  
  // Analyze document and update all surfaces
  const handleAnalyzeDocument = async (docId: string) => {
    if (isAnalyzing) return;
    
    try {
      setIsAnalyzing(true);
      setCurrentDocId(docId);
      
      // Find document
      const docs = await memory.get('documents') || mockDocuments;
      const selectedDoc = docs.find(d => d.id === docId);
      
      if (!selectedDoc) {
        throw new Error('Document not found');
      }
      
      // Perform analysis
      const analysisResult = await analyzeDocument(docId);
      setAnalysis(analysisResult);
      
      // Store analysis result
      await memory.set(`analysis:${docId}`, analysisResult);
      
      // Update UI on all surfaces
      updateSurfaces(selectedDoc, analysisResult);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      // Show error in conversation card
      createConversationCard({
        content: (
          <div style={{ color: 'red' }}>
            <h3>Analysis Failed</h3>
            <p>{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          </div>
        )
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Update all surfaces with analysis results
  const updateSurfaces = (document: any, analysisResult: any) => {
    // 1. Show results in context panel
    createContextPanel({
      title: `Analysis: ${document.title}`,
      content: (
        <div>
          <h3>Document Analysis</h3>
          <p><strong>Sentiment:</strong> {analysisResult.sentiment}</p>
          <p><strong>Topics:</strong> {analysisResult.topics.join(', ')}</p>
          
          <h4>Key Metrics</h4>
          <div style={{ marginBottom: '20px' }}>
            {Object.entries(analysisResult.keyMetrics).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
          
          <button onClick={() => showDetailedSettings(document, analysisResult)}>
            Analysis Settings
          </button>
        </div>
      ),
      width: '320px'
    });
    
    // 2. Add conversation card with key insights
    createConversationCard({
      content: (
        <div>
          <h3>Key Insights from {document.title}</h3>
          <ul>
            {analysisResult.insights.map((insight: string, idx: number) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
          <button onClick={() => createVisualization(document, analysisResult)}>
            Visualize Data
          </button>
        </div>
      )
    });
    
    // 3. Create visualization on canvas
    createVisualization(document, analysisResult);
  };
  
  // Create visualization on canvas
  const createVisualization = (document: any, analysisResult: any) => {
    // Create a canvas block with visualization
    canvas.createBlock({
      type: 'visualization',
      title: `${document.title} - Analysis`,
      content: {
        // This would be actual visualization in a real implementation
        // Here we just create a mock visualization
        type: 'chart',
        data: analysisResult.keyMetrics,
        insights: analysisResult.insights
      }
    });
  };
  
  // Show settings modal
  const showDetailedSettings = (document: any, analysisResult: any) => {
    modal.showModal({
      title: 'Analysis Settings',
      content: (
        <div>
          <h3>{document.title} - Analysis Configuration</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Analysis Depth</h4>
            <select defaultValue="standard">
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Focus Areas</h4>
            <label>
              <input type="checkbox" defaultChecked /> Content Analysis
            </label><br />
            <label>
              <input type="checkbox" defaultChecked /> Sentiment Analysis
            </label><br />
            <label>
              <input type="checkbox" defaultChecked /> Topic Extraction
            </label><br />
            <label>
              <input type="checkbox" defaultChecked /> Key Metrics
            </label>
          </div>
          
          <div>
            <h4>Export Options</h4>
            <label>
              <input type="checkbox" /> Export as PDF
            </label><br />
            <label>
              <input type="checkbox" /> Export as JSON
            </label><br />
            <label>
              <input type="checkbox" /> Share with Team
            </label>
          </div>
        </div>
      ),
      actions: (
        <div>
          <button onClick={() => modal.hideModal()}>Cancel</button>
          <button onClick={() => {
            // Mock applying settings and re-analyzing
            setTimeout(() => {
              handleAnalyzeDocument(document.id);
              modal.hideModal();
            }, 500);
          }}>Apply</button>
        </div>
      ),
      size: 'medium'
    });
  };
  
  // Main render for the app
  return (
    <div>
      <h2>Document Analyzer</h2>
      
      {isAnalyzing ? (
        <div>Analyzing document...</div>
      ) : (
        <div>
          <h3>Available Documents</h3>
          <ul>
            {mockDocuments.map(doc => (
              <li key={doc.id}>
                {doc.title}
                <button onClick={() => handleAnalyzeDocument(doc.id)}>
                  Analyze
                </button>
              </li>
            ))}
          </ul>
          
          {currentDocId && analysis && (
            <div>
              <h3>Last Analysis Results</h3>
              <p>Document: {mockDocuments.find(d => d.id === currentDocId)?.title}</p>
              <p>Sentiment: {analysis.sentiment}</p>
              <button onClick={() => showDetailedSettings(
                mockDocuments.find(d => d.id === currentDocId),
                analysis
              )}>
                View Details
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentAnalyzerApp; 