const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Auth API Tests', async (t) => {
  await t.test('POST /api/auth/login with valid student credentials succeeds', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@ideavault.edu',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, 'student@ideavault.edu');
    assert.strictEqual(data.user.role, 'student');
    assert.ok(data.token, 'Should return token');

    // Check Set-Cookie header for httpOnly
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Should set cookie header');
    assert.ok(setCookie.includes('HttpOnly') || setCookie.includes('httponly'));
  });

  await t.test('POST /api/auth/login with incorrect password returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@ideavault.edu',
        password: 'wrongpassword'
      })
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.ok(data.error.includes('Invalid'));
  });

  await t.test('POST /api/auth/login with missing fields returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' })
    });

    assert.strictEqual(res.status, 400);
  });

  await t.test('GET /api/auth/me returns current user when token provided', async () => {
    // 1. Log in to get token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'faculty@ideavault.edu',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();

    // 2. Call /api/auth/me with Authorization header
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.user.email, 'faculty@ideavault.edu');
    assert.strictEqual(meData.user.role, 'faculty');
  });
});
