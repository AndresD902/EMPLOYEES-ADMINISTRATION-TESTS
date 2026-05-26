import { expect, request, test } from '@playwright/test';

const authBase = withTrailingSlash(process.env.AUTH_SERVICE_BASE_URL ?? 'http://localhost:3001/api/v1');
const employeeBase = withTrailingSlash(process.env.EMPLOYEE_SERVICE_BASE_URL ?? 'http://localhost:3002/api');
const vacationBase = withTrailingSlash(process.env.VACATION_SERVICE_BASE_URL ?? 'http://localhost:3004/api');
const historyBase = process.env.HISTORY_SERVICE_BASE_URL ?? 'http://localhost:3006';
const superAdminBase = process.env.SUPERADMIN_SERVICE_BASE_URL ?? 'http://localhost:3007';
const mailpitBase = process.env.MAILPIT_BASE_URL;
const superAdminRegisterSecret = process.env.SUPERADMIN_REGISTER_SECRET ?? process.env.REGISTER_SECRET;

test.describe('RBAC v2 real end-to-end flow', () => {
  test.skip(!mailpitBase, 'MAILPIT_BASE_URL is required to read real SMTP messages without mocks.');
  test.skip(!superAdminRegisterSecret, 'SUPERADMIN_REGISTER_SECRET or REGISTER_SECRET is required.');

  test('SUPER_ADMIN -> ADMIN -> HR -> CONSULTATION flow works against real services', async () => {
    const runId = `${Date.now()}${Math.random().toString(16).slice(2)}`;
    const companyEmail = `qa.company.${runId}@gmail.com`;
    const admin1Email = `qa.admin1.${runId}@gmail.com`;
    const admin2Email = `qa.admin2.${runId}@gmail.com`;
    const hrEmail = `qa.hr.${runId}@gmail.com`;
    const employeeEmail = `qa.consultant.${runId}@gmail.com`;
    const superAdminEmail = `qa.super.${runId}@gmail.com`;
    const superAdminPassword = 'SuperAdmin123*';
    const hrPassword = 'HumanResources123*';

    await clearMailpit();

    const superApi = await request.newContext({ baseURL: superAdminBase });
    const superRegister = await superApi.post('/api/super-admin/register', {
      headers: { 'x-register-secret': superAdminRegisterSecret! },
      data: {
        nombre: 'QA Super Admin',
        email: superAdminEmail,
        password: superAdminPassword,
      },
    });
    expect(superRegister.status()).toBe(201);

    const superLogin = await superApi.post('/api/super-admin/login', {
      data: { email: superAdminEmail, password: superAdminPassword },
    });
    expect(superLogin.status()).toBe(200);
    const superToken = (await superLogin.json()).data.access_token as string;

    const createCompany = await superApi.post('/api/super-admin/empresas', {
      headers: { Authorization: `Bearer ${superToken}` },
      data: {
        nombre: `QA Company ${runId}`,
        nit: `QA${runId.slice(-12)}`,
        correo: companyEmail,
        telefono: '3001234567',
        plan: 'basico',
        adminEmails: [admin1Email, admin2Email],
      },
    });
    expect(createCompany.status()).toBe(201);
    const companyBody = await createCompany.json();
    expect(companyBody.data.admins).toHaveLength(2);
    const companyId = Number(companyBody.data.empresa.id);
    expect(companyId).toBeGreaterThan(0);

    const adminPassword = await waitForExactPasswordEmail(admin1Email);
    const authApi = await request.newContext({ baseURL: authBase });
    const adminLogin = await authApi.post('auth/login', {
      data: { email: admin1Email, password: adminPassword },
    });
    expect(adminLogin.status()).toBe(200);
    const adminToken = (await adminLogin.json()).data.accessToken as string;

    const createHr = await authApi.post('users', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        firstName: 'QA',
        lastName: 'HR',
        email: hrEmail,
        password: hrPassword,
        role: 'HR',
      },
    });
    expect(createHr.status()).toBe(201);

    const hrLogin = await authApi.post('auth/login', {
      data: { email: hrEmail, password: hrPassword },
    });
    expect(hrLogin.status()).toBe(200);
    const hrToken = (await hrLogin.json()).data.accessToken as string;

    const employeeApi = await request.newContext({ baseURL: employeeBase });
    const createEmployee = await employeeApi.post('empleados', {
      headers: { Authorization: `Bearer ${hrToken}` },
      data: {
        cedula: runId.slice(-10),
        nombre: 'QA',
        apellido: 'Consultant',
        correo_corporativo: employeeEmail,
        correo_personal: employeeEmail,
        celular: '3001234567',
        fecha_ingreso: '2024-01-15',
        cargo: 'Analista QA',
        salario: 4500000,
      },
    });
    expect(createEmployee.status()).toBe(201);
    const employeeId = Number((await createEmployee.json()).data.id);
    expect(employeeId).toBeGreaterThan(0);

    const deleteAsHr = await employeeApi.delete(`empleados/${employeeId}`, {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    expect(deleteAsHr.status()).toBe(403);

    const consultantPassword = await waitForExactPasswordEmail(employeeEmail);
    const consultantLogin = await authApi.post('auth/login', {
      data: { email: employeeEmail, password: consultantPassword },
    });
    expect(consultantLogin.status()).toBe(200);
    const consultantToken = (await consultantLogin.json()).data.accessToken as string;

    const consultantList = await employeeApi.get('empleados', {
      headers: { Authorization: `Bearer ${consultantToken}` },
    });
    expect(consultantList.status()).toBe(403);

    const consultantMe = await employeeApi.get('empleados/me', {
      headers: { Authorization: `Bearer ${consultantToken}` },
    });
    expect(consultantMe.status()).toBe(200);
    expect(Number((await consultantMe.json()).data.id)).toBe(employeeId);

    const changeRequest = await employeeApi.post('empleados/me/solicitar-correccion', {
      headers: { Authorization: `Bearer ${consultantToken}` },
      data: { descripcion: 'Solicito actualizar mi direccion de residencia.' },
    });
    expect(changeRequest.status()).toBe(200);

    const changeRequests = await employeeApi.get('empleados/change-requests?status=PENDING', {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    expect(changeRequests.status()).toBe(200);
    const pending = (await changeRequests.json()).data.find(
      (item: { requested_by_email?: string }) => item.requested_by_email === employeeEmail,
    );
    expect(pending).toBeTruthy();

    const review = await employeeApi.patch(`empleados/change-requests/${pending.id}/review`, {
      headers: { Authorization: `Bearer ${hrToken}` },
      data: { status: 'APPROVED', reviewNotes: 'Solicitud validada por QA E2E.' },
    });
    expect(review.status()).toBe(200);

    const vacationApi = await request.newContext({ baseURL: vacationBase });
    const eligibility = await vacationApi.get('vacaciones/me/eligibility', {
      headers: { Authorization: `Bearer ${consultantToken}` },
    });
    expect(eligibility.status()).toBe(200);

    const vacationRequest = await vacationApi.post('vacaciones/me', {
      headers: { Authorization: `Bearer ${consultantToken}` },
      data: {
        fecha_inicio: '2026-07-06',
        fecha_fin: '2026-07-10',
        justificacion: 'Solicitud E2E real de vacaciones.',
      },
    });
    expect(vacationRequest.status()).toBe(201);
    const vacationId = Number((await vacationRequest.json()).id);
    expect(vacationId).toBeGreaterThan(0);

    const vacationApproval = await vacationApi.patch(`vacaciones/${vacationId}/aprobar`, {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    expect(vacationApproval.status()).toBe(200);
    await waitForSubjectEmail(employeeEmail, /vacaciones aprobadas/i);

    const rejectedVacationRequest = await vacationApi.post('vacaciones/me', {
      headers: { Authorization: `Bearer ${consultantToken}` },
      data: {
        fecha_inicio: '2026-08-03',
        fecha_fin: '2026-08-07',
        justificacion: 'Solicitud E2E real para validar rechazo.',
      },
    });
    expect(rejectedVacationRequest.status()).toBe(201);
    const rejectedVacationId = Number((await rejectedVacationRequest.json()).id);
    expect(rejectedVacationId).toBeGreaterThan(0);

    const vacationRejection = await vacationApi.patch(`vacaciones/${rejectedVacationId}/rechazar`, {
      headers: { Authorization: `Bearer ${hrToken}` },
      data: { motivo_rechazo: 'Rechazo E2E real validado por RRHH.' },
    });
    expect(vacationRejection.status()).toBe(200);
    await waitForSubjectEmail(employeeEmail, /vacaciones rechazada/i);

    await expectAuditEvent('acciones', hrToken, 'creacion_hr');
    await expectAuditEvent('acciones', hrToken, 'creacion_consultante');
    await expectAuditEvent('cambios', hrToken, 'employee_change_request');
    await expectAuditEvent('cambios', hrToken, 'aprobacion_vacaciones');
    await expectAuditEvent('cambios', hrToken, 'rechazo_vacaciones');
  });
});

async function clearMailpit(): Promise<void> {
  if (!mailpitBase) return;
  await fetch(`${mailpitBase.replace(/\/$/, '')}/api/v1/messages`, { method: 'DELETE' }).catch(() => undefined);
}

function withTrailingSlash(value: string): string {
  return value.replace(/\/?$/, '/');
}

async function waitForExactPasswordEmail(toEmail: string): Promise<string> {
  const base = mailpitBase!.replace(/\/$/, '');
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const listResponse = await fetch(`${base}/api/v1/messages`);
    if (listResponse.ok) {
      const listBody = await listResponse.json() as { messages?: unknown[]; Messages?: unknown[] };
      const messages = (listBody.messages ?? listBody.Messages ?? []) as Array<Record<string, unknown>>;
      for (const summary of messages) {
        const id = String(summary.ID ?? summary.Id ?? summary.id ?? '');
        const detailResponse = id ? await fetch(`${base}/api/v1/message/${id}`) : undefined;
        const detail = (detailResponse?.ok ? await detailResponse.json() : summary) as {
          To?: Array<{ Address?: string }>;
          Subject?: string;
          Text?: string;
          HTML?: string;
        };
        const sentToTarget = detail.To?.some((item) => item.Address?.toLowerCase() === toEmail.toLowerCase());
        if (sentToTarget && /credenciales|credentials/i.test(detail.Subject ?? '')) {
          const body = (detail.Text ?? detail.HTML ?? JSON.stringify(detail))
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');
          const match = body.match(/(?:Contrasena|Contraseña|Password)\s*(?:temporal)?\s*:?\s*([A-Za-z0-9!@#$%^&*()_\-+=./?]+)/i);
          expect(match?.[1], `Password was not found in the email sent to ${toEmail}`).toBeTruthy();
          return match![1];
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 750));
  }
  throw new Error(`Expected credentials email was not received by ${toEmail}`);
}

async function waitForSubjectEmail(toEmail: string, subject: RegExp): Promise<void> {
  const base = mailpitBase!.replace(/\/$/, '');
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const listResponse = await fetch(`${base}/api/v1/messages`);
    if (listResponse.ok) {
      const listBody = await listResponse.json() as { messages?: unknown[]; Messages?: unknown[] };
      const messages = (listBody.messages ?? listBody.Messages ?? []) as Array<Record<string, unknown>>;
      for (const summary of messages) {
        const id = String(summary.ID ?? summary.Id ?? summary.id ?? '');
        const detailResponse = id ? await fetch(`${base}/api/v1/message/${id}`) : undefined;
        const detail = (detailResponse?.ok ? await detailResponse.json() : summary) as {
          To?: Array<{ Address?: string }>;
          Subject?: string;
        };
        const sentToTarget = detail.To?.some((item) => item.Address?.toLowerCase() === toEmail.toLowerCase());
        if (sentToTarget && subject.test(detail.Subject ?? '')) {
          return;
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 750));
  }
  throw new Error(`Expected email ${subject} was not received by ${toEmail}`);
}

async function waitForPasswordEmail(toEmail: string): Promise<string> {
  const body = await waitForMail((message) => message.includes(toEmail) && /credenciales|credentials/i.test(message));
  const normalized = body.replace(/<[^>]+>/g, ' ').replace(/\\n/g, ' ');
  const match = normalized.match(/(?:Contrasena|Contrase(?:n|ñ|Ã±)a|Password)\s*(?:temporal)?\s*[:\s]+\s*([A-Za-z0-9!@#$%^&*()_\-+=./?]+)/i);
  expect(match?.[1], `Password was not found in the email sent to ${toEmail}`).toBeTruthy();
  return match![1];
}

async function waitForMail(predicate: (message: string) => boolean): Promise<string> {
  const base = mailpitBase!.replace(/\/$/, '');
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const listResponse = await fetch(`${base}/api/v1/messages`);
    if (listResponse.ok) {
      const listBody = await listResponse.json() as { messages?: unknown[]; Messages?: unknown[] };
      const messages = (listBody.messages ?? listBody.Messages ?? []) as Array<Record<string, unknown>>;
      for (const summary of messages) {
        const id = String(summary.ID ?? summary.Id ?? summary.id ?? '');
        const detailResponse = id
          ? await fetch(`${base}/api/v1/message/${id}`)
          : undefined;
        const detail = detailResponse?.ok ? await detailResponse.json() : summary;
        const serialized = JSON.stringify(detail);
        if (predicate(serialized)) {
          return serialized;
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 750));
  }
  throw new Error('Expected email was not received by Mailpit');
}

async function expectAuditEvent(collection: 'acciones' | 'cambios', token: string, expectedValue: string): Promise<void> {
  const url = `${historyBase}/api/historial/${collection}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (response.ok) {
      const serialized = JSON.stringify(await response.json());
      if (serialized.includes(expectedValue)) {
        return;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Audit event ${expectedValue} was not found in ${collection}`);
}
