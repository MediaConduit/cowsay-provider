# MediaConduit Cowsay Provider

A Docker-based text-to-text provider for MediaConduit that generates ASCII art using cowsay.

## Features

- Converts text input to ASCII art featuring a cow saying your text
- Dockerized service with health checks
- TypeScript support with full type definitions
- Integration with MediaConduit's provider system

## Installation

```bash
npm install @mediaconduit/cowsay-provider
```

## Usage

The provider is automatically loaded by MediaConduit when installed. It provides a single model:

- `cowsay-default`: Basic cowsay ASCII art generation

## Docker Service

This provider uses a Docker service that runs cowsay in a containerized environment. The service:

- Exposes port 80 by default
- Provides `/health` endpoint for health checks
- Accepts POST requests to `/cowsay` with JSON payload: `{"text": "your text here"}`

## Configuration

Environment variables:
- `COWSAY_SERVICE_URL`: Custom service URL (defaults to GitHub repository)

## API

### CowsayAPIClient

HTTP client for communicating with the cowsay service.

```typescript
import { CowsayAPIClient } from '@mediaconduit/cowsay-provider';

const client = new CowsayAPIClient({
  baseUrl: 'http://localhost:80',
  timeout: 30000
});

const cowsayOutput = await client.generateCowsay('Hello World!');
```

### CowsayDockerProvider

Main provider class implementing MediaConduit's provider interface.

```typescript
import { CowsayDockerProvider } from '@mediaconduit/cowsay-provider';

const provider = new CowsayDockerProvider();
const model = await provider.createModel('cowsay-default');
const result = await model.transform(inputText);
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

## License

MIT
