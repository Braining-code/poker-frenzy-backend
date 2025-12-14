# 🎮 POKER FRENZY

Sistema completo de tracking de sesiones de poker con autenticación JWT, dashboard protegido y gamificación.

---

## 📊 ESTADO ACTUAL DEL PROYECTO

**Versión:** 1.0 (Fase 1 completada)  
**Última actualización:** 14 Diciembre 2025

### ✅ Completado:
- Sistema de autenticación JWT + Magic Link
- Dashboard protegido con validación de tokens
- Email verification con Brevo
- DNS configurado (app.frenzy.poker)
- Backend en Railway + PostgreSQL

### ⏳ En Progreso:
- Fase 2: Sistema de sesiones con API

### 🔮 Planificado:
- Fase 3: Juegos modulares (Poker Rain)
- Fase 4: Sistema de gamificación completo
- Fase 5: Seguridad y producción

---

## 🏗️ ARQUITECTURA

### Stack Tecnológico:
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Railway)
- **Autenticación:** JWT (access + refresh tokens)
- **Email:** Brevo API
- **Hosting:** Railway
- **Frontend:** HTML + Tailwind CSS + React (CDN)

### Dominios:
| Dominio | Función | Estado |
|---------|---------|--------|
| `pokerfrenzy.club` | Landing page (WordPress) | ✅ Activo |
| `pokerfrenzy.club/registro-app` | Registro/Login | ✅ Activo |
| `app.frenzy.poker` | Dashboard protegido | ✅ Activo |
| `web-production-e4083.up.railway.app` | Backend API | ✅ Activo |

---

## 📂 ESTRUCTURA DEL PROYECTO
```
poker-frenzy-backend/
├── src/
│   ├── config/
│   │   └── database.js              # Configuración PostgreSQL
│   ├── middleware/
│   │   ├── auth.js                  # Middleware JWT
│   │   └── errorHandler.js          # Error handling
│   ├── routes/
│   │   ├── auth.js                  # Endpoints autenticación
│   │   └── sesiones.js              # Endpoints sesiones (Fase 2)
│   ├── services/
│   │   ├── cryptoService.js         # Bcrypt password hashing
│   │   ├── jwtService.js            # JWT generation/validation
│   │   └── emailService.js          # Brevo email service
│   ├── utils/
│   │   └── constants.js             # Constantes del proyecto
│   ├── index.js                     # Entry point
│   └── server.js                    # Express app
├── app/
│   ├── dashboard-v2.html            # Dashboard principal
│   ├── my-stats.html                # Sistema de sesiones (Fase 2)
│   └── games/                       # Juegos modulares (Fase 3+)
│       └── poker-rain/
├── migrations/                       # Migraciones DB (futuro)
├── .env                             # Variables de entorno
├── .gitignore
├── package.json
├── crear-tabla-sesiones.js          # Script setup DB
└── README.md
```

---

## 🗄️ BASE DE DATOS

### Tablas Actuales:

#### `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6),
  verification_code_expires TIMESTAMP,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultimo_login TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `sesiones` (Fase 2)
```sql
CREATE TABLE sesiones (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  plataforma VARCHAR(50) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('cash', 'sng', 'tournament')) NOT NULL,
  buy_in DECIMAL(10,2) NOT NULL,
  cash_out DECIMAL(10,2),
  prize DECIMAL(10,2),
  duracion DECIMAL(4,2),
  modalidad VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 INSTALACIÓN Y SETUP

### 1️⃣ Requisitos Previos:
- Node.js v18+
- PostgreSQL (Railway)
- Cuenta Brevo (emails)
- GitHub account

### 2️⃣ Clonar Repositorio:
```bash
git clone https://github.com/tu-usuario/poker-frenzy-backend.git
cd poker-frenzy-backend
```

### 3️⃣ Instalar Dependencias:
```bash
npm install
```

### 4️⃣ Configurar Variables de Entorno:

Crear archivo `.env` en la raíz:
```env
# Database
DATABASE_URL=postgresql://usuario:password@host:port/database

