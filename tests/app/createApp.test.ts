import { createApp } from '../../src/app/createApp';

// Mock the events module
jest.mock('../../src/core/events', () => ({
  events: {
    publish: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  },
}));

// Import the mocked events
import { events } from '../../src/core/events';

describe('App Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an app with basic configuration', () => {
    // Arrange
    const config = {
      name: 'Test App',
      description: 'Test app description',
    };

    // Act
    const app = createApp(config);

    // Assert
    expect(app).toBeDefined();
    expect(app.config).toEqual(config);
    expect(typeof app.onInitialize).toBe('function');
    expect(typeof app.onRender).toBe('function');
    expect(events.publish).toHaveBeenCalledWith('app:created', {
      name: config.name,
      description: config.description,
    });
  });

  it('should throw an error if name is not provided', () => {
    // Arrange
    const invalidConfig = {} as any;

    // Act & Assert
    expect(() => createApp(invalidConfig)).toThrow('App name is required');
  });

  it('should register lifecycle callbacks', () => {
    // Arrange
    const initCallback = jest.fn();
    const renderCallback = jest.fn();
    const app = createApp({ name: 'Test App' });

    // Act
    app.onInitialize(initCallback);
    app.onRender(renderCallback);

    // Assert
    expect((app as any)._initialize).toBeDefined();
    expect((app as any)._render).toBeDefined();
  });

  it('should handle initialization lifecycle', async () => {
    // Arrange
    const initCallback = jest.fn().mockResolvedValue(true);
    const app = createApp({ name: 'Test App' });
    app.onInitialize(initCallback);

    // Act
    const result = await (app as any)._initialize();

    // Assert
    expect(initCallback).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(events.publish).toHaveBeenCalledWith('app:initializing', { name: 'Test App' });
    expect(events.publish).toHaveBeenCalledWith('app:initialized', { name: 'Test App' });
  });

  it('should handle initialization errors', async () => {
    // Arrange
    const error = new Error('Initialization error');
    const initCallback = jest.fn().mockRejectedValue(error);
    const app = createApp({ name: 'Test App' });
    app.onInitialize(initCallback);

    // Act
    const result = await (app as any)._initialize();

    // Assert
    expect(initCallback).toHaveBeenCalled();
    expect(result).toBe(false);
    expect(events.publish).toHaveBeenCalledWith('app:error', {
      name: 'Test App',
      phase: 'initialization',
      error,
    });
  });

  it('should handle rendering lifecycle', async () => {
    // Arrange
    const container = document.createElement('div');
    const renderCallback = jest.fn();
    const app = createApp({ name: 'Test App' });
    app.onRender(renderCallback);

    // Act
    const result = await (app as any)._render(container);

    // Assert
    expect(renderCallback).toHaveBeenCalledWith(container);
    expect(result).toBe(true);
    expect(events.publish).toHaveBeenCalledWith('app:rendering', { name: 'Test App' });
    expect(events.publish).toHaveBeenCalledWith('app:rendered', { name: 'Test App' });
  });

  it('should handle rendering with no callback', async () => {
    // Arrange
    const container = document.createElement('div');
    const app = createApp({ 
      name: 'Test App',
      description: 'Test description'
    });

    // Act
    const result = await (app as any)._render(container);

    // Assert
    expect(result).toBe(true);
    expect(container.innerHTML).toContain('Test App');
    expect(container.innerHTML).toContain('Test description');
  });

  it('should handle rendering errors', async () => {
    // Arrange
    const container = document.createElement('div');
    const error = new Error('Rendering error');
    const renderCallback = jest.fn().mockRejectedValue(error);
    const app = createApp({ name: 'Test App' });
    app.onRender(renderCallback);

    // Act
    const result = await (app as any)._render(container);

    // Assert
    expect(renderCallback).toHaveBeenCalled();
    expect(result).toBe(false);
    expect(events.publish).toHaveBeenCalledWith('app:error', {
      name: 'Test App',
      phase: 'rendering',
      error,
    });
    expect(container.innerHTML).toContain('Error in Test App');
    expect(container.innerHTML).toContain(error.message);
  });
}); 