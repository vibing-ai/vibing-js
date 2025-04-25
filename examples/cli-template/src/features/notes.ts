/**
 * Notes Feature Implementation
 * 
 * This module provides functionality for creating, managing, and displaying notes.
 */
import { useMemory, useSuperAgent, createConversationCard, createContextPanel, useModal } from '@vibing-ai/sdk';
import type { AppContext } from '@vibing-ai/sdk';

// Define note structure
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// Notes feature implementation
export const noteFeature = {
  /**
   * Initialize the notes feature
   */
  initialize: async (context: AppContext) => {
    const { subscribe } = context.events;
    
    // Listen for note-related events
    subscribe('note:create', handleCreateNote);
    subscribe('note:edit', handleEditNote);
    subscribe('note:delete', handleDeleteNote);
    subscribe('note:view', handleViewNote);
    
    // Register with Super Agent for note-related queries
    const { onIntent } = useSuperAgent();
    
    onIntent('create-note', async (params) => {
      const { title = 'New Note', content = '' } = params;
      return createNote(title, content);
    });
    
    onIntent('find-notes', async (params) => {
      const { query } = params;
      return findNotes(query);
    });
    
    console.log('Notes feature initialized');
  }
};

/**
 * Create a new note
 */
async function createNote(title: string, content: string, tags: string[] = []): Promise<Note> {
  const { set } = useMemory();
  
  const note: Note = {
    id: `note-${Date.now()}`,
    title,
    content,
    tags,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Store the note in memory
  await set(`notes.${note.id}`, note);
  
  // Create a conversation card to show the note was created
  createConversationCard({
    content: (
      <div>
        <h3>Note Created</h3>
        <p><strong>{note.title}</strong></p>
        <p>{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
      </div>
    ),
    actions: (
      <div>
        <button onClick={() => handleViewNote({ noteId: note.id })}>View</button>
        <button onClick={() => handleEditNote({ noteId: note.id })}>Edit</button>
      </div>
    )
  });
  
  return note;
}

/**
 * Find notes by search query
 */
async function findNotes(query: string): Promise<Note[]> {
  const { getAll } = useMemory();
  
  // Get all notes from memory
  const allNotes = await getAll<Note>('notes.*');
  
  // Filter notes based on query
  const filteredNotes = Object.values(allNotes).filter(note => 
    note.title.toLowerCase().includes(query.toLowerCase()) || 
    note.content.toLowerCase().includes(query.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
  
  return filteredNotes;
}

/**
 * Handle note creation event
 */
async function handleCreateNote() {
  const { showModal } = useModal();
  
  // Show modal for note creation
  const result = await showModal({
    title: 'Create New Note',
    content: (
      <div>
        <label>
          Title:
          <input id="note-title" type="text" placeholder="Note title" />
        </label>
        <label>
          Content:
          <textarea id="note-content" placeholder="Note content" rows={6} />
        </label>
        <label>
          Tags (comma separated):
          <input id="note-tags" type="text" placeholder="tag1, tag2, tag3" />
        </label>
      </div>
    ),
    actions: (
      <div>
        <button id="create-button">Create</button>
        <button id="cancel-button">Cancel</button>
      </div>
    ),
    size: 'medium'
  });
  
  if (result && result.buttonId === 'create-button') {
    const title = result.formData.get('note-title') as string;
    const content = result.formData.get('note-content') as string;
    const tagsInput = result.formData.get('note-tags') as string;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    await createNote(title, content, tags);
  }
}

/**
 * Handle note edit event
 */
async function handleEditNote({ noteId }: { noteId: string }) {
  const { get, set } = useMemory();
  const { showModal } = useModal();
  
  // Get the note from memory
  const note = await get<Note>(`notes.${noteId}`);
  
  if (!note) {
    console.error(`Note with ID ${noteId} not found`);
    return;
  }
  
  // Show modal for note editing
  const result = await showModal({
    title: 'Edit Note',
    content: (
      <div>
        <label>
          Title:
          <input id="note-title" type="text" defaultValue={note.title} />
        </label>
        <label>
          Content:
          <textarea id="note-content" defaultValue={note.content} rows={6} />
        </label>
        <label>
          Tags (comma separated):
          <input id="note-tags" type="text" defaultValue={note.tags.join(', ')} />
        </label>
      </div>
    ),
    actions: (
      <div>
        <button id="save-button">Save</button>
        <button id="cancel-button">Cancel</button>
      </div>
    ),
    size: 'medium'
  });
  
  if (result && result.buttonId === 'save-button') {
    const title = result.formData.get('note-title') as string;
    const content = result.formData.get('note-content') as string;
    const tagsInput = result.formData.get('note-tags') as string;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // Update the note
    const updatedNote = {
      ...note,
      title,
      content,
      tags,
      updatedAt: Date.now()
    };
    
    // Save the updated note
    await set(`notes.${noteId}`, updatedNote);
    
    // Update any open views of this note
    createConversationCard({
      content: (
        <div>
          <h3>Note Updated</h3>
          <p><strong>{updatedNote.title}</strong></p>
          <p>{updatedNote.content.substring(0, 100)}{updatedNote.content.length > 100 ? '...' : ''}</p>
        </div>
      ),
      actions: (
        <div>
          <button onClick={() => handleViewNote({ noteId })}>View</button>
        </div>
      )
    });
  }
}

/**
 * Handle note delete event
 */
async function handleDeleteNote({ noteId }: { noteId: string }) {
  const { get, remove } = useMemory();
  const { showModal } = useModal();
  
  // Get the note from memory
  const note = await get<Note>(`notes.${noteId}`);
  
  if (!note) {
    console.error(`Note with ID ${noteId} not found`);
    return;
  }
  
  // Show confirmation modal
  const result = await showModal({
    title: 'Delete Note',
    content: (
      <div>
        <p>Are you sure you want to delete the note "{note.title}"?</p>
        <p>This action cannot be undone.</p>
      </div>
    ),
    actions: (
      <div>
        <button id="confirm-button">Delete</button>
        <button id="cancel-button">Cancel</button>
      </div>
    ),
    size: 'small'
  });
  
  if (result && result.buttonId === 'confirm-button') {
    // Remove the note from memory
    await remove(`notes.${noteId}`);
    
    // Show confirmation
    createConversationCard({
      content: (
        <div>
          <p>Note "{note.title}" has been deleted.</p>
        </div>
      )
    });
  }
}

/**
 * Handle note view event
 */
async function handleViewNote({ noteId }: { noteId: string }) {
  const { get } = useMemory();
  
  // Get the note from memory
  const note = await get<Note>(`notes.${noteId}`);
  
  if (!note) {
    console.error(`Note with ID ${noteId} not found`);
    return;
  }
  
  // Create a context panel to display the note
  createContextPanel({
    title: note.title,
    content: (
      <div>
        <div className="note-content">
          {note.content}
        </div>
        {note.tags.length > 0 && (
          <div className="note-tags">
            <p>Tags: {note.tags.join(', ')}</p>
          </div>
        )}
        <div className="note-meta">
          <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(note.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    ),
    actions: (
      <div>
        <button onClick={() => handleEditNote({ noteId })}>Edit</button>
        <button onClick={() => handleDeleteNote({ noteId })}>Delete</button>
      </div>
    ),
    width: '400px'
  });
} 