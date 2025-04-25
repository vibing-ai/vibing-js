/**
 * Agent Demo - Interactive Example
 * 
 * This example demonstrates how to create a conversational agent with domain knowledge,
 * handling queries and responses, and integrating with UI components.
 * 
 * Run this example with:
 * npx ts-node examples/interactive/agent-demo.ts
 */

import {
  createAgent,
  createMemory,
  createCardSurface,
  createPanelSurface,
  AgentOptions,
  VERSION
} from '../../src';

console.log(`Creating agent demo using Vibing SDK v${VERSION}`);

// ------------------------------------------------------------------
// Step 1: Define agent configuration
// ------------------------------------------------------------------
const agentOptions: AgentOptions = {
  name: 'travel-expert',
  description: 'A travel advisor agent that helps with travel recommendations and planning',
  version: '1.0.0',
  // Domain knowledge areas
  domains: ['travel', 'geography', 'tourism'],
  // Agent capabilities
  capabilities: ['query', 'recommend', 'plan'],
  // Persistence settings
  persistence: {
    enabled: true,
    storage: 'session'
  }
};

// ------------------------------------------------------------------
// Step 2: Create memory system for the agent
// ------------------------------------------------------------------
const agentMemory = createMemory({
  namespace: 'travel-agent-memory',
  ttl: 60 * 60 * 24, // 24 hours
  maxItems: 100
});

// Pre-populate memory with some travel knowledge
agentMemory.set('destinations', [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    bestTime: 'Spring, Fall',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre Dame Cathedral'],
    tags: ['romantic', 'cultural', 'historic']
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    bestTime: 'Spring (Cherry Blossoms), Fall (Autumn Colors)',
    highlights: ['Tokyo Tower', 'Shibuya Crossing', 'Senso-ji Temple'],
    tags: ['modern', 'bustling', 'technological']
  },
  {
    id: 'nyc',
    name: 'New York City',
    country: 'United States',
    bestTime: 'Spring, Fall',
    highlights: ['Statue of Liberty', 'Central Park', 'Times Square'],
    tags: ['urban', 'cultural', 'shopping']
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    bestTime: 'Spring, Fall',
    highlights: ['Sydney Opera House', 'Sydney Harbour Bridge', 'Bondi Beach'],
    tags: ['beaches', 'outdoors', 'scenic']
  }
]);

// ------------------------------------------------------------------
// Step 3: Create the agent
// ------------------------------------------------------------------
console.log('Creating travel agent...');
const travelAgent = createAgent(agentOptions);

// Attach memory to agent
travelAgent.attachMemory(agentMemory);

// ------------------------------------------------------------------
// Step 4: Define agent conversation handling
// ------------------------------------------------------------------
// Conversation state to track interaction
const conversation = {
  messages: [],
  currentDestination: null,
  interests: [],
  tripDuration: null,
  travelSeason: null
};

// Add message to conversation
function addMessage(role, content) {
  conversation.messages.push({ role, content, timestamp: new Date() });
  updateConversationUI();
}

