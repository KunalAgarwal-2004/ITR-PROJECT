import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('WorkBridge API Server Tests', () => {

  // Test 1: Root endpoint
  it('GET / should return 200 with service info', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'WorkBridge Freelance Marketplace API');
    assert.equal(res.body.status, 'active');
  });

  // Test 2: Primary Health Endpoint
  it('GET /api/health should return 200 with health telemetry', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'online');
    assert.ok(res.body.data.timestamp);
    assert.ok(typeof res.body.data.uptimeSeconds === 'number');
    assert.ok(res.body.data.memory);
    assert.ok(res.body.data.database);
    assert.ok(['connected', 'disconnected', 'connecting'].includes(res.body.data.database.status));
  });

  // Test 3: Versioned Health Endpoint
  it('GET /api/v1/health should also return 200', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'online');
  });

  // Test 4: Centralized 404 Route Handler
  it('GET /api/v1/nonexistent-route should return 404 with standardized error format', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Endpoint not found'));
  });

  // Test 5: Request Validation Failure (Missing/Invalid Fields)
  it('POST /api/v1/validate-demo with invalid payload should return 400 and validation errors', async () => {
    const res = await request(app)
      .post('/api/v1/validate-demo')
      .send({
        name: 'A', // Too short (min 2)
        email: 'not-an-email',
        password: '123', // Too short (min 8)
        role: 'invalid_role'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Request validation failed');
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors.length >= 3);
  });

  // Test 6: Request Validation Success
  it('POST /api/v1/validate-demo with valid payload should return 200', async () => {
    const res = await request(app)
      .post('/api/v1/validate-demo')
      .send({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'securePassword123!',
        role: 'freelancer'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Request payload successfully validated');
    assert.equal(res.body.data.email, 'alex@example.com');
    assert.equal(res.body.data.role, 'freelancer');
  });

  // Test 7: CORS origin headers
  it('Request from whitelisted CLIENT_URL should receive appropriate CORS headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    assert.equal(res.status, 200);
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.equal(res.headers['access-control-allow-credentials'], 'true');
  });

  // Test 8: Security Headers (Helmet)
  it('Responses should include Helmet security headers', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['x-frame-options']);
  });

});
