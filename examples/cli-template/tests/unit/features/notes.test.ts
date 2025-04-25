/**
 * Unit Tests for Notes Feature
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { noteFeature } from '../../../src/features/notes';
import * as memoryModule from '@vibing-ai/sdk';

// Mock the SDK
vi.mock('@vibing-ai/sdk', () => ({
  useMemory: vi.fn(),
  useSuperAgent: vi.fn(),
  createConversationCard: vi.fn(),
  createContextPanel: vi.fn(),
  useModal: vi.fn()
}));

describe('Notes Feature', () => {
  let mockContext: any;
  let mockSubscribe: any;
  let mockOnIntent: any;
  
  beforeEach(() => {
    // Setup mocks
    mockSubscribe = vi.fn();
    mockOnIntent = vi.fn();
    
    mockContext = {
      events: {
        subscribe: mockSubscribe,
        publish: vi.fn()
      }
    };
    
    // Mock the SDK hooks
    (memoryModule.useMemory as any).mockReturnValue({
      get: vi.fn(),
      set: vi.fn(),
      getAll: vi.fn(),
      remove: vi.fn(),
      initialize: vi.fn(),
      ensureNamespace: vi.fn()
    });
    
    (memoryModule.useSuperAgent as any).mockReturnValue({
      onIntent: mockOnIntent
    });
    
    (memoryModule.useModal as any).mockReturnValue({
      showModal: vi.fn()
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should initialize the notes feature', async () => {
    await noteFeature.initialize(mockContext);
    
    // Check that event subscriptions are set up
    expect(mockSubscribe).toHaveBeenCalledWith('note:create', expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalledWith('note:edit', expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalledWith('note:delete', expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalledWith('note:view', expect.any(Function));
    
    // Check that Super Agent intents are registered
    expect(mockOnIntent).toHaveBeenCalledWith('create-note', expect.any(Function));
    expect(mockOnIntent).toHaveBeenCalledWith('find-notes', expect.any(Function));
  });
  
  it('should create a note and store it in memory', async () => {
    // Setup mocks for this test
    const mockSet = vi.fn().mockResolvedValue(undefined);
    const mockCreateCard = vi.fn();
    
    (memoryModule.useMemory as any).mockReturnValue({
      set: mockSet
    });
    
    (memoryModule.createConversationCard as any).mockImplementation(mockCreateCard);
    
    // Get the create-note handler
    await noteFeature.initialize(mockContext);
    const createNoteHandler = mockOnIntent.mock.calls.find(
      call => call[0] === 'create-note'
    )[1];
    
    // Call the handler
    const result = await createNoteHandler({
      title: 'Test Note',
      content: 'Test Content'
    });
    
    // Check that the note was stored
    expect(mockSet).toHaveBeenCalledWith(
      expect.stringMatching(/^notes\.note-\d+$/),
      expect.objectContaining({
        title: 'Test Note',
        content: 'Test Content'
      })
    );
    
    // Check that a card was created
    expect(mockCreateCard).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.anything(),
      actions: expect.anything()
    }));
    
    // Check the returned note
    expect(result).toEqual(expect.objectContaining({
      id: expect.stringMatching(/^note-\d+$/),
      title: 'Test Note',
      content: 'Test Content',
      tags: [],
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number)
    }));
  });
  
  it('should find notes by search query', async () => {
    // Setup mock notes
    const mockNotes = {
      'notes.note-1': {
        id: 'note-1',
        title: 'First Note',
        content: 'This is the first note',
        tags: ['important'],
        createdAt: 1000,
        updatedAt: 1000
      },
      'notes.note-2': {
        id: 'note-2',
        title: 'Second Note',
        content: 'This is another note',
        tags: ['todo'],
        createdAt: 2000,
        updatedAt: 2000
      }
    };
    
    const mockGetAll = vi.fn().mockResolvedValue(mockNotes);
    
    (memoryModule.useMemory as any).mockReturnValue({
      getAll: mockGetAll
    });
    
    // Get the find-notes handler
    await noteFeature.initialize(mockContext);
    const findNotesHandler = mockOnIntent.mock.calls.find(
      call => call[0] === 'find-notes'
    )[1];
    
    // Call the handler with a query that should match the first note
    const result1 = await findNotesHandler({
      query: 'first'
    });
    
    expect(mockGetAll).toHaveBeenCalledWith('notes.*');
    expect(result1).toHaveLength(1);
    expect(result1[0]).toEqual(mockNotes['notes.note-1']);
    
    // Call the handler with a query that should match both notes
    const result2 = await findNotesHandler({
      query: 'note'
    });
    
    expect(result2).toHaveLength(2);
    
    // Call the handler with a query that should match by tag
    const result3 = await findNotesHandler({
      query: 'todo'
    });
    
    expect(result3).toHaveLength(1);
    expect(result3[0]).toEqual(mockNotes['notes.note-2']);
  });
}); 