// Process user query
async function processQuery(query) {
  addMessage('user', query);
  
  // Simulate thinking
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple keyword-based handling (in a real agent, this would use AI)
  const lowerQuery = query.toLowerCase();
  
  // Check for destination mentions
  const destinations = await agentMemory.get('destinations');
  let detectedDestination = null;
  
  for (const dest of destinations) {
    if (lowerQuery.includes(dest.name.toLowerCase()) || 
        lowerQuery.includes(dest.country.toLowerCase())) {
      detectedDestination = dest;
      conversation.currentDestination = dest;
      break;
    }
  }
  
  // Detect interests
  const interestKeywords = {
    'food': 'culinary experiences',
    'restaurant': 'culinary experiences',
    'eat': 'culinary experiences',
    'museum': 'cultural attractions',
    'art': 'cultural attractions',
    'history': 'historical sites',
    'historic': 'historical sites',
    'beach': 'beaches and relaxation',
    'relax': 'beaches and relaxation',
    'hiking': 'outdoor activities',
    'nature': 'outdoor activities',
    'shopping': 'shopping experiences',
    'buy': 'shopping experiences',
    'nightlife': 'nightlife and entertainment',
    'club': 'nightlife and entertainment'
  };
  
  Object.entries(interestKeywords).forEach(([keyword, interest]) => {
    if (lowerQuery.includes(keyword) && !conversation.interests.includes(interest)) {
      conversation.interests.push(interest);
    }
  });
  
  // Detect trip duration
  const durationMatch = query.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
  if (durationMatch) {
    const amount = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    
    if (unit.startsWith('day')) {
      conversation.tripDuration = `${amount} days`;
    } else if (unit.startsWith('week')) {
      conversation.tripDuration = `${amount} weeks`;
    } else if (unit.startsWith('month')) {
      conversation.tripDuration = `${amount} months`;
    }
  }
  
  // Detect season
  const seasons = ['spring', 'summer', 'fall', 'autumn', 'winter'];
  for (const season of seasons) {
    if (lowerQuery.includes(season)) {
      conversation.travelSeason = season === 'autumn' ? 'fall' : season;
      break;
    }
  }
  
  // Generate response based on detected information
  let response = '';
  
  if (detectedDestination) {
    response = `I see you're interested in visiting ${detectedDestination.name}, ${detectedDestination.country}. It's a wonderful destination!`;
    
    if (detectedDestination.bestTime) {
      response += ` The best time to visit is during ${detectedDestination.bestTime}.`;
    }
    
    if (detectedDestination.highlights && detectedDestination.highlights.length > 0) {
      response += ` Some highlights include ${detectedDestination.highlights.join(', ')}.`;
    }
  } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('where')) {
    // Handle recommendation requests
    response = "Based on your interests, I'd recommend:";
    
    // Filter destinations based on interests if any are specified
    let recommendedDestinations = destinations;
    if (conversation.interests.length > 0) {
      // This is simplified matching - real implementation would be more sophisticated
      if (conversation.interests.includes('beaches and relaxation')) {
        recommendedDestinations = recommendedDestinations.filter(d => 
          d.tags.includes('beaches') || d.name === 'Sydney');
      }
      if (conversation.interests.includes('cultural attractions')) {
        recommendedDestinations = recommendedDestinations.filter(d => 
          d.tags.includes('cultural') || d.name === 'Paris');
      }
    }
    
    // Suggest top 2 destinations from filtered list
    for (let i = 0; i < Math.min(2, recommendedDestinations.length); i++) {
      const dest = recommendedDestinations[i];
      response += `\n- ${dest.name}, ${dest.country}: ${dest.highlights[0]} and more`;
    }
  } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    response = "Hello! I'm your travel advisor. Where are you thinking of traveling to?";
  } else if (lowerQuery.includes('thank')) {
    response = "You're welcome! Is there anything else you'd like to know about your travel plans?";
  } else if (conversation.interests.length > 0 || conversation.tripDuration || conversation.travelSeason) {
    // Respond to preferences
    response = "I've noted your preferences:";
    
    if (conversation.interests.length > 0) {
      response += `\n- Interests: ${conversation.interests.join(', ')}`;
    }
    
    if (conversation.tripDuration) {
      response += `\n- Trip duration: ${conversation.tripDuration}`;
    }
    
    if (conversation.travelSeason) {
      response += `\n- Travel season: ${conversation.travelSeason}`;
    }
    
    response += "\n\nWould you like me to recommend destinations based on these preferences?";
  } else {
    response = "I can help you plan your trip! Tell me where you'd like to go, or what kinds of places interest you.";
  }
  
  // Record agent response
  addMessage('agent', response);
  
  // Update agent state
  await travelAgent.updateState({
    currentDestination: conversation.currentDestination,
    interests: conversation.interests,
    tripDuration: conversation.tripDuration,
    travelSeason: conversation.travelSeason
  });
  
  return response;
}

// ------------------------------------------------------------------
// Step 5: Create UI surfaces
// ------------------------------------------------------------------
// Create a chat interface card
const chatCard = createCardSurface({
  title: 'Travel Advisor',
  description: 'Chat with your travel expert to plan your next trip',
  content: `
    <div class="chat-container">
      <div class="chat-messages" id="chat-messages">
        <div class="message agent-message">
          <div class="message-content">Hello! I'm your travel advisor. How can I help you plan your next vacation?</div>
        </div>
      </div>
    </div>
  `,
  actions: [
    {
      type: 'input',
      placeholder: 'Ask me about travel destinations...',
      onSubmit: async (value) => {
        if (value.trim()) {
          await processQuery(value);
        }
      }
    },
    {
      type: 'button',
      text: 'Suggest Destinations',
      style: 'primary',
      onClick: async () => {
        await processQuery("Can you recommend some destinations for me?");
      }
    },
    {
      type: 'button',
      text: 'View Trip Profile',
      onClick: () => {
        showTripProfile();
      }
    }
  ]
});

