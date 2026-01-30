# HyperFleet Explorer

A Vue 3 application for exploring and managing HyperFleet clusters and nodepools.

## Prerequisites

- Node.js 18+
- npm

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Proxy

The default API Base URL is `http://localhost:5173` (the Vite dev server). The dev server proxies all `/api` requests to the HyperFleet API at `http://localhost:8000`.

This means:
- Requests to `http://localhost:5173/api/...` are forwarded to `http://localhost:8000/api/...`
- No CORS configuration is needed on the backend during development

To change the backend API target, modify the proxy in `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',  // Change this
      changeOrigin: true,
    }
  }
}
```

## Build

```bash
npm run build
```

Output will be in the `dist/` directory.
