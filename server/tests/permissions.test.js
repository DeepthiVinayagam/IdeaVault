const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let baseUrl;
let studentToken;
let facultyToken;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  // Authenticate student
  const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@ideavault.edu', password: 'password123' })
  });
  const studentData = await studentRes.json();
  studentToken = studentData.token;

  // Authenticate faculty
  const facultyRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'faculty@ideavault.edu', password: 'password123' })
  });
  const facultyData = await facultyRes.json();
  facultyToken = facultyData.token;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Role Permissions & Security Enforcements', async (t) => {
  await t.test('Unauthenticated user cannot access protected routes (401)', async () => {
    const res = await fetch(`${baseUrl}/api/ideas`);
    assert.strictEqual(res.status, 401);
  });

  await t.test('Student CANNOT approve or reject a project (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/projects/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes('Access denied') || data.error.includes('Forbidden'));
  });

  await t.test('Student CANNOT create user accounts (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        name: 'Hacker',
        email: 'hacker@ideavault.edu',
        password: 'password123',
        role: 'admin'
      })
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('Faculty CAN update project status (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/projects/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      },
      body: JSON.stringify({ status: 'approved', review_notes: 'Verified and approved by faculty test' })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.project.status, 'approved');
  });

  await t.test('Faculty CAN add a new completed project (201 Created)', async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        title: 'Quantum Encryption Simulator',
        abstract: 'Simulation of quantum key distribution protocols under various noise levels.',
        technologies: 'Python, Qiskit, React',
        department: 'Physics & CS',
        year: 2024,
        student_names: 'Alice Zhang, Bob Lee'
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.project.title, 'Quantum Encryption Simulator');
  });
});
