export interface PerformanceTarget {
  service: string;
  name: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  expectedStatuses: number[];
  body?: Record<string, unknown>;
}

const urls = {
  auth: process.env.AUTH_SERVICE_BASE_URL ?? "http://127.0.0.1:3001/api/v1",
  employee: process.env.EMPLOYEE_SERVICE_BASE_URL ?? "http://127.0.0.1:3002",
  contract: process.env.CONTRACT_SERVICE_BASE_URL ?? "http://127.0.0.1:3003",
  vacation: process.env.VACATION_SERVICE_BASE_URL ?? "http://127.0.0.1:3004",
  report: process.env.REPORT_SERVICE_BASE_URL ?? "http://127.0.0.1:3005",
  history: process.env.HISTORY_SERVICE_BASE_URL ?? "http://127.0.0.1:3006",
  superAdmin: process.env.SUPERADMIN_SERVICE_BASE_URL ?? "http://127.0.0.1:3007",
};

export const performanceTargets: PerformanceTarget[] = [
  {
    service: "auth-service",
    name: "health",
    method: "GET",
    url: `${urls.auth}/health`,
    expectedStatuses: [200],
  },
  {
    service: "auth-service",
    name: "invalid-login",
    method: "POST",
    url: `${urls.auth}/auth/login`,
    body: { email: "invalid@example.com", password: "Invalid123!" },
    expectedStatuses: [401],
  },
  {
    service: "employee-service",
    name: "health",
    method: "GET",
    url: `${urls.employee}/api/health`,
    expectedStatuses: [200],
  },
  {
    service: "employee-service",
    name: "protected-list-without-token",
    method: "GET",
    url: `${urls.employee}/api/empleados`,
    expectedStatuses: [401],
  },
  {
    service: "contract-service",
    name: "health",
    method: "GET",
    url: `${urls.contract}/health`,
    expectedStatuses: [200],
  },
  {
    service: "contract-service",
    name: "protected-list-without-token",
    method: "GET",
    url: `${urls.contract}/api/contratos`,
    expectedStatuses: [401],
  },
  {
    service: "vacation-service",
    name: "health",
    method: "GET",
    url: `${urls.vacation}/api/health`,
    expectedStatuses: [200],
  },
  {
    service: "vacation-service",
    name: "protected-list-without-token",
    method: "GET",
    url: `${urls.vacation}/api/vacaciones`,
    expectedStatuses: [401],
  },
  {
    service: "report-service",
    name: "health",
    method: "GET",
    url: `${urls.report}/api/health`,
    expectedStatuses: [200],
  },
  {
    service: "report-service",
    name: "protected-report-without-token",
    method: "GET",
    url: `${urls.report}/api/reportes/estado-laboral`,
    expectedStatuses: [401],
  },
  {
    service: "history-service",
    name: "health",
    method: "GET",
    url: `${urls.history}/health`,
    expectedStatuses: [200],
  },
  {
    service: "history-service",
    name: "protected-actions-without-token",
    method: "GET",
    url: `${urls.history}/api/historial/acciones`,
    expectedStatuses: [401],
  },
  {
    service: "super-admin-service",
    name: "health",
    method: "GET",
    url: `${urls.superAdmin}/api/health`,
    expectedStatuses: [200],
  },
  {
    service: "super-admin-service",
    name: "protected-companies-without-token",
    method: "GET",
    url: `${urls.superAdmin}/api/super-admin/empresas`,
    expectedStatuses: [401],
  },
];
