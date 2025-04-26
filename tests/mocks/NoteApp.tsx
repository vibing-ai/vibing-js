import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const NoteApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('vibing-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vibing-notes', JSON.stringify(notes));
  }, [notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;
    
    if (editingId) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingId 
          ? { ...note, title, content } 
          : note
      ));
      setEditingId(null);
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString()
      };
      setNotes([...notes, newNote]);
    }
    
    // Clear form
    setTitle('');
    setContent('');
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  return (
    <div className="note-app">
      <h1>Vibing Notes</h1>
      
      <form onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit note:' : 'Create a new note:'}</h2>
        <div>
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Note content"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">
          {editingId ? 'Update Note' : 'Save Note'}
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setTitle('');
            setContent('');
          }}>
            Cancel
          </button>
        )}
      </form>
      
      <div className="notes-list">
        <h2>Your Notes</h2>
        {notes.length === 0 ? (
          <p>No notes yet. Create your first note!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-item">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-actions">
                <button onClick={() => handleEdit(note)}>Edit</button>
                <button onClick={() => handleDelete(note.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoteApp; 