# POKER FRENZY - PROJECT DOCUMENTATION
**Última actualización:** 8 Dic 2025 - Chat 2 completo
**Status:** 75% - Registro + Email funcionando, falta verificación

---

## 🎯 ESTADO ACTUAL (RESUMEN EJECUTIVO)

### ✅ LO QUE FUNCIONA PERFECTAMENTE

**1. Backend - Registro de Usuarios**
- ✅ `/api/auth/register` recibe datos sin errores
- ✅ Crea usuario en PostgreSQL correctamente
- ✅ Guarda: email, username, password_hash
- ✅ Genera token de verificación de 6 dígitos
- ✅ Marca `email_verified = false` (esperado)
- ✅ Logs limpios en Railway

**2. Email - Brevo funcionando**
- ✅ Recibe template HTML
- ✅ Renderiza hermoso (marca Poker Frenzy visible)
- ✅ Llega al inbox sin spam
- ✅ Link de verificación presente
- ✅ Plan Marketing pagado ($18/mes)
- ✅ Sender configurado en Brevo

**3. Frontend - Bloque DIVI**
- ✅ Paso 1: Registro funciona
- ✅ Valida passwords (coinciden, 8+ chars)
- ✅ Paso 2: Muestra "revisá tu email"
- ✅ Diseño glassmorphism perfecto
- ✅ Inputs con autofill correcto
- ✅ Contraste y tipografía OK
- ✅ Campo username corregido (name="username")

**4. Infraestructura**
- ✅ Railway: backend online, port 8080
- ✅ PostgreSQL: tabla users creada con triggers
- ✅ GitHub: connected para auto-deploy
- ✅ Brevo: configurado y pagado

---

## ❌ LO QUE FALTA (BLOCKER CRÍTICO)

### El Problema: Email Link Sin Puerta

Cuando usuario recibe el email y hace clic en:
```
https://pokerfrenzy.club/?token=xxxx
```

**NO PASA NADA** porque:

1. ❌ No existe endpoint backend que procese el token
2. ❌ No existe página HTML que reciba el token
3. ❌ No existe validación del token en BD
4. ❌ El usuario NUNCA puede marcar `email_verified = true`

**Resultado:** Usuario está registrado pero NO verificado → No puede hacer login

---

## 🔧 TAREAS PARA COMPLETAR (ORDEN PRIORITARIO)

### PRIORITY 1 - CRITICAL (Hoy - 2-3 horas)

#### Tarea 1.1: Crear endpoint backend `/api/auth/verify-token`
**Ubicación:** `src/routes/auth.js`

**Debe hacer:**
```javascript
POST /api/auth/verify-token
- Recibe: { email, token }
- Busca usuario en DB
- Valida token vs verification_code
- Valida que no esté expirado (verification_code_expires)
- Si OK:
  * Marca email_verified = true
  * Borra verification_code
  * Retorna { success: true, message: "Email verificado" }
- Si error:
  * Retorna { error: "Token inválido o expirado" }
```

**Código de ejemplo:**
```javascript
router.post('/verify-token', async (req, res) => {
  const { email, token } = req.body;
  
  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (!user.rows[0]) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    const userRow = user.rows[0];
    
    // Validar token y expiración
    if (userRow.verification_code !== token) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    
    if (new Date() > userRow.verification_code_expires) {
      return res.status(400).json({ error: 'Token expirado' });
    }
    
    // Marcar como verificado
    await pool.query(
      'UPDATE users SET email_verified = true, verification_code = NULL WHERE email = $1',
      [email]
    );
    
    res.json({ success: true, message: 'Email verificado correctamente' });
    
  } catch (err) {
    res.status(500).json({ error: 'Error verificando email' });
  }
});
```

---

#### Tarea 1.2: Crear página `/activar` en WordPress
**Ubicación:** Nueva página en pokerfrenzy.club

