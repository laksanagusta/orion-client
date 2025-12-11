# 🔧 Cara Mengatasi Environment Variables di Production

## 🎯 Solusi yang Diterapkan: Runtime Configuration

Aplikasi ini menggunakan **runtime configuration** yang memungkinkan perubahan URL API tanpa rebuild image Docker.

### Cara Kerja:

1. **Build Time**: Env vars di-embed ke dalam `config.js` saat build Docker image
2. **Runtime**: File `config.js` bisa di-edit langsung di container untuk mengubah URL
3. **Fallback**: Jika config kosong, akan menggunakan `window.location.origin`

## 📦 Build Docker Image

### Opsi 1: Dengan Makefile (Recommended)

```bash
# Build dengan URL production
make docker-build VITE_API_URL=https://orion.marvcore.com VITE_IDENTITY_URL=https://orion.marvcore.com

# Push ke Docker Hub
make docker-push

# Atau langsung deploy (build + push)
make docker-deploy VITE_API_URL=https://orion.marvcore.com VITE_IDENTITY_URL=https://orion.marvcore.com
```

### Opsi 2: Docker CLI Langsung

```bash
docker build --platform linux/amd64 \
  --build-arg VITE_API_URL=https://orion.marvcore.com \
  --build-arg VITE_IDENTITY_URL=https://orion.marvcore.com \
  -t laksanadika/orion-client:latest .
```

## 🚀 Deploy dan Konfigurasi

### Di Server Cloud:

```bash
# Pull image
docker pull laksanadika/orion-client:latest

# Run container
docker run -d -p 80:80 --name orion-client laksanadika/orion-client:latest
```

### Jika Perlu Ubah URL TANPA Rebuild:

```bash
# Masuk ke container
docker exec -it orion-client sh

# Edit config.js
vi /usr/share/nginx/html/config.js

# Edit menjadi:
window.APP_CONFIG = {
  API_URL: 'https://api-baru.example.com',
  IDENTITY_URL: 'https://identity-baru.example.com',
};

# Keluar (wq)
# Refresh browser, config langsung berubah!
```

**ATAU** bisa juga dengan environment variables saat run:

```bash
docker run -d -p 80:80 \
  -e VITE_API_URL=https://orion.marvcore.com \
  -e VITE_IDENTITY_URL=https://orion.marvcore.com \
  --name orion-client \
  laksanadika/orion-client:latest
```

## 🔍 Troubleshooting

### Problem: URL masih `undefined`

**Cek 1**: Lihat isi `config.js` di browser
```javascript
console.log(window.APP_CONFIG);
```

**Cek 2**: Pastikan build args sudah benar
```bash
# Rebuild dengan explicit env vars
make docker-build VITE_API_URL=https://orion.marvcore.com VITE_IDENTITY_URL=https://orion.marvcore.com
```

**Cek 3**: Lihat isi config.js di container
```bash
docker exec orion-client cat /usr/share/nginx/html/config.js
```

### Problem: Config tidak berubah setelah edit

**Solusi**: Clear browser cache atau hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

## 📋 Priority Order

Aplikasi akan menggunakan URL dengan urutan prioritas:

1. **`window.APP_CONFIG`** (dari `config.js` - bisa diubah runtime)
2. **`import.meta.env.VITE_*`** (dari build-time env vars)
3. **`window.location.origin`** (fallback - same domain)

## ✅ Best Practice

### Development:
```env
# .env file
PORT=3001
VITE_API_URL=http://localhost:8080
VITE_IDENTITY_URL=http://localhost:8080
```

### Production (same domain):
```bash
# Kosongkan atau gunakan domain yang sama
make docker-build VITE_API_URL=https://orion.marvcore.com VITE_IDENTITY_URL=https://orion.marvcore.com
```

### Production (different domains):
```bash
# Set explicit URLs
make docker-build \
  VITE_API_URL=https://api.example.com \
  VITE_IDENTITY_URL=https://identity.example.com
```

## 🔄 Update Production

```bash
# 1. Rebuild image dengan config baru
make docker-deploy VITE_API_URL=https://orion.marvcore.com VITE_IDENTITY_URL=https://orion.marvcore.com

# 2. Di server, stop container lama
docker stop orion-client
docker rm orion-client

# 3. Pull image baru
docker pull laksanadika/orion-client:latest

# 4. Run container baru
docker run -d -p 80:80 --name orion-client laksanadika/orion-client:latest
```

## 📝 Files yang Penting

- **`public/config.js`**: Template config (akan ter-copy ke dist)
- **`src/lib/config.ts`**: Helper functions untuk baca config
- **`generate-config.sh`**: Script untuk generate config.js saat Docker build
- **`Dockerfile`**: Setup ARG dan ENV variables
- **`Makefile`**: Shortcut commands dengan default values
