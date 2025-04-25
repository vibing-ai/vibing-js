/**
 * Tasks Feature Implementation
 * 
 * This module provides functionality for creating, managing, and displaying tasks.
 */
import { useMemory, useSuperAgent, createConversationCard, createContextPanel, useModal } from '@vibing-ai/sdk';
import type { AppContext } from '@vibing-ai/sdk';

// Define task structure
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: number;
  createdAt: number;
  completedAt?: number;
}

// Tasks feature implementation
export const taskFeature = {
  /**
   * Initialize the tasks feature
   */
  initialize: async (context: AppContext) => {
    const { subscribe } = context.events;
    
    // Listen for task-related events
    subscribe('task:create', handleCreateTask);
    subscribe('task:update', handleUpdateTask);
    subscribe('task:delete', handleDeleteTask);
    subscribe('task:view', handleViewTask);
    subscribe('task:complete', handleCompleteTask);
    
    // Register with Super Agent for task-related queries
    const { onIntent } = useSuperAgent();
    
    onIntent('create-task', async (params) => {
      const { title, priority = 'medium', dueDate } = params;
      return createTask(title, priority, dueDate);
    });
    
    onIntent('list-tasks', async (params) => {
      const { status } = params;
      return listTasks(status);
    });
    
    onIntent('complete-task', async (params) => {
      const { taskId } = params;
      return completeTask(taskId);
    });
    
    console.log('Tasks feature initialized');
  }
};

/**
 * Create a new task
 */
