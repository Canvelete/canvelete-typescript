# Canvelete TypeScript SDK

Official TypeScript client library for the [Canvelete](https://www.canvelete.com) API.

## Installation

```bash
npm install @canvelete/sdk
```

## Quick Start

```typescript
import { CanveleteClient } from '@canvelete/sdk';

// Initialize client with API key
const client = new CanveleteClient({
  apiKey: 'cvt_your_api_key_here'
});

// List designs
const designs = await client.designs.list();
console.log(`Found ${designs.data.length} designs`);

// Create a design
const design = await client.designs.create({
  name: 'My Design',
  canvasData: {
    elements: [
      {
        type: 'text',
        text: 'Hello Canvelete!',
        x: 100,
        y: 100,
        fontSize: 48
      }
    ]
  },
  width: 1920,
  height: 1080
});

// Render the design
const imageData = await client.render.create({
  designId: design.data.id,
  format: 'png',
  outputFile: 'output.png'
});
```

## API Reference

### Designs

```typescript
// List with pagination
const designs = await client.designs.list({ page: 1, limit: 20 });

// Iterate all (auto-pagination)
for await (const design of client.designs.iterateAll()) {
  console.log(design.name);
}

// Create
const design = await client.designs.create({ name: 'New Design', canvasData: {...} });

// Get
const design = await client.designs.get('design_id');

// Update
const updated = await client.designs.update('design_id', { name: 'Updated' });

// Delete
await client.designs.delete('design_id');
```

### Templates

```typescript
// List templates
const templates = await client.templates.list({ search: 'certificate' });

// Iterate all
for await (const template of client.templates.iterateAll()) {
  console.log(template.name);
}
```

### Render

```typescript
// Render to file
await client.render.create({
  templateId: 'template_id',
  dynamicData: { name: 'John Doe', date: '2024-01-01' },
  format: 'pdf',
  outputFile: 'certificate.pdf'
});

// Get binary data
const imageBuffer = await client.render.create({
  designId: 'design_id',
  format: 'png'
});
```

### API Keys

```typescript
// List keys
const keys = await client.apiKeys.list();

// Create new key
const newKey = await client.apiKeys.create({ name: 'Production Key' });
console.log(`Save this: ${newKey.data.key}`); // Shown only once!
```

## Error Handling

```typescript
import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError
} from '@canvelete/sdk';

try {
  const design = await client.designs.get('invalid_id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Design not found');
  } else if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  }
}
```

## License

MIT
