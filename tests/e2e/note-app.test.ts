/**
 * End-to-end tests for the note app example
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NoteApp from '../../examples/note-app';
import { act } from 'react-dom/test-utils';

// Mock local storage for persistence testing
const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset mock localStorage
  Object.keys(mockLocalStorage).forEach(key => {
    delete mockLocalStorage[key];
  });
  
  // Set up localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(mockLocalStorage).forEach(key => {
          delete mockLocalStorage[key];
        });
      })
    },
    writable: true
  });
});

// Helper function to wait for promises to resolve
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Note App E2E Tests', () => {
  test('App renders with an empty note list and new note form', async () => {
    render(<NoteApp />);
    
    // Check initial render state
    expect(screen.getByText('Vibing Notes')).toBeInTheDocument();
    expect(screen.getByText('Create a new note:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Note' })).toBeInTheDocument();
    
    // No notes should be displayed initially
    expect(screen.getByText('No notes yet. Create your first note!')).toBeInTheDocument();
  });
  
  test('User can create a new note', async () => {
    const user = userEvent.setup();
    render(<NoteApp />);
    
    // Fill in the form
    await user.type(screen.getByPlaceholderText('Note title'), 'Shopping List');
    await user.type(screen.getByPlaceholderText('Note content'), 'Milk, Eggs, Bread');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save Note' }));
    
    // Wait for state updates
    await flushPromises();
    
    // Note should appear in the list
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(screen.getByText('Milk, Eggs, Bread')).toBeInTheDocument();
    
    // Form should be cleared
    expect(screen.getByPlaceholderText('Note title')).toHaveValue('');
    expect(screen.getByPlaceholderText('Note content')).toHaveValue('');
    
    // Data should be saved to localStorage
    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(JSON.parse(mockLocalStorage['vibing-notes'] || '{}')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Shopping List',
          content: 'Milk, Eggs, Bread'
        })
      ])
    );
  });
  
  test('User can edit an existing note', async () => {
    const user = userEvent.setup();
    
    // Pre-populate localStorage with a note
    mockLocalStorage['vibing-notes'] = JSON.stringify([
      { id: '123', title: 'Meeting Notes', content: 'Discuss project timeline', createdAt: new Date().toISOString() }
    ]);
    
    render(<NoteApp />);
    
    // Note should be displayed
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    
    // Click edit button
    const noteElement = screen.getByText('Meeting Notes').closest('.note-item') as HTMLElement;
    await user.click(within(noteElement).getByRole('button', { name: 'Edit' }));
    
    // Edit form should appear with pre-filled data
    expect(screen.getByDisplayValue('Meeting Notes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Discuss project timeline')).toBeInTheDocument();
    
    // Update content
    await user.clear(screen.getByDisplayValue('Discuss project timeline'));
    await user.type(screen.getByDisplayValue('Discuss project timeline'), 'New agenda items added');
    
    // Save changes
    await user.click(screen.getByRole('button', { name: 'Update Note' }));
    
    // Wait for state updates
    await flushPromises();
    
    // Updated note should be displayed
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    expect(screen.getByText('New agenda items added')).toBeInTheDocument();
    
    // Data should be updated in localStorage
    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(JSON.parse(mockLocalStorage['vibing-notes'] || '{}')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Meeting Notes',
          content: 'New agenda items added'
        })
      ])
    );
  });
  
  test('User can delete a note', async () => {
    const user = userEvent.setup();
    
    // Pre-populate localStorage with two notes
    mockLocalStorage['vibing-notes'] = JSON.stringify([
      { id: '123', title: 'Shopping List', content: 'Milk, Eggs, Bread', createdAt: new Date().toISOString() },
      { id: '456', title: 'Work Tasks', content: 'Finish report', createdAt: new Date().toISOString() }
    ]);
    
    render(<NoteApp />);
    
    // Both notes should be displayed
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(screen.getByText('Work Tasks')).toBeInTheDocument();
    
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);
    
    // Click delete button on the first note
    const noteElement = screen.getByText('Shopping List').closest('.note-item') as HTMLElement;
    await user.click(within(noteElement).getByRole('button', { name: 'Delete' }));
    
    // Wait for state updates
    await flushPromises();
    
    // First note should be deleted, second note remains
    expect(screen.queryByText('Shopping List')).not.toBeInTheDocument();
    expect(screen.getByText('Work Tasks')).toBeInTheDocument();
    
    // Confirm deletion dialog should have been shown
    expect(window.confirm).toHaveBeenCalled();
    
    // Data should be updated in localStorage
    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(JSON.parse(mockLocalStorage['vibing-notes'] || '{}')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Work Tasks',
          content: 'Finish report'
        })
      ])
    );
    expect(JSON.parse(mockLocalStorage['vibing-notes'] || '[]')).toHaveLength(1);
  });
  
  test('Note data persists between sessions', async () => {
    // Simulate previous session data
    mockLocalStorage['vibing-notes'] = JSON.stringify([
      { id: '123', title: 'Saved Note', content: 'This was saved previously', createdAt: new Date().toISOString() }
    ]);
    
    // First render - simulates page load
    const { unmount } = render(<NoteApp />);
    
    // Note from localStorage should be displayed
    expect(screen.getByText('Saved Note')).toBeInTheDocument();
    expect(screen.getByText('This was saved previously')).toBeInTheDocument();
    
    // Unmount to simulate closing the app
    unmount();
    
    // Render again to simulate reopening the app
    render(<NoteApp />);
    
    // Data should still be there
    expect(screen.getByText('Saved Note')).toBeInTheDocument();
    expect(screen.getByText('This was saved previously')).toBeInTheDocument();
    
    // localStorage.getItem should have been called to retrieve data
    expect(window.localStorage.getItem).toHaveBeenCalledWith('vibing-notes');
  });
  
  test('App handles permission flows appropriately', async () => {
    // Mock the permissions module
    const mockRequestPermission = jest.fn(() => Promise.resolve(true));
    const mockCheckPermission = jest.fn(() => Promise.resolve(false));
    
    jest.mock('../../src/common/permissions', () => ({
      usePermissions: () => ({
        requestPermission: mockRequestPermission,
        checkPermission: mockCheckPermission
      })
    }));
    
    // Render the app
    render(<NoteApp />);
    
    // Permission check should occur on load
    await waitFor(() => {
      expect(mockCheckPermission).toHaveBeenCalledWith('memory:read:notes');
    });
    
    // Fill in the form
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Note title'), 'Permission Test');
    await user.type(screen.getByPlaceholderText('Note content'), 'Testing permission flow');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save Note' }));
    
    // Permission request should occur
    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalledWith({
        permission: 'memory:write:notes',
        reason: 'Store your notes'
      });
    });
  });
  
  test('App handles error states properly', async () => {
    // Mock localStorage to throw on write
    const localStorageError = new Error('Storage quota exceeded');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => {
          throw localStorageError;
        }),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const user = userEvent.setup();
    render(<NoteApp />);
    
    // Fill in the form
    await user.type(screen.getByPlaceholderText('Note title'), 'Error Test');
    await user.type(screen.getByPlaceholderText('Note content'), 'This will cause an error');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save Note' }));
    
    // Error should be logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save notes'),
      localStorageError
    );
    
    // Error message should be displayed to user
    await waitFor(() => {
      expect(screen.getByText('Error saving note. Please try again.')).toBeInTheDocument();
    });
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });
}); 