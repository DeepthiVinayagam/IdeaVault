const test = require('node:test');
const assert = require('node:assert');
const {
  cleanAndTokenize,
  calculateTF,
  calculateIDF,
  createTfidfVector,
  calculateCosineSimilarity,
  extractSharedKeywords,
  analyzeIdeaSimilarity
} = require('../src/similarity');

test('Similarity Engine - Text Preprocessing', async (t) => {
  await t.test('converts text to lowercase, strips punctuation, and removes stop words', () => {
    const raw = "The AI-driven system for Real-Time Forest Fire Detection & Mapping using Drones!";
    const tokens = cleanAndTokenize(raw);

    // Stop words like 'the', 'for', 'and', 'using', 'system' should be stripped
    assert.ok(!tokens.includes('the'));
    assert.ok(!tokens.includes('for'));
    assert.ok(!tokens.includes('and'));
    assert.ok(!tokens.includes('using'));
    assert.ok(!tokens.includes('system'));

    // Key terms should be retained
    assert.ok(tokens.includes('ai'));
    assert.ok(tokens.includes('driven'));
    assert.ok(tokens.includes('real'));
    assert.ok(tokens.includes('time'));
    assert.ok(tokens.includes('forest'));
    assert.ok(tokens.includes('fire'));
    assert.ok(tokens.includes('detection'));
    assert.ok(tokens.includes('mapping'));
    assert.ok(tokens.includes('drones'));
  });

  await t.test('handles empty or null input gracefully', () => {
    assert.deepStrictEqual(cleanAndTokenize(''), []);
    assert.deepStrictEqual(cleanAndTokenize(null), []);
    assert.deepStrictEqual(cleanAndTokenize(undefined), []);
  });
});

test('Similarity Engine - Vector Math & Cosine Similarity', async (t) => {
  await t.test('returns 1.0 for identical vectors', () => {
    const vecA = { machine: 0.5, learning: 0.8, python: 0.3 };
    const vecB = { machine: 0.5, learning: 0.8, python: 0.3 };

    const similarity = calculateCosineSimilarity(vecA, vecB);
    assert.strictEqual(Math.round(similarity * 100), 100);
  });

  await t.test('returns 0.0 for orthogonal/disjoint vectors', () => {
    const vecA = { blockchain: 0.8, solidity: 0.6 };
    const vecB = { agriculture: 0.7, soil: 0.5, lora: 0.4 };

    const similarity = calculateCosineSimilarity(vecA, vecB);
    assert.strictEqual(similarity, 0);
  });

  await t.test('returns 0 for empty vectors', () => {
    const similarity = calculateCosineSimilarity({}, {});
    assert.strictEqual(similarity, 0);
  });
});

test('Similarity Engine - End-to-End Analysis', async (t) => {
  const sampleApproved = [
    {
      id: 1,
      title: 'Autonomous Drone Navigation for Forest Fire Detection',
      abstract: 'Autonomous aerial drone surveillance using computer vision and edge neural networks for wildfire mapping.',
      technologies: 'Python, OpenCV, PyTorch, LoRaWAN, Raspberry Pi',
      department: 'Computer Science',
      year: 2024,
      student_names: 'Marcus Chen'
    },
    {
      id: 2,
      title: 'Decentralized EHR Medical Record Sharing with Zero Knowledge Proofs',
      abstract: 'Blockchain platform for secure medical history sharing using zk-SNARKs and smart contracts.',
      technologies: 'Solidity, Circom, React, IPFS, Web3',
      department: 'Cybersecurity',
      year: 2024,
      student_names: 'Priya Sharma'
    }
  ];

  await t.test('identifies high similarity for matching drone wildfire idea', () => {
    const matchingIdea = {
      title: 'Drone-based Forest Fire and Smoke Plume Detection',
      problem_statement: 'Early wildfire detection is critical for preventing forest loss.',
      description: 'Deploying edge computer vision models on drones to detect smoke and wildfire flames.',
      technologies: 'Python, PyTorch, OpenCV, Raspberry Pi'
    };

    const result = analyzeIdeaSimilarity(matchingIdea, sampleApproved);

    assert.ok(result.overall_score > 0.4, 'Overall score should be high (> 40%)');
    assert.strictEqual(result.has_matches, true);
    assert.strictEqual(result.top_matches[0].id, 1);
    assert.ok(result.top_matches[0].shared_keywords.length > 0);
    assert.ok(result.suggestions.length >= 2, 'Should provide 2-3 suggestions');
    assert.ok(result.disclaimer.includes('plagiarism'));
  });

  await t.test('handles low/zero match for unique unrelated idea', () => {
    const novelIdea = {
      title: 'Quantum Key Distribution Simulation in Fiber Optic Networks',
      problem_statement: 'Simulating BB84 quantum protocol for photon polarization state transmission.',
      description: 'Modeling single-photon detectors and phase decoherence in optical waveguides.',
      technologies: 'Qiskit, Python, NumPy, Matplotlib'
    };

    const result = analyzeIdeaSimilarity(novelIdea, sampleApproved);

    assert.ok(result.overall_score < 0.20, 'Overall score should be low');
    assert.strictEqual(result.has_matches, false);
    assert.ok(result.explanation.includes('no closely matching records') || result.explanation.includes('distinct'));
  });

  await t.test('handles empty approved repository safely', () => {
    const idea = {
      title: 'Smart Campus Shuttle Tracker',
      problem_statement: 'Students wait long times without live GPS data.',
      description: 'Live bus tracking app.',
      technologies: 'React, Node.js'
    };

    const result = analyzeIdeaSimilarity(idea, []);
    assert.strictEqual(result.overall_score, 0);
    assert.strictEqual(result.has_matches, false);
    assert.ok(result.explanation.includes('no approved project records'));
  });
});