# JWT
JWT_SECRET=tu_secret_super_seguro_aqui
JWT_REFRESH_SECRET=otro_secret_diferente_aqui
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Email (Brevo)
BREVO_API_KEY=tu_api_key_de_brevo
BREVO_SENDER_EMAIL=noreply@pokerfrenzy.club
BREVO_SENDER_NAME=Poker Frenzy

# URLs
PRODUCTION_LANDING_URL=https://pokerfrenzy.club
PRODUCTION_APP_URL=https://app.frenzy.poker
BACKEND_URL=https://web-production-e4083.up.railway.app

# Server
PORT=8080
NODE_ENV=production
```

### 5️⃣ Crear Tabla Users (si no existe):

En Railway PostgreSQL Query ejecutar:
```sql
-- Ver estructura en sección "Base de Datos" arriba
```

### 6️⃣ Ejecutar Localmente:
```bash
npm start
```

Servidor corriendo en: `http://localhost:8080`

---

## 🔧 ENDPOINTS API

### Autenticación (`/api/auth`)

#### POST `/api/auth/register`
Registrar nuevo usuario.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "username": "jugador123",
  "password": "contraseña_segura"
}
```

**Response:**
```json
{
  "message": "Usuario registrado. Verifica tu email.",
  "userId": 1
}
```

---

#### POST `/api/auth/login`
Login de usuario existente.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "jugador123"
  }
}
```

---

#### GET `/api/auth/verify-email-link?code=123456&email=usuario@ejemplo.com`
Verificar email via Magic Link.

**Response:** Redirect a `app.frenzy.poker#token=XXX&refresh=YYY`

---

#### GET `/api/auth/me`
Obtener datos del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "jugador123",
    "email_verified": true
  }
}
```

---

#### POST `/api/auth/refresh`
Renovar access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "token": "nuevo_token_aqui"
}
```

---

### Sesiones (`/api/sesiones`) - FASE 2

#### GET `/api/sesiones/user/:userId`
Obtener todas las sesiones del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "sesiones": [
    {
      "id": 1,
      "user_id": 1,
      "fecha": "2025-12-14",
      "plataforma": "PokerStars",
      "tipo": "cash",
      "buy_in": 100.00,
      "cash_out": 250.00,
      "duracion": 2.5,
      "modalidad": "NLHE 1/2",
      "created_at": "2025-12-14T10:00:00Z"
    }
  ]
}
```

---

#### POST `/api/sesiones`
Crear nueva sesión.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "fecha": "2025-12-14",
  "plataforma": "PokerStars",
  "tipo": "cash",
  "buy_in": 100.00,
  "cash_out": 250.00,
  "duracion": 2.5,
  "modalidad": "NLHE 1/2"
}
```

**Response:**
```json
{
  "message": "Sesión creada exitosamente",
  "sesion": { ... }
}
```

---

#### PUT `/api/sesiones/:id`
Actualizar sesión existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "cash_out": 300.00,
  "duracion": 3.0
}
```

---

#### DELETE `/api/sesiones/:id`
Eliminar sesión.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Sesión eliminada exitosamente"
}
```

---

#### GET `/api/sesiones/stats/:userId`
Obtener estadísticas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "profit": 1250.50,
    "dias": 12,
    "winrate": 65,
    "sessions": 24
  },
  "profitPorSala": [
    { "sala": "PokerStars", "profit": 800.00, "sesiones": 15 },
    { "sala": "GGPoker", "profit": 450.50, "sesiones": 9 }
  ],
  "evolucion": [
    { "fecha": "2025-12-01", "profit_acumulado": 100 },
    { "fecha": "2025-12-02", "profit_acumulado": 250 }
  ]
}
```

---

## 🔐 SEGURIDAD

### Implementado:
- ✅ Bcrypt para hashing de passwords (cost 10)
- ✅ JWT con tokens de acceso (24h) y refresh (7d)
- ✅ HTTPS obligatorio en producción
- ✅ CORS restrictivo
- ✅ Helmet.js (CSP headers)
- ✅ Validación de datos en endpoints
- ✅ SQL injection protection (pg parameterized queries)

### Pendiente (Fase 5):
- Rate limiting
- Cloudflare integration
- Security headers adicionales
- Monitoring y alertas
- Backup automático PostgreSQL

---

## 🧪 TESTING

### Flujo de Registro Completo:
1. Ir a `https://pokerfrenzy.club/registro-app`
2. Completar formulario
3. Recibir email de Brevo
4. Click en Magic Link
5. Redirect automático a `app.frenzy.poker`
6. Dashboard carga con username

