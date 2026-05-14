# 🚀 Ejecutar Pruebas de Performance con Auth-Service Real

Este guía te muestra cómo levantar el auth-service real y ejecutar las pruebas de performance.

## Prerrequisitos

- ✅ Node.js 18+ instalado
- ✅ PostgreSQL instalado y corriendo
- ✅ npm instalado

## Paso 1: Levantar el Auth-Service Real

Abre una terminal **nueva** en la carpeta `BACKEND/auth-service`:

```bash
cd "C:\Users\Paola\proyecto Administrador de empleados\BACKEND\auth-service"

# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar migraciones
npm run migrate

# Iniciar el servicio en modo desarrollo
npm run dev
```

**Esperado:**
```
✓ Database connected for auth-service
✓ auth-service running on port 3001
```

Si ves errores sobre la BD, verifica que PostgreSQL esté corriendo.

---

## Paso 2: Crear Usuarios de Prueba

Abre **otra terminal** en `EMPLOYEES-ADMINISTRATION-TESTS`:

```bash
cd "C:\Users\Paola\proyecto Administrador de empleados\EMPLOYEES-ADMINISTRATION-TESTS"

# Compilar e instalar si es necesario
npm install

# Ejecutar el script de setup
npm run setup

# O directamente con Node
ts-node setup-test-users.ts
```

**Esperado:**
```
🚀 === SETUP: Registrando usuarios de prueba ===

📝 Registrando usuarios:
  ✅ Registrado: admin@example.com
  ✅ Registrado: hr@example.com

✅ Validando logins:
  ✅ Login exitoso: admin@example.com
  ✅ Login exitoso: hr@example.com

✨ ¡Setup completado exitosamente!
```

---

## Paso 3: Ejecutar Pruebas de Performance

En la **misma terminal**, ejecuta:

```bash
# Ejecutar un test específico
npm run perf:smoke    # Test básico (10 segundos)
npm run perf:burst    # Test de estrés (35 segundos)
npm run perf:load     # Test de carga sostenida (2 minutos)
npm run perf:mixed    # Test realista completo (2.5 minutos)

# O ejecutar todos
npm run perf:all
```

---

## Estructura del Flujo

```
Terminal 1: Auth-Service Real
├── npm run migrate
└── npm run dev ✓ Running on port 3001

Terminal 2: Pruebas
├── npm run setup ✓ Users created
└── npm run perf:all ✓ All tests pass
```

---

## Variables de Entorno Personalizadas

Si necesitas cambiar credenciales, crea un archivo `.env` en la raíz de EMPLOYEES-ADMINISTRATION-TESTS:

```env
ADMIN_EMAIL=otro@ejemplo.com
ADMIN_PASSWORD=OtraContraseña123*
HR_EMAIL=rrhh@empresa.com
HR_PASSWORD=RRHHPass123*
AUTH_SERVICE_BASE_URL=http://localhost:3001/api/v1
```

---

## Troubleshooting

### ❌ "Cannot connect to localhost:3001"
- Verifica que el auth-service esté corriendo (`npm run dev` en Terminal 1)
- Prueba: `curl http://localhost:3001/api/v1/health`

### ❌ "Email already exists"
- Los usuarios ya fueron creados
- Puedes ejecutar `npm run setup` nuevamente, es seguro (ignora usuarios existentes)

### ❌ "Database connection refused"
- PostgreSQL no está corriendo
- En Windows: abre Services (services.msc) y verifica que postgresql está activo
- O ejecuta: `pg_ctl -D "C:\Program Files\PostgreSQL\data" start`

### ❌ "Port 3001 already in use"
- Mata el proceso: `lsof -ti:3001 | xargs kill -9` (Mac/Linux)
- O cambia el puerto en `.env` del auth-service

### ✅ Tests pasan con el auth-service real
- ¡Excelente! El microservicio está funcionando correctamente
- Las pruebas verifican:
  - Health check
  - Login y generación de JWT
  - Acceso a rutas protegidas
  - Rendimiento bajo carga

---

## Endpoints Verificados

Las pruebas k6 validan estos endpoints reales del auth-service:

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/auth/login` | POST | Autenticación |
| `/api/v1/protected/me` | GET | Ruta protegida |

---

## Próximos Pasos

1. ✅ Auth-service corriendo
2. ✅ Usuarios creados
3. ✅ Pruebas pasando
4. ➡️ Integrar más servicios (employee-service, contract-service, etc.)
5. ➡️ Ejecutar pruebas completas del sistema
