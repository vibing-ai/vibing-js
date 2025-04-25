import React, { useState, useEffect, FormEvent } from 'react';
import { createApp } from '../src/app';
import { useMemory } from '../src/common/memory';
import { useEvents } from '../src/common/events';
import { createConversationCard } from '../src/surfaces/cards';
import { createContextPanel } from '../src/surfaces/panels';
import { useModal } from '../src/surfaces/modals';

/**
 * Simple note-taking app example for Vibing AI SDK
 * 
 * This example demonstrates:
 * - App creation and lifecycle
 * - Memory usage for data persistence
 * - Events for communication
 * - UI rendering with React
 * - Surface integrations (cards, panels, modals)
 */

// Note interface
interface Note {
  id: string;
  text: string;
  createdAt: number;
}

// Create the note-taking app
const noteApp = createApp({
  name: 'QuickNotes',
  description: 'A simple note-taking app for Vibing AI',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0',
});

// Initialize app with memory setup
noteApp.onInitialize(async () => {
  console.log('Initializing QuickNotes app...');
  
  // Initialize memory for storing notes
  const { data: notes, set: setNotes } = useMemory<Note[]>('quicknotes:notes', {
    scope: 'conversation',
    fallback: []
  });
  
  // Set initial notes if none exist
  if (!notes || notes.length === 0) {
    setNotes([
      {
        id: `note-${Date.now()}-1`,
        text: 'Welcome to QuickNotes!',
        createdAt: Date.now()
      },
      {
        id: `note-${Date.now()}-2`,
        text: 'Add your first note below',
        createdAt: Date.now() + 1
      }
    ]);
  }
  
  // Subscribe to relevant events
  const { subscribe } = useEvents();
  
  // Handle note added event
  subscribe('notes:added', (newNote: Note) => {
    const { data: currentNotes, set: setNotes } = useMemory<Note[]>('quicknotes:notes', {
      scope: 'conversation',
    });
    
    setNotes([...currentNotes, newNote]);
    
    // Display a notification card
    createConversationCard({
      content: (
        <div className="note-added-notification">
          <p>Note added: {newNote.text.substring(0, 30)}{newNote.text.length > 30 ? '...' : ''}</p>
        </div>
      ),
      // Auto-remove after 3 seconds
      metadata: { 
        autoRemove: true,
        removeAfter: 3000
      }
    });
  });
  
  // Handle notes cleared event
  subscribe('notes:cleared', () => {
    const { set: setNotes } = useMemory<Note[]>('quicknotes:notes', {
      scope: 'conversation',
    });
    
    setNotes([]);
    
    // Display a notification card
    createConversationCard({
      content: (
        <div className="notes-cleared-notification">
          <p>All notes have been cleared.</p>
        </div>
      ),
      // Auto-remove after 3 seconds
      metadata: { 
        autoRemove: true,
        removeAfter: 3000
      }
    });
  });
  
  // Handle note deleted event
  subscribe('notes:deleted', (noteId: string) => {
    const { data: currentNotes, set: setNotes } = useMemory<Note[]>('quicknotes:notes', {
      scope: 'conversation',
    });
    
    setNotes(currentNotes.filter(note => note.id !== noteId));
  });
  
  console.log('QuickNotes app initialized!');
});

