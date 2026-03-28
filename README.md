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

## Running with Docker/Podman

The container image is available at `quay.io/amarin/hyperfleet-explorer`.

It serves the app via nginx on port 80 and proxies all `/api/*` requests to the HyperFleet API, avoiding CORS issues.

**Basic usage:**

```bash
podman run -p 5173:80 -e API_URL=http://<api-host>:<port> quay.io/amarin/hyperfleet-explorer:latest
```

The app will be available at `http://localhost:5173`. Leave the **API Base URL** field empty in the UI — nginx handles the proxying automatically.

**Running locally with a HyperFleet API on your machine:**

```bash
podman run -p 5173:80 -e API_URL=http://host.docker.internal:8080 quay.io/amarin/hyperfleet-explorer:latest
```

`host.docker.internal` resolves to the host machine from inside the container.

| Environment variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:8080` | HyperFleet API base URL, reachable from inside the container |

## Build

```bash
npm run build
```

Output will be in the `dist/` directory.
