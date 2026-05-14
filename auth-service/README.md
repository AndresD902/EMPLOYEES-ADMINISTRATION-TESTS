# 🔐 Auth Service - Pruebas Funcionales (Integración)

Conjunto completo de pruebas funcionales/integración para validar el Auth Service.

## 📋 Pruebas Implementadas

### 1. Health Check
**Archivo**: `health/health.spec.ts`
- **Endpoint**: `GET /health`
- **Objetivo**: Verificar que el servicio está activo
- **Validaciones**: 
  - ✅ Status 200
  - ✅ Response contiene `{ status: 'ok' }`

### 2. Login Exitoso
**Archivo**: `login/login.spec.ts`
- **Endpoint**: `POST /auth/login`
- **Credenciales**: admin@example.com / Admin123*
- **Objetivo**: Validar login con credenciales correctas
- **Validaciones**:
  - ✅ Status 200
  - ✅ Response contiene `accessToken`
  - ✅ Token es un JWT válido

### 3. Login Inválido
**Archivo**: `login-invalid/login-invalid.spec.ts`
- **Endpoint**: `POST /auth/login`
- **Objetivo**: Validar rechazo de credenciales incorrectas
- **Validaciones**:
  - ✅ Status 401 (Unauthorized)
  - ✅ Mensaje de error claro

### 4. Registro de Usuario
**Archivo**: `register/register.spec.ts`
- **Endpoint**: `POST /auth/register`
- **Objetivo**: Validar registro de nuevo usuario
- **Validaciones**:
  - ✅ Status 201 (Created)
  - ✅ Usuario creado con rol HR (no CONSULTATION por dependencia de employee-service)
  - ✅ Email verificado automáticamente

### 5. Ruta Protegida (Con Token)
**Archivo**: `protected-me-valid-token/protected-me.spec.ts`
- **Endpoint**: `GET /protected/me`
- **Objetivo**: Validar acceso con JWT válido
- **Validaciones**:
  - ✅ Status 200
  - ✅ Response contiene datos del usuario autenticado

### 6. Ruta Protegida (Sin Token)
**Archivo**: `protected-me-without-token/protected-me-without.spec.ts`
- **Endpoint**: `GET /protected/me`
- **Objetivo**: Validar rechazo sin autenticación
- **Validaciones**:
  - ✅ Status 401 (Unauthorized)

### 7. Admin Only (Autorización)
**Archivo**: `admin-only/admin-only.spec.ts`
- **Endpoint**: `GET /protected/admin-only`
- **Objetivo**: Validar que solo ADMIN accede
- **Validaciones**:
  - ✅ Admin (200)
  - ✅ No-admin (403 Forbidden)

---

## 🚀 Ejecución

### Ejecutar todas las pruebas funcionales
```bash
npm test
```

### Ejecutar en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ver reportes HTML
```bash
npm run report
```

---

## 📊 Resultados Esperados

Todas las 7 pruebas deben **PASAR** ✅:

```
Running 7 tests using 4 workers

✓ admin-only
✓ health
✓ login
✓ login-invalid
✓ protected-me (con token)
✓ protected-me (sin token)
✓ register

7 passed (3.0s)
```

---

## 🔧 Configuración

- **Timeout**: 30 segundos por test
- **Workers**: 4 (ejecución paralela)
- **Reintentos**: 0 (sin reintentos)
- **Base URL**: `http://localhost:3001/api/v1` (desde `.env`)

---

## 👤 Credenciales de Prueba

Las credenciales están en el archivo `.env` (en carpeta padre):

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123*

HR_EMAIL=hr@example.com
HR_PASSWORD=HRPass123*
```

---

## 📁 Estructura

```
auth-service/
├── health/
│   └── health.spec.ts
├── login/
│   └── login.spec.ts
├── login-invalid/
│   └── login-invalid.spec.ts
├── register/
│   └── register.spec.ts
├── protected-me-valid-token/
│   └── protected-me.spec.ts
├── protected-me-without-token/
│   └── protected-me-without.spec.ts
├── admin-only/
│   └── admin-only.spec.ts
├── utils/
│   ├── auth.helper.ts
│   └── utils.helper.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 🔍 Helpers Disponibles

### `utils/auth.helper.ts`
Funciones para facilitar pruebas de autenticación:
- `loginUser(email, password)` - Obtiene accessToken
- `registerUser(userData)` - Registra nuevo usuario
- Debugging automático de responses

### `utils/utils.helper.ts`
Utilidades generales para tests

---

## 📝 Notas

1. **Email Verificado**: Todos los usuarios deben tener `email_verified=true` en BD
2. **Setup**: Ejecutar `npm run setup:test-users` en carpeta padre si faltan usuarios
3. **Base de datos**: Auth Service usa base de datos independiente (`auth_db`)
4. **Tokens**: JWT válido por 24 horas

---

## ✅ Pre-requisitos

- ✅ Auth Service corriendo en `http://localhost:3001`
- ✅ PostgreSQL corriendo con `auth_db` creada
- ✅ Usuarios de prueba registrados (ADMIN y HR)
- ✅ Emails verificados en BD

Si alguno falla, ver documentación en carpeta padre.

---

## 🎯 Próximos Pasos

- ✅ Pruebas funcionales completadas
- ➡️ Ver: `../auth-service-performance/` para pruebas de carga con k6
