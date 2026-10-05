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

test('IdeaVault Complete End-to-End User Flow Simulation', async (t) => {
  let studentCookie = '';
  let studentToken = '';
  let facultyCookie = '';
  let facultyToken = '';
  let createdIdeaId = null;

  await t.test('1. Student Authentication & Session Verification', async () => {
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
    assert.strictEqual(data.user.role, 'student');
    assert.strictEqual(data.user.name, 'Alex Rivera');
    studentToken = data.token;
    studentCookie = res.headers.get('set-cookie');
  });

  await t.test('2. Student Submits Idea & Runs TF-IDF Similarity Analysis', async () => {
    const res = await fetch(`${baseUrl}/api/ideas/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Autonomous Wildfire & Thermal Smoke Detection Drone',
        problem_statement: 'Forest fires spread rapidly before ground crews can spot them. Early aerial thermal detection is critical.',
        description: 'An edge AI aerial drone system with Raspberry Pi and PyTorch computer vision to detect smoke plumes and coordinate alerts.',
        technologies: 'Python, PyTorch, OpenCV, YOLOv8, LoRaWAN, Raspberry Pi'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.idea && data.idea.id);
    createdIdeaId = data.idea.id;

    assert.ok(data.analysis, 'Analysis object must exist');
    assert.ok(data.analysis.overall_score > 0.40, 'Similarity score should detect overlap with drone project');
    assert.strictEqual(data.analysis.has_matches, true);
    assert.ok(data.analysis.top_matches.length >= 1, 'Should return matching projects');
    assert.ok(data.analysis.top_matches[0].title.includes('Drone'));
    assert.ok(data.analysis.shared_keywords.length > 0);
    assert.ok(data.analysis.suggestions.length >= 2, 'Must include 2-3 suggestions');
    assert.ok(data.analysis.disclaimer.includes('plagiarism'));
  });

  await t.test('3. Student Views Idea Details and Past History', async () => {
    const listRes = await fetch(`${baseUrl}/api/ideas`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.ideas.some(i => i.id === createdIdeaId));

    const detailRes = await fetch(`${baseUrl}/api/ideas/${createdIdeaId}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(detailRes.status, 200);
    const detailData = await detailRes.json();
    assert.strictEqual(detailData.idea.id, createdIdeaId);
    assert.ok(detailData.analysis);
  });

  await t.test('4. Faculty Login & Pending Project Approval', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'faculty@ideavault.edu',
        password: 'password123'
      })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    facultyToken = loginData.token;

    // Fetch projects to find pending project
    const projRes = await fetch(`${baseUrl}/api/projects?status=pending`, {
      headers: { 'Authorization': `Bearer ${facultyToken}` }
    });
    const projData = await projRes.json();
    assert.ok(projData.projects.length >= 1, 'Should have pending project');
    const pendingProject = projData.projects[0];

    // Approve the pending project
    const approveRes = await fetch(`${baseUrl}/api/projects/${pendingProject.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        review_notes: 'Verified and approved by Faculty Board.'
      })
    });
    assert.strictEqual(approveRes.status, 200);
    const approveData = await approveRes.json();
    assert.strictEqual(approveData.project.status, 'approved');
  });

  await t.test('5. Catalog Search & Filter Verification', async () => {
    const searchRes = await fetch(`${baseUrl}/api/projects?search=Drone`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.ok(searchData.projects.length >= 1);
    assert.ok(searchData.projects[0].title.toLowerCase().includes('drone'));
  });
});
