import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import http from 'node:http';

// Vitest clears mock call history between beforeAll and the test body, so the
// counters live outside the mocks and are incremented by the mock bodies.
const { counters, viteCreateServer } = vi.hoisted(() => {
  const counters = { listen: 0, vite: 0 };
  const viteCreateServer = vi.fn(async () => {
    counters.vite += 1;
    return { middlewares: (_req: unknown, _res: unknown, next: () => void) => next() };
  });
  return { counters, viteCreateServer };
});

vi.mock('vite', () => ({ createServer: viteCreateServer }));

describe('Ellix Connect - Supabase Server Runtime Guard', () => {
  let app: express.Application;
  let httpServer: http.Server;
  let baseUrl = '';

  beforeAll(async () => {
    // Simulate the Cloud Functions runtime: the platform sets K_SERVICE (and the
    // emulator sets FUNCTIONS_EMULATOR). The Vitest guard is off, so only the
    // cloud branch can stop startServer() from binding a port.
    vi.stubEnv('K_SERVICE', 'ellix-connect');
    vi.stubEnv('FUNCTIONS_EMULATOR', 'true');
    vi.stubEnv('VITEST', '');

    const listenSpy = vi.spyOn(express.application, 'listen');
    listenSpy.mockImplementation((() => {
      counters.listen += 1;
      return { on: vi.fn(), close: vi.fn() };
    }) as any);

    // No vi.resetModules() here: the server module must share this file's express
    // instance so the listen spy above actually intercepts app.listen().
    const serverModule = await import('../../server');
    app = serverModule.app;

    httpServer = http.createServer(app as any);
    await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', () => resolve()));
    const address = httpServer.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
  }, 60_000);

  afterAll(async () => {
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('neither binds a port nor starts the Vite dev server in the Cloud Functions runtime', () => {
    expect(counters.listen).toBe(0);
    expect(counters.vite).toBe(0);
  });

  it('answers unmatched /api routes with a JSON 404 instead of the Express HTML fallback', async () => {
    const res = await fetch(`${baseUrl}/api/does-not-exist`);
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type') || '').toMatch(/application\/json/);
    const body = await res.json();
    expect(body.error).toBe('API endpoint not found');
    expect(body.path).toBe('/api/does-not-exist');
  });

  it('still serves the health probe used by the platform', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('ok');
  });
});
