# Deployment Guide - Orion Client

## Masalah yang Diperbaiki

Sebelumnya, `reportService` membuat instance `ApiClient` baru dengan hardcoded `import.meta.env.VITE_API_URL`, yang menyebabkan URL masih mengarah ke `localhost:8080` di production.

Sekarang `reportService` menggunakan shared `apiClient` instance yang sama dengan service lain, yang mendukung runtime configuration melalui:
1. `window.APP_CONFIG` (runtime config dari `config.js`)
2. `import.meta.env` (build-time env vars)
3. `window.location.origin` (fallback)

## Cara Deploy ke Production

### 1. Build Docker Image dengan API URL yang Benar

```bash
make docker-deploy \
  VITE_API_URL=https://apiorion.marvcore.com \
  VITE_IDENTITY_URL=https://apiorion.marvcore.com
```

### 2. Atau Build dan Push Secara Terpisah

**Build:**
```bash
make docker-build \
  VITE_API_URL=https://apiorion.marvcore.com \
  VITE_IDENTITY_URL=https://apiorion.marvcore.com
```

**Push:**
```bash
make docker-push
```

### 3. Deploy di Cloud Server

```bash
docker pull laksanadika/orion-client:latest
docker run -d -p 80:80 --name orion-client laksanadika/orion-client:latest
```

## Verifikasi

Setelah deploy, semua API calls (termasuk report) seharusnya mengarah ke `https://apiorion.marvcore.com`:

- Dashboard API: ✅ `https://apiorion.marvcore.com/api/v1/dashboard/stats`
- Report API: ✅ `https://apiorion.marvcore.com/api/v1/reports/manager`
- Certificate API: ✅ `https://apiorion.marvcore.com/api/v1/certificates`
- Identity API: ✅ `https://apiorion.marvcore.com/api/v1/users/whoami`

## Troubleshooting

Jika masih mengarah ke localhost:8080, pastikan:

1. **Docker image di-rebuild** dengan environment variables yang benar
2. **Container di-restart** dengan image yang baru
3. **Browser cache di-clear** (Ctrl+Shift+R atau Cmd+Shift+R)

### Cek Environment Variables di Container

```bash
# Login ke container
docker exec -it orion-client sh

# Cek config.js
cat /usr/share/nginx/html/config.js
```

Output seharusnya:
```javascript
window.APP_CONFIG = {
  API_URL: 'https://apiorion.marvcore.com',
  IDENTITY_URL: 'https://apiorion.marvcore.com'
};
```
