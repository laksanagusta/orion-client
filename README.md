# Orion Client

Frontend aplikasi JPL Certificate Service menggunakan React + TypeScript + Vite.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run dev server (port 3001)
npm run dev

# Build for production
npm run build
```

### Environment Variables (.env)

```env
PORT=3001
VITE_API_URL=http://localhost:8080
VITE_IDENTITY_URL=http://localhost:8080
```

## 🐳 Docker Deployment

### Build & Push

```bash
# Build dengan production URL
make docker-build VITE_API_URL=https://orion.marvcore.com VITE_IDENTITY_URL=https://orion.marvcore.com

# Push ke Docker Hub
make docker-push

# Atau langsung deploy (build + push)
make docker-deploy VITE_API_URL=https://orion.marvcore.com VITE_IDENTITY_URL=https://orion.marvcore.com
```

### Run in Production

```bash
docker pull laksanadika/orion-client:latest
docker run -d -p 80:80 --name orion-client laksanadika/orion-client:latest
```

## 📝 Configuration

Aplikasi menggunakan **runtime configuration** yang bisa diubah tanpa rebuild:

1. **Build time**: Set via `--build-arg` saat Docker build
2. **Runtime**: Edit file `config.js` di container
3. **Fallback**: Menggunakan `window.location.origin` jika tidak ada config

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

## 🛠️ Available Commands

```bash
make help              # Lihat semua commands
make dev              # Run development server
make build            # Build production
make docker-build     # Build Docker image
make docker-push      # Push ke Docker Hub
make docker-deploy    # Build + Push
```

## 📦 Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Hook Form + Zod
- Zustand
- Recharts

## 🔗 Related

- Backend API: [orion-server](https://github.com/laksanagusta/orion-server)
- Identity Service: [identity-service](https://github.com/laksanagusta/identity-service)