### Flujo de Login:
1. Ir a `https://pokerfrenzy.club/registro-app`
2. Click "YA TENGO CUENTA"
3. Ingresar email + password
4. Redirect a dashboard

### Test API Local:
```bash
# Registro
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"Test123!"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Get User (reemplazar TOKEN)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 📝 ROADMAP

### ✅ Fase 1 - Infraestructura Base (COMPLETADA)
- [x] Sistema de autenticación completo
- [x] Dashboard protegido
- [x] DNS y dominios configurados
- [x] Email verification
- [x] Deploy en Railway

**Duración:** 1 semana  
**Completado:** 11 Diciembre 2025

---

### ⏳ Fase 2 - Sistema de Sesiones (EN PROGRESO)
- [ ] Tabla `sesiones` en PostgreSQL
- [ ] API endpoints CRUD
- [ ] Componente My Stats (React)
- [ ] Migración localStorage → API
- [ ] Stats en tiempo real
- [ ] Gráficos de evolución

**Duración estimada:** 1-2 días  
**Inicio:** 14 Diciembre 2025

---

### 📝 Fase 3 - Juegos Modulares
- [ ] Build standalone Poker Rain
- [ ] Integración en dashboard
- [ ] Tabla `game_scores`
- [ ] Leaderboard por juego
- [ ] Sistema modular para agregar juegos

**Duración estimada:** 1-2 días

---

### 🏆 Fase 4 - Gamificación Completa
- [ ] Tabla `gamification`
- [ ] Tabla `achievements`
- [ ] Sistema de puntos unificado
- [ ] Niveles y progresión
- [ ] Badges automáticos
- [ ] Ranking global
- [ ] Sistema de ligas
- [ ] Notificaciones de logros

**Duración estimada:** 1-2 semanas

---

### 🛡️ Fase 5 - Seguridad y Producción
- [ ] Cloudflare setup
- [ ] Rate limiting
- [ ] Security headers completos
- [ ] Monitoring (Sentry/LogRocket)
- [ ] Backups automáticos
- [ ] Sistema de migraciones profesional
- [ ] Tests automatizados
- [ ] CI/CD pipeline

**Duración estimada:** 1 semana

---

## 🤝 CONTRIBUIR

### Setup para Desarrollo:

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-feature`
3. Commit cambios: `git commit -m 'Add nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Crear Pull Request

### Estándares de Código:
- ESLint configurado
- Prettier para formato
- Commits descriptivos
- Code review obligatorio

---

## 📞 SOPORTE Y CONTACTO

- **Issues:** GitHub Issues
- **Email:** soporte@pokerfrenzy.club
- **Documentación:** Este README

---

## 📄 LICENCIA

Proprietary - Todos los derechos reservados © 2025 Poker Frenzy

---

## 🙏 AGRADECIMIENTOS

- Railway por hosting
- Brevo por email service
- Anthropic Claude por asistencia en desarrollo

---

## 📚 RECURSOS ADICIONALES

### Documentación Técnica:
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Railway Docs](https://docs.railway.app/)

### Prompt Sistema Modular:
Ver documento `SISTEMA_MODULAR.md` para arquitectura de juegos/features.

---

**Última actualización:** 14 Diciembre 2025  
**Versión README:** 1.0