// Render app UI using React
noteApp.onRender((container) => {
  console.log('Rendering QuickNotes app...');
  
  // Main app component
  const QuickNotes: React.FC = () => {
    // Get notes from memory
    const { data: notes, set: setNotes } = useMemory<Note[]>('quicknotes:notes', {
      scope: 'conversation',
      fallback: []
    });
    
    // Local state for the note input
    const [newNoteText, setNewNoteText] = useState('');
    
    // Get events system
    const { publish } = useEvents();
    
    // Get modal functions
    const { showModal } = useModal();
    
    // Handle form submission
    const handleAddNote = (e: FormEvent) => {
      e.preventDefault();
      
      if (newNoteText.trim()) {
        const newNote: Note = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: newNoteText.trim(),
          createdAt: Date.now()
        };
        
        publish('notes:added', newNote);
        setNewNoteText('');
      }
    };
    
    // Handle clearing all notes
    const handleClearNotes = () => {
      const modal = showModal({
        title: 'Confirm Clear',
        content: (
          <div>
            <p>Are you sure you want to clear all notes?</p>
            <p>This action cannot be undone.</p>
          </div>
        ),
        actions: (
          <div className="modal-actions">
            <button onClick={() => modal.hide(false)} className="cancel-button">
              Cancel
            </button>
            <button 
              onClick={() => modal.hide(true)} 
              className="confirm-button"
            >
              Clear All
            </button>
          </div>
        )
      });
      
      // Handle the result
      modal.result.then(confirmed => {
        if (confirmed) {
          publish('notes:cleared');
        }
      });
    };
    
    // Handle deleting a single note
    const handleDeleteNote = (noteId: string) => {
      publish('notes:deleted', noteId);
    };
    
    // Show notes statistics in a context panel when notes change
    useEffect(() => {
      if (notes.length > 0) {
        createContextPanel({
          title: 'Notes Statistics',
          content: (
            <div className="notes-stats">
              <div className="stat-item">
                <span className="stat-label">Total Notes:</span>
                <span className="stat-value">{notes.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Latest Note:</span>
                <span className="stat-value">
                  {new Date(Math.max(...notes.map(n => n.createdAt))).toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Length:</span>
                <span className="stat-value">
                  {Math.round(notes.reduce((sum, n) => sum + n.text.length, 0) / notes.length)} chars
                </span>
              </div>
            </div>
          ),
          width: 250
        });
      }
    }, [notes]);
    
    return (
      <div className="quicknotes-app">
        <header>
          <h1>QuickNotes</h1>
          <p>Your simple note-taking app</p>
        </header>
        
        <div className="notes-container">
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-state">No notes yet. Add your first note below!</div>
            ) : (
              notes
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(note => (
                  <div key={note.id} className="note">
                    <div className="note-content">{note.text}</div>
                    <div className="note-meta">
                      <span className="note-date">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                      <button 
                        className="delete-note" 
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          <form className="notes-form" onSubmit={handleAddNote}>
            <textarea 
              placeholder="Type your note here..." 
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
            />
            <div className="button-group">
              <button 
                type="submit" 
                className="add-note" 
                disabled={!newNoteText.trim()}
              >
                Add Note
              </button>
              <button 
                type="button"
                className="clear-notes" 
                onClick={handleClearNotes}
                disabled={notes.length === 0}
              >
                Clear All
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Render the React component to the container
  // In a real app, you would use ReactDOM.render or createRoot().render()
  // For this example, we'll just set innerHTML to show what it would render
  container.innerHTML = `
    <div class="react-root">
      <!-- QuickNotes React component would render here -->
      <div class="quicknotes-app">
        <header>
          <h1>QuickNotes</h1>
          <p>Your simple note-taking app</p>
        </header>
        
        <div class="notes-container">
          <div class="notes-list">
            <div class="note">
              <div class="note-content">Welcome to QuickNotes!</div>
              <div class="note-meta">
                <span class="note-date">Just now</span>
                <button class="delete-note">Delete</button>
              </div>
            </div>
            <div class="note">
              <div class="note-content">Add your first note below</div>
              <div class="note-meta">
                <span class="note-date">Just now</span>
                <button class="delete-note">Delete</button>
              </div>
            </div>
          </div>
          
          <form class="notes-form">
            <textarea placeholder="Type your note here..."></textarea>
            <div class="button-group">
              <button class="add-note">Add Note</button>
              <button class="clear-notes">Clear All</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  console.log('QuickNotes app rendered!');
  console.log('Note: In an actual implementation, React would be used to render the component.');
});

// Export the app
export default noteApp; 