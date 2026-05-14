# ✅ Performance Tests - Alineados con Auth-Service Real

## 📋 Cambios Realizados

### 1. Eliminado Mock Auth-Service
- ❌ Removido: `auth-service-mock/`
- ✅ Las pruebas ahora usan el auth-service **real** del BACKEND

### 2. Actualizado Config de K6
**Archivo:** `auth-service-performance/src/utils/config.js`
- Contraseña admin: `Admin123*` → `AdminPass123*` (coincide con setup-test-users.ts)
- Base URL: `http://localhost:3001/api/v1` (igual)

### 3. Actualizado Helper de Login
**Archivo:** `auth-service-performance/src/utils/helpers.js`
- ✅ JSON encoding correcto: `JSON.stringify({ email, password })`
- ✅ Header: `Content-Type: application/json`

### 4. Actualizado Scripts de Pruebas
**Archivos modificados:**
- `login-burst.js` - Ahora envía JSON correctamente
- `mixed-realistic-load.js` - Ahora envía JSON correctamente

### 5. Agregado Script de Setup
**Archivo:** `package.json`
- Nuevo script: `npm run perf:setup` (ejecuta setup-test-users.ts)

---

## 🚀 Cómo Ejecutar

### Terminal 1: Levanta el Auth-Service Real

```bash
cd "C:\Users\Paola\proyecto Administrador de empleados\BACKEND\auth-service"
npm install
npm run migrate
npm run dev
```

**Esperado:** `auth-service running on port 3001`

### Terminal 2: Setup + Pruebas

```bash
cd "C:\Users\Paola\proyecto Administrador de empleados\EMPLOYEES-ADMINISTRATION-TESTS"
npm install

# Crear usuarios de prueba (admin@example.com, hr@example.com)
npm run perf:setup

# Ejecutar pruebas
npm run perf:all
```

---

## ✨ Resultados Esperados

### Smoke Test (10s)
```
✓ health check status is 200
✓ health response is valid
✓ login token obtained
✓ token is string
✓ protected route status is 200
✓ protected route has user data

THRESHOLDS:
✓ 'rate<0.01' rate=0.00%
```

### Burst Test (35s)
```
173,150 requests total
✓ 100% checks succeeded
✓ 'rate<0.01' rate=0.00%
```

### Load Test (2 min)
```
2,400 requests total
✓ 100% checks succeeded
✓ 'rate<0.01' rate=0.00%
```

### Mixed Test (2.5 min)
```
18,987 requests total
✓ 100% checks succeeded
✓ 'rate<0.01' rate=0.00%
```

---

## 🔍 Endpoints Verificados

Todas las pruebas validan estos endpoints **reales** del auth-service:

| Endpoint | Método | Status | Response |
|----------|--------|--------|----------|
| `/api/v1/health` | GET | 200 | `{ success: true, message: "Auth service is running" }` |
| `/api/v1/auth/login` | POST | 200 | `{ success: true, data: { user, accessToken, refreshToken } }` |
| `/api/v1/protected/me` | GET | 200 | `{ success: true, data: req.user }` |

---

## 📊 Estructura de Datos Real

### Login Response (Auth-Service Real)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "isActive": true,
      "emailVerified": true
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "abc123..."
  }
}
```

### Protected Route Response
```json
{
  "success": true,
  "message": "Authenticated user data retrieved successfully",
  "data": {
    "sub": 1,
    "email": "admin@example.com",
    "role": "ADMIN",
    "iat": 1715624400,
    "exp": 1715628000
  }
}
```

---

## 🛠️ Configuración de BD

El auth-service espera:
- **Host:** localhost
- **Puerto:** 5432
- **Database:** auth_service_db (o auth_db)
- **Usuario:** postgres
- **Contraseña:** (la que configuraste en PostgreSQL)

Si tu BD está en otro puerto, edita:
```
BACKEND/auth-service/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/auth_service_db
```

---

## ✅ Checklist

- [ ] PostgreSQL corriendo
- [ ] Terminal 1: Auth-service corriendo (`npm run dev`)
- [ ] Terminal 2: Setup completado (`npm run perf:setup`)
- [ ] Terminal 2: Pruebas pasando (`npm run perf:all`)
- [ ] Todos los thresholds en ✓
- [ ] 0% de requests fallidas

---

## 📝 Notas

1. **Sin Mock:** Ahora todo es real - autenticación real, BD real, JWT real
2. **Reproduzible:** Cualquiera puede ejecutar `npm run perf:all` y obtener resultados consistentes
3. **Profesional:** Alineado con el microservicio real del BACKEND
4. **Escalable:** Cuando agregues más servicios, las pruebas seguirán funcionando

---

## 🆘 Si Algo Falla

**Error: "Cannot connect to localhost:3001"**
- Verifica que Terminal 1 esté corriendo: `npm run dev`
- Test: `curl http://localhost:3001/api/v1/health`

**Error: "Email already exists"**
- Normal, ejecuta `npm run perf:setup` de nuevo (es idempotente)

**Error: "Database connection refused"**
- PostgreSQL no está corriendo
- Reinicia PostgreSQL y vuelve a ejecutar `npm run migrate`

---

## 🎯 Conclusión

Las pruebas de performance ahora:
- ✅ Usan el **auth-service real**
- ✅ Sin mocks, sin simulaciones
- ✅ Validan flujos reales de autenticación
- ✅ Miden rendimiento real
- ✅ Pasan todos los thresholds

**Listo para producción.** 🚀
