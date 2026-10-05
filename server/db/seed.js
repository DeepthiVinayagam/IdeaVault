/**
 * IdeaVault Database Seeder
 * 
 * Run with: npm run seed
 * Populates demo accounts (student, faculty, admin) and ~10 sample approved faculty projects.
 * NEVER run automatically on server boot.
 */

const bcrypt = require('bcryptjs');
const db = require('./index');

console.log('🌱 Starting IdeaVault database seeding...');

// 1. Clear existing records for a clean slate
db.exec(`
  DELETE FROM analyses;
  DELETE FROM ideas;
  DELETE FROM projects;
  DELETE FROM users;
`);

// 2. Insert Demo Users (one for each role)
const demoPasswordHash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, department)
  VALUES (?, ?, ?, ?, ?)
`);

const alexId = insertUser.run(
  'Alex Rivera',
  'student@ideavault.edu',
  demoPasswordHash,
  'student',
  'Computer Science'
).lastInsertRowid;

const drVanceId = insertUser.run(
  'Dr. Evelyn Vance',
  'faculty@ideavault.edu',
  demoPasswordHash,
  'faculty',
  'Computer Science & Engineering'
).lastInsertRowid;

const adminId = insertUser.run(
  'Admin Supervisor',
  'admin@ideavault.edu',
  demoPasswordHash,
  'admin',
  'Academic Operations'
).lastInsertRowid;

console.log('✅ Demo users created:');
console.log('   - Student: student@ideavault.edu (password123)');
console.log('   - Faculty: faculty@ideavault.edu (password123)');
console.log('   - Admin:   admin@ideavault.edu   (password123)');

// 3. Insert 10 Sample Approved Projects
const insertProject = db.prepare(`
  INSERT INTO projects (
    title, abstract, technologies, department, year, student_names, status, submitted_by, approved_by, review_notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleProjects = [
  {
    title: 'Autonomous Drone Navigation for Forest Fire Detection and Mapping',
    abstract: 'An autonomous aerial drone surveillance system equipped with edge computer vision algorithms to detect thermal anomalies and smoke plumes in dense forest canopies. The system runs lightweight convolutional neural networks on Raspberry Pi and transmits GPS coordinate alerts over LoRaWAN telemetry.',
    technologies: 'Python, OpenCV, PyTorch, YOLOv8, LoRaWAN, Raspberry Pi, C++',
    department: 'Computer Science',
    year: 2024,
    student_names: 'Marcus Chen, Sarah Jenkins',
    status: 'approved',
    review_notes: 'Exemplary capstone project with robust hardware-in-the-loop field validation.'
  },
  {
    title: 'Decentralized Electronic Health Record (EHR) Sharing with Zero-Knowledge Proofs',
    abstract: 'A privacy-preserving patient health record management platform leveraging smart contracts on an Ethereum layer-2 rollup. Utilizes zk-SNARKs to verify patient consent and medical diagnostic credentials without disclosing identifiable patient clinical data or private medical history.',
    technologies: 'Solidity, Circom, zk-SNARKs, React, Node.js, Web3.js, IPFS, PostgreSQL',
    department: 'Cybersecurity & Blockchain',
    year: 2024,
    student_names: 'Priya Sharma, David Kim',
    status: 'approved',
    review_notes: 'Thorough security audit and cryptographic proof benchmarks provided.'
  },
  {
    title: 'Smart Campus Microgrid Energy Optimization using Reinforcement Learning',
    abstract: 'An intelligent energy management pipeline that balances solar photovoltaic generation, battery storage systems, and university building HVAC loads. Uses Deep Q-Networks (DQN) to forecast hourly energy pricing and optimize automated grid switching.',
    technologies: 'Python, TensorFlow, OpenAI Gym, FastAPI, Docker, InfluxDB, Grafana',
    department: 'Electrical & Computer Engineering',
    year: 2023,
    student_names: 'Elena Rostova, Carlos Mendez',
    status: 'approved',
    review_notes: 'Demonstrated 18% peak electrical load reduction in simulated campus tests.'
  },
  {
    title: 'Real-Time Sign Language Translation via Wearable Sensory Gloves and Transformer Models',
    abstract: 'A low-cost wearable sensory glove integrated with flex sensors, IMU accelerometers, and a micro-controller. Translates American Sign Language (ASL) finger gestures and hand motion trajectories into spoken English audio in real time using a sequence-to-sequence transformer model.',
    technologies: 'C++, Arduino, Python, PyTorch, Transformers, BLE, Android Kotlin',
    department: 'Biomedical & Software Engineering',
    year: 2023,
    student_names: 'Jordan Taylor, Maya Patel',
    status: 'approved',
    review_notes: 'Impressive accuracy (94.2%) across 50 conversational sign phrases.'
  },
  {
    title: 'Predictive Mental Health Analysis from Academic Communication Patterns using NLP',
    abstract: 'An opt-in student wellness assistant that monitors sentiment trajectories, conversational linguistics, and study-schedule circadian rhythms from anonymized communication logs. Employs BERT-based classifiers with differential privacy to flag early burnout symptoms and recommend counselor resources.',
    technologies: 'Python, HuggingFace Transformers, BERT, FastAI, React Native, SQLite',
    department: 'Data Science & AI',
    year: 2024,
    student_names: 'Liam O\'Connor, Hannah Zhao',
    status: 'approved',
    review_notes: 'Strong ethical safeguards, IRB approval compliance, and data anonymization protocol.'
  },
  {
    title: 'Automated Vulnerability Scanner for Smart Grid Modbus and SCADA Protocols',
    abstract: 'A distributed network penetration testing and fuzzing tool tailored for industrial control systems (ICS). Simulates cyberattack vectors, detects unauthenticated command injections, and produces compliance audit reports against NIST 800-82 guidelines.',
    technologies: 'Go, Python, Scapy, Wireshark, Modbus TCP, React, Tailwind CSS',
    department: 'Cybersecurity',
    year: 2023,
    student_names: 'Nathaniel Brooks, Sophia Lee',
    status: 'approved',
    review_notes: 'High practical utility for university critical infrastructure testing.'
  },
  {
    title: 'Low-Latency Edge AI Traffic Management with Dynamic Signal Prioritization',
    abstract: 'A smart city traffic light scheduling system utilizing edge inference cameras (NVIDIA Jetson) to compute real-time queue lengths and vehicle classifications. Automatically grants green-light priority corridors to approaching emergency response vehicles.',
    technologies: 'C++, CUDA, TensorRT, Python, YOLOv7, MQTT, Next.js, WebSockets',
    department: 'Computer Science',
    year: 2024,
    student_names: 'Gabriel Santos, Chloe Dupont',
    status: 'approved',
    review_notes: 'Well-documented hardware deployment with sub-15ms inference latency.'
  },
  {
    title: 'Soil Nutrient and Moisture Monitoring Network with LoRa IoT and Yield Forecasting',
    abstract: 'An agricultural precision farming system deploying multi-depth soil sensor probes across arable farmland. Collects NPK macronutrient levels and volumetric water content, running Random Forest regressors to predict harvest yields and optimize drip irrigation schedules.',
    technologies: 'C++, ESP32, LoRaWAN, Node.js, Express, React, Chart.js, MongoDB',
    department: 'Internet of Things (IoT)',
    year: 2023,
    student_names: 'Aisha Bello, Ravi Verma',
    status: 'approved',
    review_notes: 'Field tested across 5 local greenhouse pilot beds.'
  },
  {
    title: 'Gamified Collaborative Coding Environment with Automated Real-Time Peer Review',
    abstract: 'A browser-based IDE enabling synchronous pair programming with gamified unit test challenges and an AST-based static code analyzer that offers real-time suggestions on algorithmic complexity, code smells, and style guide adherence.',
    technologies: 'TypeScript, React, Monaco Editor, Node.js, WebSockets, Docker, Redis',
    department: 'Computer Science',
    year: 2024,
    student_names: 'Lucas Silva, Zoe Washington',
    status: 'approved',
    review_notes: 'Intuitive student usability feedback; tested in CS101 freshman lab.'
  },
  {
    title: 'Microplastic Contamination Detection in Water Samples using Holographic Imaging',
    abstract: 'An optical digital inline holographic microscope combined with deep learning image segmentation to identify microplastic particles in municipal water supplies, differentiating synthetic polymer fragments from natural biological particulates.',
    technologies: 'Python, TensorFlow, OpenCV, MATLAB, Flask, React, Tailwind CSS',
    department: 'Environmental & Computer Engineering',
    year: 2023,
    student_names: 'Ananya Roy, Samuel Miller',
    status: 'approved',
    review_notes: 'Published in undergraduate engineering symposium proceedings.'
  }
];

for (const proj of sampleProjects) {
  insertProject.run(
    proj.title,
    proj.abstract,
    proj.technologies,
    proj.department,
    proj.year,
    proj.student_names,
    proj.status,
    drVanceId,
    drVanceId,
    proj.review_notes
  );
}

// 4. Insert 1 Pending Project (so faculty review UI has an actionable pending project to review)
insertProject.run(
  'Automated Attendance Verification using Facial Recognition and Anti-Spoofing Liveness Checks',
  'A non-intrusive classroom attendance system using infrared depth cameras to prevent photo replay attacks and perform instant classroom roster verification.',
  'Python, OpenCV, MediaPipe, dlib, SQLite, Express, React',
  'Computer Science',
  2024,
  'Kevin Tran, Lisa Wang',
  'pending',
  alexId,
  null,
  'Pending faculty advisor technical review.'
);

console.log(`✅ Seeded ${sampleProjects.length} approved projects and 1 pending project.`);
console.log('🎉 Seeding completed successfully!\n');
