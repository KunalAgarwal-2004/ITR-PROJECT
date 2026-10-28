import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { connectDB } from '../src/config/db.js';

describe('Authentication & Authorization Integration Tests', () => {
  before(async () => {
    await connectDB();
    // Clean up test users if any exist from previous runs
    await User.deleteMany({ email: { $in: ['testclient@example.com', 'testfreelancer@example.com', 'googleuser@example.com'] } });
  });

  after(async () => {
    await User.deleteMany({ email: { $in: ['testclient@example.com', 'testfreelancer@example.com', 'googleuser@example.com'] } });
    await mongoose.connection.close();
  });

  let clientCookie = null;
  let freelancerCookie = null;

  // 1. Valid Client Signup
  it('POST /api/auth/signup should register a valid client and return HTTP-only cookie', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Jane Client',
        email: 'testclient@example.com',
        password: 'Password123!',
        role: 'client'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'client');
    assert.equal(res.body.data.user.email, 'testclient@example.com');
    assert.equal(res.body.data.user.password, undefined); // Password never leaked

    // Verify HTTP-only cookie set
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies && cookies.length > 0);
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    assert.ok(tokenCookie);
    assert.ok(tokenCookie.toLowerCase().includes('httponly'));
  });

  // 2. Reject Arbitrary / Admin Role
  it('POST /api/auth/signup should reject admin role signup requests', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Hacker Admin',
        email: 'hacker@example.com',
        password: 'Password123!',
        role: 'admin'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('validation failed') || res.body.message.includes('limited to client or freelancer'));
  });

  // 3. Reject Duplicate Account
  it('POST /api/auth/signup should return 409 Conflict for duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Jane Duplicate',
        email: 'testclient@example.com',
        password: 'Password123!',
        role: 'client'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  // 4. Valid Freelancer Signup
  it('POST /api/auth/signup should register a valid freelancer', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Bob Freelancer',
        email: 'testfreelancer@example.com',
        password: 'Password123!',
        role: 'freelancer'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'freelancer');
  });

  // 5. Invalid Login (Bad Password)
  it('POST /api/auth/login should return 401 for incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testclient@example.com',
        password: 'WrongPassword999'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid email or password');
  });

  // 6. Valid Login
  it('POST /api/auth/login should succeed and return session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testclient@example.com',
        password: 'Password123!'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'testclient@example.com');

    // Store cookie for subsequent session checks
    clientCookie = res.headers['set-cookie'];
    assert.ok(clientCookie);
  });

  // 7. Session Restoration (GET /api/auth/me) with Cookie
  it('GET /api/auth/me should restore active session using cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', clientCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'testclient@example.com');
    assert.equal(res.body.data.user.role, 'client');
  });

  // 8. Session Restoration Denied without Cookie
  it('GET /api/auth/me should return 401 without authentication token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 9. Google Authentication Verification Flow
  it('POST /api/auth/google should register and authenticate verified Google account', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'mock-google-token-googleuser@example.com',
        role: 'freelancer'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'googleuser@example.com');
    assert.equal(res.body.data.user.authProvider, 'google');
    assert.equal(res.body.data.user.isVerified, true);
  });

  // 10. Logout Endpoint
  it('POST /api/auth/logout should clear authentication cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Logged out successfully');

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const tokenCleared = cookies.some(c => c.startsWith('token=;') || c.includes('Expires=Thu, 01 Jan 1970'));
    assert.ok(tokenCleared, 'Token cookie was not expired/cleared');
  });

  // 11. Reject Invalid Token Signature
  it('GET /api/auth/me should reject invalid token with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.value');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid authentication token'));
  });

  // 12. Reject Expired Token
  it('GET /api/auth/me should reject expired token with 401', async () => {
    const { ENV } = await import('../src/config/env.js');
    const jwt = (await import('jsonwebtoken')).default;
    const expiredToken = jwt.sign({ id: new mongoose.Types.ObjectId() }, ENV.JWT_SECRET, { expiresIn: '0s' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('expired'));
  });

  // 13. Reject Malformed ObjectId in Token Payload safely with 401
  it('GET /api/auth/me should reject malformed ObjectId in token payload safely with 401', async () => {
    const { ENV } = await import('../src/config/env.js');
    const jwt = (await import('jsonwebtoken')).default;
    const malformedToken = jwt.sign({ id: 'not-a-valid-mongo-id' }, ENV.JWT_SECRET);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${malformedToken}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid authentication token payload'));
  });
});
