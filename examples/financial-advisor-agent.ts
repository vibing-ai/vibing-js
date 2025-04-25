import React from 'react';
import { createAgent } from '../src/agent';

// Simple financial knowledge base for demonstration
const financialKnowledge = {
  // Investment advice
  investment: {
    stocks: 'Stocks represent ownership in a company. They offer higher potential returns but come with higher risk.',
    bonds: 'Bonds are debt securities where you lend money to an entity. They typically offer lower returns but with lower risk than stocks.',
    mutualFunds: 'Mutual funds pool money from investors to purchase a diversified portfolio of stocks, bonds, or other securities.',
    etfs: 'Exchange-traded funds (ETFs) are similar to mutual funds but trade on exchanges like stocks.',
    realestate: 'Real estate investments involve purchasing property for rental income or potential appreciation.',
    retirement: {
      ira: 'Individual Retirement Accounts (IRAs) offer tax advantages for retirement savings.',
      roth: 'Roth IRAs are funded with post-tax dollars, providing tax-free growth and withdrawals in retirement.',
      _401k: '401(k) plans are employer-sponsored retirement accounts with potential matching contributions.'
    }
  },
  // Tax advice
  tax: {
    deductions: 'Tax deductions reduce your taxable income before calculating your tax liability.',
    credits: 'Tax credits directly reduce your tax bill dollar-for-dollar.',
    strategies: 'Tax-efficient investing involves placing investments in accounts that minimize overall taxes.',
    brackets: 'Tax brackets determine the rate at which your income is taxed, with higher incomes subject to higher rates.',
    planning: 'Tax planning involves organizing finances to minimize tax liability within legal bounds.'
  },
  // Budget planning
  budget: {
    fiftyThirtyTwenty: 'The 50/30/20 rule suggests allocating 50% of income to needs, 30% to wants, and 20% to savings/debt.',
    emergencyFund: 'An emergency fund should cover 3-6 months of essential expenses for financial security.',
    debtManagement: 'Prioritize high-interest debt while maintaining minimum payments on other obligations.',
    savings: 'Aim to save 15-20% of your pre-tax income for retirement and other long-term goals.'
  }
};

// Financial Recommendation Component for Conversation Cards
const FinancialRecommendationCard = ({ title, recommendation }: { title: string; recommendation: string }) => (
  <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
    <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>{title}</h3>
    <p style={{ margin: '0', fontSize: '14px' }}>{recommendation}</p>
  </div>
);