async function createTask(
  title: string, 
  priority: 'low' | 'medium' | 'high' = 'medium',
  dueDate?: number,
  description?: string
): Promise<Task> {
  const { set } = useMemory();
  
  const task: Task = {
    id: `task-${Date.now()}`,
    title,
    description,
    status: 'todo',
    priority,
    dueDate,
    createdAt: Date.now()
  };
  
  // Store the task in memory
  await set(`tasks.${task.id}`, task);
  
  // Create a conversation card to show the task was created
  createConversationCard({
    content: (
      <div>
        <h3>Task Created</h3>
        <p><strong>{task.title}</strong></p>
        {task.description && <p>{task.description}</p>}
        <p>
          Priority: {task.priority} 
          {task.dueDate && ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
        </p>
      </div>
    ),
    actions: (
      <div>
        <button onClick={() => handleViewTask({ taskId: task.id })}>View</button>
        <button onClick={() => handleCompleteTask({ taskId: task.id })}>Complete</button>
      </div>
    )
  });
  
  return task;
}

/**
 * List tasks by status
 */
async function listTasks(status?: 'todo' | 'in-progress' | 'completed'): Promise<Task[]> {
  const { getAll } = useMemory();
  
  // Get all tasks from memory
  const allTasks = await getAll<Task>('tasks.*');
  
  // Filter tasks based on status if provided
  const filteredTasks = Object.values(allTasks).filter(task => 
    !status || task.status === status
  );
  
  // Sort by priority and due date
  return filteredTasks.sort((a, b) => {
    // First sort by status (todo > in-progress > completed)
    const statusOrder = { 'todo': 0, 'in-progress': 1, 'completed': 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by priority (high > medium > low)
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by due date (earliest first)
    if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    // Finally sort by creation date (newest first)
    return b.createdAt - a.createdAt;
  });
}

/**
 * Handle task creation event
 */
async function handleCreateTask() {
  const { showModal } = useModal();
  
  // Show modal for task creation
  const result = await showModal({
    title: 'Create New Task',
    content: (
      <div>
        <label>
          Title:
          <input id="task-title" type="text" placeholder="Task title" />
        </label>
        <label>
          Description:
          <textarea id="task-description" placeholder="Task description" rows={3} />
        </label>
        <label>
          Priority:
          <select id="task-priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Due Date:
          <input id="task-due-date" type="date" />
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
    const title = result.formData.get('task-title') as string;
    const description = result.formData.get('task-description') as string;
    const priority = result.formData.get('task-priority') as 'low' | 'medium' | 'high';
    const dueDateStr = result.formData.get('task-due-date') as string;
    
    const dueDate = dueDateStr ? new Date(dueDateStr).getTime() : undefined;
    
    await createTask(title, priority, dueDate, description || undefined);
  }
}

/**
 * Handle task update event
 */
async function handleUpdateTask({ taskId }: { taskId: string }) {
  const { get, set } = useMemory();
  const { showModal } = useModal();
  
  // Get the task from memory
  const task = await get<Task>(`tasks.${taskId}`);
  
  if (!task) {
    console.error(`Task with ID ${taskId} not found`);
    return;
  }
  
  // Format the date for the input field
  const formattedDueDate = task.dueDate 
    ? new Date(task.dueDate).toISOString().split('T')[0]
    : '';
  
  // Show modal for task editing
  const result = await showModal({
    title: 'Edit Task',
    content: (
      <div>
        <label>
          Title:
          <input id="task-title" type="text" defaultValue={task.title} />
        </label>
        <label>
          Description:
          <textarea id="task-description" defaultValue={task.description || ''} rows={3} />
        </label>
        <label>
          Status:
          <select id="task-status" defaultValue={task.status}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Priority:
          <select id="task-priority" defaultValue={task.priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Due Date:
          <input id="task-due-date" type="date" defaultValue={formattedDueDate} />
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
    const title = result.formData.get('task-title') as string;
    const description = result.formData.get('task-description') as string;
    const status = result.formData.get('task-status') as 'todo' | 'in-progress' | 'completed';
    const priority = result.formData.get('task-priority') as 'low' | 'medium' | 'high';
    const dueDateStr = result.formData.get('task-due-date') as string;
    
    const dueDate = dueDateStr ? new Date(dueDateStr).getTime() : undefined;
    
    // Update the task
    const updatedTask: Task = {
      ...task,
      title,
      description: description || undefined,
      status,
      priority,
      dueDate,
      // Update completedAt if the status changed to completed
      completedAt: status === 'completed' && task.status !== 'completed'
        ? Date.now()
        : status !== 'completed' ? undefined : task.completedAt
    };
    
    // Save the updated task
    await set(`tasks.${taskId}`, updatedTask);
    
    // Update any open views of this task
    createConversationCard({
      content: (
        <div>
          <h3>Task Updated</h3>
          <p><strong>{updatedTask.title}</strong></p>
          <p>Status: {updatedTask.status} • Priority: {updatedTask.priority}</p>
        </div>
      ),
      actions: (
        <div>
          <button onClick={() => handleViewTask({ taskId })}>View</button>
        </div>
      )
    });
  }
}

/**
 * Handle task delete event
 */
async function handleDeleteTask({ taskId }: { taskId: string }) {
  const { get, remove } = useMemory();
  const { showModal } = useModal();
  
  // Get the task from memory
  const task = await get<Task>(`tasks.${taskId}`);
  
  if (!task) {
    console.error(`Task with ID ${taskId} not found`);
    return;
  }
  
  // Show confirmation modal
  const result = await showModal({
    title: 'Delete Task',
    content: (
      <div>
        <p>Are you sure you want to delete the task "{task.title}"?</p>
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
    // Remove the task from memory
    await remove(`tasks.${taskId}`);
    
    // Show confirmation
    createConversationCard({
      content: (
        <div>
          <p>Task "{task.title}" has been deleted.</p>
        </div>
      )
    });
  }
}

/**
 * Handle completing a task
 */
async function handleCompleteTask({ taskId }: { taskId: string }) {
  const { get, set } = useMemory();
  
  // Get the task from memory
  const task = await get<Task>(`tasks.${taskId}`);
  
  if (!task) {
    console.error(`Task with ID ${taskId} not found`);
    return;
  }
  
  // Update the task status to completed
  const updatedTask: Task = {
    ...task,
    status: 'completed',
    completedAt: Date.now()
  };
  
  // Save the updated task
  await set(`tasks.${taskId}`, updatedTask);
  
  // Show confirmation
  createConversationCard({
    content: (
      <div>
        <h3>Task Completed</h3>
        <p><strong>{updatedTask.title}</strong></p>
        <p>Completed on {new Date(updatedTask.completedAt).toLocaleString()}</p>
      </div>
    )
  });
}

/**
 * Handle task view event
 */
async function handleViewTask({ taskId }: { taskId: string }) {
  const { get } = useMemory();
  
  // Get the task from memory
  const task = await get<Task>(`tasks.${taskId}`);
  
  if (!task) {
    console.error(`Task with ID ${taskId} not found`);
    return;
  }
  
  // Define status label colors
  const statusColors = {
    'todo': '#f97316',
    'in-progress': '#3b82f6',
    'completed': '#22c55e'
  };
  
  // Define priority label colors
  const priorityColors = {
    'low': '#94a3b8',
    'medium': '#f59e0b',
    'high': '#ef4444'
  };
  
  // Create a context panel to display the task
  createContextPanel({
    title: task.title,
    content: (
      <div>
        {task.description && (
          <div className="task-description">
            <p>{task.description}</p>
          </div>
        )}
        
        <div className="task-status-labels">
          <span style={{ backgroundColor: statusColors[task.status], padding: '4px 8px', borderRadius: '4px', color: 'white' }}>
            {task.status === 'todo' ? 'To Do' : 
             task.status === 'in-progress' ? 'In Progress' : 
             'Completed'}
          </span>
          
          <span style={{ backgroundColor: priorityColors[task.priority], padding: '4px 8px', borderRadius: '4px', marginLeft: '8px', color: 'white' }}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
        </div>
        
        <div className="task-dates">
          {task.dueDate && (
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
          )}
          <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
          {task.completedAt && (
            <p>Completed: {new Date(task.completedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    ),
    actions: (
      <div>
        {task.status !== 'completed' && (
          <button onClick={() => handleCompleteTask({ taskId })}>Mark as Completed</button>
        )}
        <button onClick={() => handleUpdateTask({ taskId })}>Edit</button>
        <button onClick={() => handleDeleteTask({ taskId })}>Delete</button>
      </div>
    ),
    width: '400px'
  });
} 