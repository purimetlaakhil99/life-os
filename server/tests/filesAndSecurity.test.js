import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getLLMStatus } from '../src/services/llmProviderService.js';

describe('Digital Files Security & LLM Provider Abstraction', () => {
  it('blocks unauthenticated access to /api/files and /api/career', async () => {
    const resFiles = await request(app).get('/api/files');
    expect(resFiles.status).toBe(401);

    const resCareer = await request(app).get('/api/career');
    expect(resCareer.status).toBe(401);
  });

  it('reports clean LLM provider abstraction status without exposing API keys', () => {
    const status = getLLMStatus();
    expect(status).toHaveProperty('provider');
    expect(status).toHaveProperty('configured');
    expect(status).toHaveProperty('mode');
    expect(JSON.stringify(status)).not.toContain('AIza');
  });
});
