import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Express REST API Endpoints & Security Checks', () => {
  it('GET /api/health returns online status and version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.app).toBe('LIFE OS Backend Engine');
  });

  it('POST /api/auth/register rejects invalid inputs with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email-address',
        password: '123', // too short (<8)
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toBeDefined();
  });

  it('Protected routes reject unauthenticated requests with 401', async () => {
    const res1 = await request(app).get('/api/tasks');
    expect(res1.status).toBe(401);

    const res2 = await request(app).get('/api/student/profile');
    expect(res2.status).toBe(401);

    const res3 = await request(app).get('/api/memory');
    expect(res3.status).toBe(401);
  });
});
