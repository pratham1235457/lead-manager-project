const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

const testToken = jwt.sign(
{ id: '507f1f77bcf86cd799439011', email: 'test@example.com', name: 'Tester' },
process.env.JWT_SECRET
);

describe('Lead Manager API - Auth & Input Validation', () => {
it('GET /api/health returns 200 OK', async () => {
const res = await request(app).get('/api/health');
assert.strictEqual(res.status, 200);
assert.strictEqual(res.body.success, true);
});

it('GET /api/leads rejects unauthenticated requests with 401', async () => {
const res = await request(app).get('/api/leads');
assert.strictEqual(res.status, 401);
assert.strictEqual(res.body.success, false);
});

it('POST /api/leads rejects invalid email and missing required fields with 400', async () => {
const res = await request(app)
.post('/api/leads')
.set('Authorization', `Bearer ${testToken}`)
.send({
name: 'A',
email: 'not-an-email',
phone: '12',
company: '',
source: 'InvalidSource',
});

assert.strictEqual(res.status, 400);
assert.strictEqual(res.body.success, false);
assert.ok(Array.isArray(res.body.errors));
assert.ok(res.body.errors.length >= 4);
});

it('DELETE /api/leads/:id rejects malformed Mongo IDs with 400', async () => {
const res = await request(app)
.delete('/api/leads/invalid-id-123')
.set('Authorization', `Bearer ${testToken}`);

assert.strictEqual(res.status, 400);
assert.strictEqual(res.body.success, false);
});
});