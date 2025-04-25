# Vibing AI SDK Template App

A starter template for creating applications with the Vibing AI SDK. This template demonstrates best practices and common patterns for building applications on the Vibing AI platform.

## Features

This template includes:

- Full app lifecycle management
- Memory system integration
- Permission handling
- Multiple surface integrations (Cards, Panels, Modals, Canvas)
- Super Agent integration
- Event handling
- Sample features (Notes and Tasks)

## Getting Started

### Prerequisites

- Node.js 16 or higher
- NPM or Yarn
- Vibing AI CLI (`npm install -g @vibing-ai/cli`)

### Installation

1. Create a new project using this template:

```bash
vibing init my-app --template basic-app
```

Or clone this template manually:

```bash
git clone <repository-url>
cd <project-folder>
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Visit the local development environment at `http://localhost:3000`

## Project Structure

```
my-app/
├── src/
│   ├── index.ts                # Main entry point
│   ├── components/             # Reusable UI components
│   ├── features/               # Feature modules
│   │   ├── notes.ts            # Notes feature
│   │   └── tasks.ts            # Tasks feature
│   └── utils/                  # Utility functions
│       ├── memory.ts           # Memory system setup
│       └── events.ts           # Event handling
├── public/                     # Static assets
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── vibing.json                 # Project manifest
├── package.json                # NPM package configuration
└── README.md                   # Project documentation
```

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run validate` - Validate project configuration
- `npm run deploy` - Deploy to Vibing AI platform

### Adding a New Feature

1. Create a new feature file in `src/features/`
2. Import and initialize the feature in `src/index.ts`
3. Add any necessary UI components in `src/components/`
4. Register any event handlers or Super Agent intents

## Testing

Run tests with:

```bash
npm test
```

## Deployment

To deploy your app to the Vibing AI platform:

```bash
npm run deploy
```

## Learn More

- [Vibing AI SDK Documentation](https://docs.vibing.ai/sdk)
- [CLI Usage Guide](https://docs.vibing.ai/cli)
- [Vibing AI Platform Guide](https://docs.vibing.ai/platform)

## License

MIT 