# 🎰 Poker Frenzy - Backend (Sprint 1)

Backend para la plataforma Poker Frenzy - Plataforma de torneos de poker con premios reales.

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 🚀 Setup Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear Base de Datos

**Opción A: Usando psql (recomendado)**

```bash
# Crear BD
psql -U postgres -c "CREATE DATABASE poker_frenzy_db;"

# Cargar schema
psql -U postgres -d poker_frenzy_db -f database/schema.sql
```

**Opción B: Manualmente**

```bash
psql -U postgres

# En psql:
CREATE DATABASE poker_frenzy_db;
\c poker_frenzy_db
\i database/schema.sql
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

**Editar `.env`:**

```env
# DATABASE (importante: cambiar user/password)
DATABASE_URL=postgresql://user:password@localhost:5432/poker_frenzy_db

# JWT (cambiar en producción)
JWT_SECRET=tu_super_secret_key_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_aqui

# BREVO (ya incluida, no cambiar)
BREVO_API_KEY=xkeysib-42d745c47644e5cbf2234df73399d579ff324677b546ae4f7680a41d54085e04

# SERVER
PORT=3000
NODE_ENV=development
```

### 4. Correr Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará en: **http://localhost:3000**

## 📡 API Endpoints (Sprint 1)

### Auth

#### 1. Registrar Usuario
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "juanperez",
  "password": "SuperSegura123!",
  "agreeTerms": true
}

Response:
{
  "success": true,
  "message": "Registro exitoso. Revisa tu email para verificar",
  "userId": 1,
  "email": "user@example.com"
}
```

#### 2. Verificar Email
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

#### 3. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SuperSegura123!"
}

Response:
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "juanperez"
  }
}
```

#### 4. Renovar Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "message": "Token renovado",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Health Check

```bash
GET /api/health

Response:
{
  "status": "OK",
  "timestamp": "2024-01-23T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🔐 JWT Token Structure

```json
{
  "userId": 1,
  "email": "user@example.com",
  "username": "juanperez",
  "iat": 1672531200,
  "exp": 1672617600
}
```

**Usar en requests:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📂 Estructura de Carpetas

```
poker-frenzy-backend/
├── src/
│   ├── config/              # Configuración
│   │   ├── env.js          # Variables de entorno
│   │   └── database.js     # Pool PostgreSQL
│   ├── routes/             # Rutas API
│   │   └── auth.js
│   ├── controllers/        # Lógica de negocio
│   │   └── authController.js
│   ├── middleware/         # Middleware
│   │   ├── auth.js         # JWT verificación
│   │   └── errorHandler.js # Manejo de errores
│   ├── services/           # Servicios
│   │   ├── emailService.js   # Brevo
│   │   ├── jwtService.js     # Tokens JWT
│   │   └── cryptoService.js  # Bcrypt
│   ├── utils/              # Utilidades
│   │   └── constants.js
│   ├── index.js            # Entry point
│   └── server.js           # Express setup
├── database/
│   └── schema.sql          # Schema PostgreSQL
├── .env.example            # Variables de ejemplo
├── .gitignore
├── Procfile                # Para Railway
├── package.json
└── README.md
```

## 🧪 Testing

### Con curl

```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "agreeTerms": true
  }'

# Verify email (usar código del email enviado)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Con Postman

1. Importar colección (futura)
2. Variables de entorno:
   - `{{api_url}}` = http://localhost:3000
   - `{{token}}` = [token del login]

## 🌍 Deployment (Railway)

### 1. Crear proyecto en Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link proyecto
railway link

# Deploy
railway up
```

### 2. Variables de entorno en Railway

```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
BREVO_API_KEY=xkeysib-...
NODE_ENV=production
```

### 3. Conectar dominio

En Railway → Settings → Domain:
```
api.pokerfrenzy.com
```

## 🔗 Próxima Integración

**Frontend (Landing & App):**
- `REACT_APP_API_URL=http://localhost:3000` (desarrollo)
- `REACT_APP_API_URL=https://api.pokerfrenzy.com` (producción)

## 📚 Próximos Sprints

- Sprint 2: CRUD Sesiones
- Sprint 3: Rankings
- Sprint 4: Créditos/Puntos
- Sprint 5: Integración Frontend
- Sprint 6: Poker Rain
- Sprint 7: Landing
- Sprint 8: Deployment completo

## 🐛 Troubleshooting

### Error: ECONNREFUSED (PostgreSQL no conecta)

```bash
# Verificar que PostgreSQL está corriendo
psql -U postgres -c "SELECT 1"

# Cambiar DATABASE_URL en .env con tus credenciales
```

### Error: ENOTFOUND api.brevo.com

```bash
# Verificar conexión a internet
# Verificar API key en .env
```

### Puerto 3000 ya en uso

```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso que usa puerto 3000
lsof -ti:3000 | xargs kill -9
```

## 📞 Soporte

- **Documentación Brevo:** https://developers.brevo.com/docs/getting-started
- **Documentación PostgreSQL:** https://www.postgresql.org/docs/
- **Documentación Express:** https://expressjs.com/
- **JWT.io:** https://jwt.io/

## 📄 Licencia

MIT

---

**Creado:** Enero 2024  
**Versión:** 1.0.0  
**Status:** ✅ Sprint 1 - Auth Completo