**Contenido HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Activar Cuenta - Poker Frenzy</title>
  <style>
    body { background: #000; color: #fff; font-family: Inter, sans-serif; }
    .container { max-width: 500px; margin: 100px auto; text-align: center; }
    h1 { color: #a855f7; font-size: 2rem; }
    .spinner { animation: spin 1s linear infinite; display: inline-block; }
    .success { color: #10b981; }
    .error { color: #f87171; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Activando tu cuenta...</h1>
    <div class="spinner">⚙️</div>
    <p id="mensaje">Por favor espera...</p>
  </div>
  
  <script>
    const API_URL = 'https://web-production-e4083.up.railway.app';
    
    // Obtener token de URL: ?token=xxxx&email=yyyy
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    if (!token || !email) {
      document.getElementById('mensaje').textContent = '❌ Token o email faltante';
      document.getElementById('mensaje').className = 'error';
    } else {
      // Llamar endpoint
      fetch(`${API_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('mensaje').textContent = '✅ ¡Cuenta activada! Redirigiendo...';
          document.getElementById('mensaje').className = 'success';
          setTimeout(() => {
            window.location.href = 'https://pokerfrenzy.club/ingresar';
          }, 2000);
        } else {
          document.getElementById('mensaje').textContent = `❌ ${data.error}`;
          document.getElementById('mensaje').className = 'error';
        }
      })
      .catch(err => {
        document.getElementById('mensaje').textContent = '❌ Error al activar';
        document.getElementById('mensaje').className = 'error';
      });
    }
  </script>
</body>
</html>
```

---

#### Tarea 1.3: Actualizar link en Brevo
**Ubicación:** Brevo → Email Templates

**Link ACTUAL en email:**
```
https://pokerfrenzy.club/?token=VERIFICATION_CODE
```

**Cambiar a:**
```
https://pokerfrenzy.club/activar?token={{VERIFICATION_CODE}}&email={{EMAIL}}
```

Brevo interpolará automáticamente `VERIFICATION_CODE` y `EMAIL` desde la BD.

---

#### Tarea 1.4: Actualizar codigo backend - Envío de email
**Ubicación:** `src/routes/auth.js` - función register

**Cambiar:**
```javascript
// ANTES (incompleto)
const verificationLink = `https://pokerfrenzy.club/?token=${verificationCode}`;

// DESPUÉS (correcto)
const verificationLink = `https://pokerfrenzy.club/activar?token=${verificationCode}&email=${email}`;
```

O mejor, si usas template variables en Brevo:
```javascript
// En Brevo, usar: {{VERIFICATION_CODE}} y {{EMAIL}} automáticamente
```

---

### PRIORITY 2 - HIGH (Después de Priority 1)

#### Tarea 2.1: Crear endpoints de usuario
**Ubicación:** Crear `src/routes/user.js`

```javascript
// GET /api/user/me
- Recibe: Authorization header con JWT
- Valida token
- Retorna: { id, email, username, avatar_url, email_verified, created_at }

// POST /api/sesiones
- Recibe: { fecha, plataforma, tipo, horas, buy_in, cash_out, stakes, notes }
- Valida JWT
- Inserta en tabla sesiones
- Retorna: { success, sesionId }

// GET /api/sesiones
- Recibe: JWT
- Retorna: [ { id, fecha, plataforma, profit, ... } ]
```

---

#### Tarea 2.2: Crear tabla `sesiones` en PostgreSQL
```sql
CREATE TABLE IF NOT EXISTS sesiones (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  fecha TIMESTAMP NOT NULL,
  plataforma VARCHAR(50),
  tipo VARCHAR(50),
  horas DECIMAL(3,1),
  buy_in DECIMAL(10,2),
  cash_out DECIMAL(10,2),
  stakes VARCHAR(20),
  notas TEXT,
  profit DECIMAL(10,2) GENERATED ALWAYS AS (cash_out - buy_in) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### Tarea 2.3: Desplegar dashboard en Vercel
- Crear repo `poker-frenzy-app` en GitHub
- Subir `app-completa.html` (o refactorizar a Next.js)
- Conectar dominio `app.pokerfrenzy.com`
- Integrar token JWT desde localStorage

---

### PRIORITY 3 - MEDIUM (Día 3-4)

#### Tarea 3.1: Integrar Poker Rain game
- Agregar como iframe en dashboard
- O como componente React embebido
- Conectar scoring con BD

#### Tarea 3.2: Sistema de Leaderboards
- Tabla `rankings` en BD
- Algoritmo de puntos (profit, ROI, winrate)
- Endpoint `GET /api/rankings`

#### Tarea 3.3: Brevo Marketing Automation
- Crear campañas de bienvenida
- Recordatorios de sesión
- Newsletter semanal

---

## 📋 ARCHIVOS GENERADOS/DISPONIBLES

| Archivo | Status | Ubicación |
|---------|--------|-----------|
| `BLOQUE-DIVI-AUTH-FIXED.php` | ✅ Listo | outputs/ |
| `POKER-FRENZY-PROJECT-STATUS.md` | ✅ Listo | outputs/ |
| `schema.sql` | ✅ Ejecutado | GitHub/database/ |
| `src/routes/auth.js` | ✅ Funcional | GitHub backend |
| `/activar` página | ❌ Falta crear | pokerfrenzy.club |
| `/api/auth/verify-token` | ❌ Falta crear | backend |
| Endpoints sesiones | ❌ Falta crear | backend |

---

## 🔗 URLS Y CREDENCIALES

| Recurso | URL | Status |
|---------|-----|--------|
| Landing | https://pokerfrenzy.club | ✅ |
| Registro | https://pokerfrenzy.club/ingresar | ✅ |
| Activar | https://pokerfrenzy.club/activar | ❌ Crear |
| Dashboard | (sin deploy) | ❌ Crear |
| Backend API | https://web-production-e4083.up.railway.app | ✅ |
| GitHub | github.com/Braining-code/poker-frenzy-backend | ✅ |

---

## 🚀 FLUJO COMPLETO (ACTUAL VS ESPERADO)

### ACTUAL (funciona hasta aquí ✅):
```
1. Usuario rellena formulario registro
2. Frontend valida y envía a /api/auth/register
3. Backend crea usuario en PostgreSQL
4. Backend envía email via Brevo
5. Usuario recibe email con link ✅
6. Usuario hace click en link... 
7. ❌ SE CORTA AQUÍ - no hay página /activar
```

### ESPERADO (después de hacer tareas Priority 1):
```
1-6. (igual a actual)
7. Usuario llega a /activar
8. Página llama /api/auth/verify-token
9. Backend marca email_verified = true
10. Backend retorna success
11. Página redirige a /ingresar
12. Usuario puede hacer login ✅
13. Recibe JWT token
14. Accede al dashboard ✅
```

---

## 💾 COMANDOS ÚTILES

**Para desplegar cambios en Railway:**
```bash
git add .
git commit -m "Add verify-token endpoint"
git push origin main
# Railway auto-redeploya
```

**Para testear endpoints con curl:**
```bash
# Registro
curl -X POST https://web-production-e4083.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'

# Verificar token
curl -X POST https://web-production-e4083.up.railway.app/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","token":"123456"}'
```

---

## 📊 CHECKLIST PARA PRÓXIMO CHAT

- [ ] Crear endpoint `/api/auth/verify-token` en backend
- [ ] Crear página `/activar` en WordPress
- [ ] Actualizar link en template Brevo
- [ ] Testear flujo completo: registro → email → click → verificación
- [ ] Crear tabla `sesiones` en PostgreSQL
- [ ] Crear endpoints `/api/sesiones` en backend
- [ ] Desplegar dashboard en Vercel
- [ ] Integrar Poker Rain game

---

## 🎯 META PARA PRÓXIMA SEMANA

- ✅ **Hoy:** Completar verificación de email (Priority 1)
- ✅ **Mañana:** Endpoints de sesiones + dashboard (Priority 2)
- ✅ **Pasado:** Brevo marketing + Poker Rain (Priority 3)
- ✅ **Fin de semana:** Testing y optimizaciones

---

**Documento actualizado:** 8 Dic 2025 - 23:00 (Buenos Aires)
**Próxima revisión:** Después de completar Priority 1
