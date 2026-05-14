# 🧪 Pruebas Automatizadas - Sistema de Administración de Empleados

Suite completa y escalable de pruebas funcionales (integración) y de performance para los microservicios de la plataforma.

---

## 📁 Estructura General

```
EMPLOYEES-ADMINISTRATION-TESTS/
│
├── auth-service/                           # Tests funcionales de Auth Service
│   ├── health/
│   ├── login/
│   ├── login-invalid/
│   ├── register/
│   ├── protected-me-valid-token/
│   ├── protected-me-without-token/
│   ├── admin-only/
│   ├── utils/
│   │   ├── auth.helper.ts
│   │   └── utils.helper.ts
│   ├── playwright.config.ts
│   ├── package.json
│   └── README.md
│
├── auth-service-performance/                # Tests de performance con k6
│   ├── src/
│   │   ├── scenarios/
│   │   │   ├── smoke-test.js
│   │   │   ├── login-burst.js
│   │   │   ├── protected-routes-load.js
│   │   │   └── mixed-realistic-load.js
│   │   └── utils/
│   │       ├── config.js
│   │       ├── helpers.js
│   │       └── reporters.js
│   ├── results/
│   ├── .env
│   ├── k6.config.json
│   ├── package.json
│   └── README.md
│
├── setup-test-users.ts
├── fix-db-schema.ts
├── check-emails.ts
├── inspect-db.ts
├── .env
├── .env.example
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 🎯 Propósito de Cada Carpeta

### `auth-service/` - Tests Funcionales (Playwright)
- **7 Tests** que validan autenticación, autorización y rutas protegidas
- **Ejecución**: `npm run test:auth`
- **Documentación**: Ver `auth-service/README.md`

### `auth-service-performance/` - Tests de Performance (k6)
- **4 Escenarios**: Smoke, Burst, Sustained Load, Mixed Realistic Load
- **Ejecución**: `npm run perf:smoke` | `npm run perf:burst` | `npm run perf:load` | `npm run perf:mixed`
- **Documentación**: Ver `auth-service-performance/README.md`

---

## 🚀 Inicio Rápido

### Setup (Primera vez)
```bash
npm run setup:test-users
npm run fix:db
npm run check:emails
```

### Tests Funcionales
```bash
npm run test:auth
```

### Tests de Performance
```bash
npm run perf:smoke    # Verificación rápida
npm run perf:all      # Todos los escenarios
```

### Todo junto
```bash
npm run test:all
```

---

## 📋 Scripts Disponibles

**Setup**:
- `npm run setup:test-users` - Registrar usuarios
- `npm run fix:db` - Reparar schema
- `npm run check:emails` - Verificar emails

**Tests Funcionales**:
- `npm run test:auth` - Ejecutar todos
- `npm run test:auth:watch` - Modo watch
- `npm run report:auth` - Ver reporte HTML

**Tests Performance (k6)**:
- `npm run perf:smoke` - Verificación rápida
- `npm run perf:burst` - Ráfaga de logins
- `npm run perf:load` - Carga sostenida
- `npm run perf:mixed` - Rampa realista
- `npm run perf:all` - Todos los escenarios

**Combinados**:
- `npm run test:all` - Funcionales + performance

---

## 🔧 Pre-requisitos

### 1. k6 (para tests de performance)

**macOS**: `brew install k6`  
**Windows**: `choco install k6` o descargar desde https://github.com/grafana/k6/releases  
**Linux**: `sudo apt-get install k6`

Verificar: `k6 version`

### 2. Auth Service corriendo

```bash
curl http://localhost:3001/api/v1/health
# Response esperado: { "status": "ok" }
```

### 3. PostgreSQL con auth_db

BD debe tener usuarios registrados con email_verified=true

---

## 📊 Estructura Escalable

La estructura está lista para agregar tests de otros microservicios:

```
EMPLOYEES-ADMINISTRATION-TESTS/
├── auth-service/               # ✅ Completo
├── auth-service-performance/   # ✅ Completo
├── contract-service/           # ➡️ Próximos
├── contract-service-performance/
├── employee-service/
├── employee-service-performance/
└── ... (vacation, history, etc)
```

Para agregar un nuevo servicio, copiar estructura de auth-service y auth-service-performance, adaptando URLs y credenciales.

---

## 📚 Documentación Detallada

- **Tests Funcionales**: `auth-service/README.md`
- **Tests Performance**: `auth-service-performance/README.md`
- **Setup Completo**: `SETUP-COMPLETE.md`

---

## 📊 Estado Actual

✅ 7 Tests Funcionales - Auth Service (todos pasando)  
✅ 4 Escenarios Performance - k6 (listos para usar)  
✅ Estructura escalable para otros microservicios  
✅ Documentación completa

---

**Última actualización**: 2026-05-13  
**Versión**: 2.0 (Playwright + k6)  
**Estado**: 🎉 Listo para usar