// Create a profile panel to show saved preferences
const profilePanel = createPanelSurface({
  title: 'Trip Profile',
  position: 'right',
  width: 'medium',
  content: getProfileContent(),
  actions: [
    {
      type: 'button',
      text: 'Reset Preferences',
      style: 'secondary',
      onClick: () => {
        // Reset conversation data
        conversation.currentDestination = null;
        conversation.interests = [];
        conversation.tripDuration = null;
        conversation.travelSeason = null;
        
        // Update UI
        profilePanel.update({
          content: getProfileContent()
        });
        
        // Update agent state
        travelAgent.updateState({
          currentDestination: null,
          interests: [],
          tripDuration: null,
          travelSeason: null
        });
      }
    },
    {
      type: 'button',
      text: 'Close',
      onClick: () => {
        profilePanel.close();
      }
    }
  ]
});

// Function to show trip profile panel
function showTripProfile() {
  profilePanel.update({
    content: getProfileContent()
  });
  
  travelAgent.registerSurface(profilePanel);
  profilePanel.show();
}

// Generate profile content
function getProfileContent() {
  return `
    <div class="profile-container">
      <h3>Your Trip Preferences</h3>
      
      <div class="profile-section">
        <h4>Destination</h4>
        <p>${conversation.currentDestination 
          ? `${conversation.currentDestination.name}, ${conversation.currentDestination.country}` 
          : 'Not specified yet'}</p>
      </div>
      
      <div class="profile-section">
        <h4>Interests</h4>
        ${conversation.interests.length > 0 
          ? `<ul>${conversation.interests.map(i => `<li>${i}</li>`).join('')}</ul>` 
          : '<p>No interests specified yet</p>'}
      </div>
      
      <div class="profile-section">
        <h4>Trip Duration</h4>
        <p>${conversation.tripDuration || 'Not specified yet'}</p>
      </div>
      
      <div class="profile-section">
        <h4>Travel Season</h4>
        <p>${conversation.travelSeason 
          ? conversation.travelSeason.charAt(0).toUpperCase() + conversation.travelSeason.slice(1) 
          : 'Not specified yet'}</p>
      </div>
      
      <div class="profile-section">
        <h4>Conversation History</h4>
        <p>${conversation.messages.length} messages exchanged</p>
      </div>
    </div>
  `;
}

// Update the chat UI with the latest messages
function updateConversationUI() {
  const messagesHtml = conversation.messages.map(msg => {
    const className = msg.role === 'user' ? 'user-message' : 'agent-message';
    return `
      <div class="message ${className}">
        <div class="message-content">${msg.content}</div>
        <div class="message-time">${formatTime(msg.timestamp)}</div>
      </div>
    `;
  }).join('');
  
  chatCard.update({
    content: `
      <div class="chat-container">
        <div class="chat-messages" id="chat-messages">
          <div class="message agent-message">
            <div class="message-content">Hello! I'm your travel advisor. How can I help you plan your next vacation?</div>
          </div>
          ${messagesHtml}
        </div>
      </div>
    `
  });
}

// Format timestamp for display
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ------------------------------------------------------------------
// Step 6: Set up agent event handling
// ------------------------------------------------------------------
// Handle agent events
travelAgent.addEventListener('query', async (query) => {
  console.log('Agent received query:', query);
  const response = await processQuery(query.text);
  return response;
});

travelAgent.addEventListener('stateChange', (newState) => {
  console.log('Agent state changed:', newState);
  
  // Update profile panel if it's visible
  if (profilePanel.isVisible()) {
    profilePanel.update({
      content: getProfileContent()
    });
  }
});

travelAgent.addEventListener('error', (error) => {
  console.error('Agent error:', error);
  addMessage('agent', `I'm sorry, I encountered an error: ${error.message}`);
});

// ------------------------------------------------------------------
// Step 7: Register surfaces and start the agent
// ------------------------------------------------------------------
console.log('Registering chat card');
travelAgent.registerSurface(chatCard);

console.log('Starting agent...');
travelAgent.start();

// Add initial agent message
addMessage('agent', 'Hello! I\'m your travel advisor. How can I help you plan your next vacation?');

// ------------------------------------------------------------------
// USAGE NOTES:
// ------------------------------------------------------------------
// 1. This example shows a conversational agent with domain knowledge
// 2. Try asking about specific destinations like "Paris" or "Tokyo"
// 3. Mention interests like "museums", "beaches", or "food"
// 4. Ask for recommendations: "Where should I go for a beach vacation?"
// 5. Specify trip details: "I want to travel for 2 weeks in summer"
// 6. Check the Trip Profile panel to see what the agent has learned
// ------------------------------------------------------------------ 