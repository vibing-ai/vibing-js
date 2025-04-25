export interface ActionSuggestion {
  id: string;
  title: string;
  description?: string;
}

export interface QueryOptions {
  contextId?: string;
}

export const useSuperAgent = jest.fn(() => {
  return {
    query: jest.fn(() => Promise.resolve('')),
    getSuggestions: jest.fn(() => Promise.resolve([])),
    registerActionHandler: jest.fn(() => () => {}),
  };
}); 