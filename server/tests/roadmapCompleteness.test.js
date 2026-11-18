import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Roadmap Phase 6-16 API Completeness & Isolation', () => {
  it('enforces authentication on conversation history, evening recap, decision assistant, free slots, and Gmail endpoints', async () => {
    const endpoints = [
      { method: 'get', path: '/api/ai/conversations' },
      { method: 'get', path: '/api/ai/evening-recap' },
      { method: 'post', path: '/api/ai/decision-assistant' },
      { method: 'get', path: '/api/planner/free-slots' },
      { method: 'post', path: '/api/integrations/gmail/draft' },
      { method: 'get', path: '/api/integrations/gmail/search' },
    ];

    for (const ep of endpoints) {
      const res = await request(app)[ep.method](ep.path);
      expect(res.status).toBe(401);
    }
  });
});
