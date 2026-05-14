# 🔍 Diagnóstico: Error 401 en Login

Si el smoke test devuelve **401 "Invalid credentials"** en todas las peticiones de login, usa este script para identificar exactamente por qué falla.

## 🚀 Ejecutar Diagnóstico

```bash
cd EMPLOYEES-ADMINISTRATION-TESTS
npm install
npm run diagnose
```

## ✅ Qué Revisa el Script

```
1️⃣  BUSCANDO USUARIO EN BD
   └─ ¿Existe admin@example.com en la tabla users?

2️⃣  REVISANDO VALIDACIONES
   ├─ ¿is_active = true? (usuario no desactivado)
   ├─ ¿email_verified = true? (email confirmado)
   └─ ¿Existen otros flags que bloqueen?

3️⃣  VERIFICANDO PASSWORD CON BCRYPT
   ├─ bcrypt.compare("AdminPass123*", hash) = true/false?
   └─ Si falla, prueba passwords alternativas

4️⃣  SIMULACIÓN DE LOGIN
   └─ Si todas las validaciones pasan, indica qué status devolvería
```

## 📋 Posibles Resultados

### Caso 1: Usuario no existe
```
❌ Usuario NO existe en BD: admin@example.com

   Solución: Ejecuta "npm run perf:setup" primero
```

**Qué hacer:**
```bash
npm run perf:setup
npm run diagnose
```

---

### Caso 2: Usuario inactivo
```
❌ BLOQUEADO: Usuario inactivo (is_active = false)

   El auth-service lanza: ForbiddenError("User account is inactive")
```

**Qué hacer:**
```sql
UPDATE users SET is_active = true WHERE email = 'admin@example.com';
```

---

### Caso 3: Email no verificado
```
❌ BLOQUEADO: Email no verificado (email_verified = false)

   El auth-service lanza: ForbiddenError("Email address not verified...")
```

**Qué hacer:**
```bash
# Ejecuta el script de setup que ya verifica emails:
npm run perf:setup
```

O manualmente:
```sql
UPDATE users SET email_verified = true WHERE email = 'admin@example.com';
```

---

### Caso 4: Password incorrecto
```
❌ BLOQUEADO: Password incorrecto

   bcrypt.compare("AdminPass123*", hash) = false
   
   Intentando passwords alternativas:
   - "Admin123*": ❌
   - "AdminPass123": ❌
   - "admin@example.com": ❌
   - "password": ❌
```

**Qué hacer:**

El password no coincide. Opciones:

**Opción A: Recrear el usuario con password correcto**
```bash
# 1. Elimina el usuario viejo
psql -U postgres -d auth_service_db -c \
  "DELETE FROM users WHERE email = 'admin@example.com';"

# 2. Vuelve a ejecutar setup (crea con password correcto)
npm run perf:setup
```

**Opción B: Actualizar el password en BD**
```bash
# Necesitas hashear el password con bcrypt primero
# No es recomendable, mejor Opción A
```

---

### Caso 5: Todas las validaciones pasan ✅
```
✅ Todas las validaciones pasarían:
   ✓ Usuario existe
   ✓ Usuario activo (is_active = true)
   ✓ Email verificado (email_verified = true)
   ✓ Password correcto (bcrypt.compare = true)
   ✓ Se generaría JWT y refresh token
   ✓ Login respondería 200 OK
```

**Qué hacer:**

Si todo está bien en BD pero sigue devolviendo 401:

1. **Revisa los logs del auth-service** (Terminal 1)
   ```
   Ver qué errores específicos lanza el backend
   ```

2. **Verifica que uses la misma BD**
   ```bash
   # En auth-service/.env
   echo $DATABASE_URL
   
   # Debe apuntar a: auth_service_db
   ```

3. **Prueba login manualmente con curl**
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"AdminPass123*"}'
   ```

4. **Reinicia el auth-service**
   ```bash
   # Terminal 1
   Ctrl+C
   npm run dev
   ```

---

## 🛠️ Flujo Completo de Solución

```bash
# Terminal 1: Auth-Service
cd BACKEND/auth-service
npm run migrate
npm run dev

# Terminal 2: Diagnóstico
cd EMPLOYEES-ADMINISTRATION-TESTS
npm install

# Diagnosticar el problema
npm run diagnose

# Crear usuarios con emails verificados
npm run perf:setup

# Ejecutar tests
npm run perf:all
```

---

## 📊 Tabla de Diagnósticos

| Situación | Error | Solución |
|-----------|-------|----------|
| Usuario no existe | Usuario NO existe en BD | `npm run perf:setup` |
| Usuario inactivo | is_active = false | `UPDATE users SET is_active = true` |
| Email no verificado | email_verified = false | `npm run perf:setup` o UPDATE |
| Password mal | bcrypt.compare = false | Borrar usuario y recrear |
| Todo bien pero falla | ??? | Revisar logs del backend |

---

## 🔧 Variables de Entorno

Si usas credenciales diferentes, crea `.env`:

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/auth_service_db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPass123*
```

Luego ejecuta:
```bash
npm run diagnose
```

---

## 📝 Notas

- El script **NO modifica nada**, solo Lee
- Usa bcrypt para comparar passwords (igual que el backend)
- Revisa exactamente las mismas validaciones que el auth-service
- Si el script dice ✅, pero k6 dice 401, el problema está en otra parte

---

## ✨ Conclusión

Usa este script para:
1. ✅ Identificar exactamente dónde falla
2. ✅ Saber si es BD, password, o backend
3. ✅ Obtener instrucciones claras de solución
4. ✅ Verificar que todo está bien antes de tests

**El script te dirá exactamente qué está mal.** 🎯