// Detailed Financial Plan Component for Context Panel
const FinancialPlanPanel = ({ 
  query, 
  recommendation, 
  details, 
  nextSteps 
}: { 
  query: string; 
  recommendation: string; 
  details: string[]; 
  nextSteps: string[] 
}) => (
  <div style={{ padding: '16px' }}>
    <h2 style={{ marginTop: 0, color: '#1565c0' }}>Financial Plan</h2>
    
    <div style={{ marginBottom: '16px' }}>
      <h3>Your Question</h3>
      <p style={{ fontStyle: 'italic' }}>{query}</p>
    </div>
    
    <div style={{ marginBottom: '16px' }}>
      <h3>Recommendation</h3>
      <p>{recommendation}</p>
    </div>
    
    <div style={{ marginBottom: '16px' }}>
      <h3>Details</h3>
      <ul>
        {details.map((detail, index) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>
    </div>
    
    <div>
      <h3>Next Steps</h3>
      <ol>
        {nextSteps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </div>
  </div>
);

/**
 * Simple natural language understanding to determine query intent
 * @param query User's query string
 * @returns Categorized intent and relevant topics
 */
function determineQueryIntent(query: string): { intent: string; topics: string[] } {
  // Convert to lowercase for consistent matching
  const lowerQuery = query.toLowerCase();
  
  // Extract topics mentioned in the query
  const topics: string[] = [];
  
  // Check for investment-related terms
  const investmentTerms = ['invest', 'stock', 'bond', 'etf', 'mutual fund', 'portfolio', 'market', 'retirement', 'ira', '401k', 'roth'];
  const taxTerms = ['tax', 'deduction', 'credit', 'write-off', 'filing', 'return', 'irs', 'bracket'];
  const budgetTerms = ['budget', 'save', 'saving', 'spend', 'expense', 'debt', 'loan', 'emergency fund', 'income'];
  
  // Determine primary intent
  let intent = 'general';
  
  // Count matches for each category
  let investmentCount = 0;
  let taxCount = 0;
  let budgetCount = 0;
  
  // Check for investment terms
  for (const term of investmentTerms) {
    if (lowerQuery.includes(term)) {
      topics.push(term);
      investmentCount++;
    }
  }
  
  // Check for tax terms
  for (const term of taxTerms) {
    if (lowerQuery.includes(term)) {
      topics.push(term);
      taxCount++;
    }
  }
  
  // Check for budget terms
  for (const term of budgetTerms) {
    if (lowerQuery.includes(term)) {
      topics.push(term);
      budgetCount++;
    }
  }
  
  // Determine primary intent based on highest count
  if (investmentCount > taxCount && investmentCount > budgetCount) {
    intent = 'investment';
  } else if (taxCount > investmentCount && taxCount > budgetCount) {
    intent = 'tax';
  } else if (budgetCount > investmentCount && budgetCount > taxCount) {
    intent = 'budget';
  }
  
  return { intent, topics };
}

/**
 * Generate a response based on the query intent and financial knowledge
 * @param query User's query
 * @param intent Determined intent
 * @param topics Relevant topics
 * @returns Structured response for the agent
 */
function generateFinancialResponse(query: string, intent: string, topics: string[]): {
  text: string;
  recommendation: string;
  details: string[];
  nextSteps: string[];
  followupQuestions: string[];
} {
  // Default responses
  let text = `I'd be happy to help with your financial question about "${query}". `;
  let recommendation = '';
  let details: string[] = [];
  let nextSteps: string[] = [];
  let followupQuestions: string[] = [];
  
  // Generate response based on intent
  switch (intent) {
    case 'investment':
      text += 'Here are some investment insights that might help.';
      recommendation = topics.includes('retirement') 
        ? 'Consider diversifying your retirement portfolio across different asset classes for long-term growth.'
        : 'Based on typical financial goals, a diversified investment approach with a mix of stocks, bonds, and other assets may be appropriate.';
      
      details = [
        'Investment decisions should align with your time horizon and risk tolerance.',
        'Regular contributions to investment accounts can benefit from dollar-cost averaging.',
        'Consider both tax-advantaged and taxable accounts in your investment strategy.'
      ];
      
      nextSteps = [
        'Assess your current investment allocation and risk tolerance.',
        'Consider consulting with a tax professional about tax-efficient investing.',
        'Set up automatic contributions to your investment accounts.'
      ];
      
      followupQuestions = [
        'What is your current asset allocation?',
        'How long until you need to access these investments?',
        'Would you like to learn about tax-efficient investing strategies?'
      ];
      break;
      
    case 'tax':
      text += 'Here are some tax considerations that may be relevant to your situation.';
      recommendation = 'Optimize your tax strategy by taking advantage of available deductions and credits while planning for future tax implications.';
      
      details = [
        'Tax-advantaged accounts like 401(k)s and IRAs can reduce your current or future tax burden.',
        'Tax-loss harvesting can offset capital gains with losses in taxable investment accounts.',
        'Charitable giving can provide tax benefits while supporting causes you care about.'
      ];
      
      nextSteps = [
        'Review potential tax deductions and credits you may qualify for this year.',
        'Consider timing income and expenses for tax efficiency.',
        'Consult with a tax professional for personalized advice.'
      ];
      
      followupQuestions = [
        'Have you maximized your contributions to tax-advantaged accounts?',
        'Are there any major life changes this year that could affect your taxes?',
        'Would you like information about specific tax deductions or credits?'
      ];
      break;
      
    case 'budget':
      text += 'Here are some budgeting insights that might help with your financial planning.';
      recommendation = 'Create a structured budget that balances your current needs with your long-term financial goals.';
      
      details = [
        'The 50/30/20 rule suggests allocating 50% to needs, 30% to wants, and 20% to savings/debt.',
        'An emergency fund should cover 3-6 months of essential expenses.',
        'Automating savings and bill payments can help maintain your budget consistently.'
      ];
      
      nextSteps = [
        'Track your spending for a month to understand your current habits.',
        'Identify areas where you can reduce expenses.',
        'Set up automatic transfers to savings accounts on payday.'
      ];
      
      followupQuestions = [
        'What are your primary financial goals right now?',
        'Do you have an emergency fund established?',
        'Would you like help identifying areas to reduce expenses?'
      ];
      break;
      
    default:
      text += 'I can provide general financial guidance based on best practices.';
      recommendation = 'Focus on building a strong financial foundation with appropriate emergency savings, debt management, and retirement planning.';
      
      details = [
        'Financial security starts with building an emergency fund of 3-6 months of expenses.',
        'Paying off high-interest debt should typically be prioritized.',
        'Saving 15-20% of income for retirement is a common recommendation.'
      ];
      
      nextSteps = [
        'Assess your current financial situation including assets, debts, and cash flow.',
        'Define your short-term and long-term financial goals.',
        'Create a plan that addresses emergency savings, debt repayment, and retirement.'
      ];
      
      followupQuestions = [
        'What are your most pressing financial concerns right now?',
        'Do you have specific financial goals you'd like to work toward?',
        'Would you like advice on a particular aspect of your finances?'
      ];
  }
  
  return {
    text,
    recommendation,
    details,
    nextSteps,
    followupQuestions
  };
}

/**
 * Financial Advisor Agent Example
 * 
 * This agent specializes in providing financial advice and demonstrates:
 * 1. Domain-specific knowledge and capabilities
 * 2. Processing financial queries with appropriate responses
 * 3. Providing investment, tax, and budget guidance
 * 4. Using appropriate UI representations
 * 5. Proper permission handling
 */
const financialAdvisorAgent = createAgent({
  id: 'com.vibing.financial-advisor',
  name: 'Financial Advisor',
  version: '1.0.0',
  description: 'I provide financial advice including investment recommendations, tax guidance, and budgeting assistance.',
  
  // Domain specialization
  domain: 'finance',
  
  // Specific capabilities
  capabilities: [
    'investment-advice', 
    'tax-guidance', 
    'budget-planning', 
    'retirement-planning'
  ],
  
  // Required permissions
  permissions: [
    { resource: 'memory', actions: ['read', 'write'] }, 
    { resource: 'user-data', actions: ['read'] }
  ],
  
  // Surface configurations
  surfaces: {
    // Card configuration for showing recommendations
    cards: {
      defaultContent: 'I can help you with financial planning and investment decisions.'
    },
    
    // Panel configuration for detailed financial advice
    panels: {
      defaultTitle: 'Financial Analysis',
      defaultContent: 'Ask me about investments, taxes, or budgeting for personalized advice.',
      defaultWidth: 400
    }
  },
  
  // Process user queries
  processQuery: async (query, context) => {
    // Get user context if available
    const userRiskTolerance = context.userContext?.preferences?.riskTolerance || 'moderate';
    const userTimeHorizon = context.userContext?.preferences?.investmentTimeHorizon || 'long-term';
    
    // Determine the intent of the query
    const { intent, topics } = determineQueryIntent(query);
    
    // Store query in memory for future reference
    await context.memory.set('lastQuery', { query, intent, topics, timestamp: new Date().toISOString() });
    
    // Generate response based on intent and knowledge base
    const { text, recommendation, details, nextSteps, followupQuestions } = 
      generateFinancialResponse(query, intent, topics);
    
    // Create components for UI surfaces
    const cardComponent = (
      <FinancialRecommendationCard 
        title={`Financial ${intent.charAt(0).toUpperCase() + intent.slice(1)} Advice`}
        recommendation={recommendation}
      />
    );
    
    const panelComponent = (
      <FinancialPlanPanel
        query={query}
        recommendation={recommendation}
        details={details}
        nextSteps={nextSteps}
      />
    );
    
    // Return the complete response
    return {
      text,
      data: {
        intent,
        topics,
        recommendations: {
          primary: recommendation,
          details,
          nextSteps
        },
        userContext: {
          riskTolerance: userRiskTolerance,
          timeHorizon: userTimeHorizon
        }
      },
      followupQuestions,
      ui: {
        card: cardComponent,
        panel: panelComponent
      },
      suggestedActions: [
        {
          label: 'Save Advice',
          action: () => console.log('Saving advice to user profile')
        },
        {
          label: 'Schedule Consultation',
          action: () => console.log('Opening scheduler for consultation')
        }
      ]
    };
  },
  
  // Initialize the agent
  onInitialize: async (context) => {
    console.log('Financial Advisor agent initialized');
    
    // Store knowledge base in memory
    await context.memory.set('knowledgeBase', financialKnowledge);
    
    // Register for relevant events
    context.events.on('user:preference_changed', async (data: any) => {
      console.log('User preferences updated:', data);
      // Update recommendations based on new preferences
    });
    
    context.events.on('market:update', async (data: any) => {
      console.log('Market update received:', data);
      // Potentially notify user of relevant changes
    });
  }
});

export default financialAdvisorAgent; 