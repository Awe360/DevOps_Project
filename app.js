const express = require('express');
const app = express();
const port = 3000;

// In-memory storage for students (array of objects)
let students = ["Awoke","Abebe","Kebede","Aster"];
let nextId = 1; // Simple ID generator

// Middleware to parse JSON bodies
app.use(express.json());

// GET /students - Read all students
app.get('/students', (req, res) => {
  res.json(students);
});

// GET /students/:id - Read one student by ID
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

// POST /students - Create a new student
app.post('/students', (req, res) => {
  const { name, age, major } = req.body;
  if (!name || !age || !major) {
    return res.status(400).json({ error: 'Missing required fields: name, age, major' });
  }
  const newStudent = { id: nextId++, name, age, major };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// PUT /students/:id - Update a student by ID
app.put('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const { name, age, major } = req.body;
  if (name) student.name = name;
  if (age) student.age = age;
  if (major) student.major = major;
  res.json(student);
});

// DELETE /students/:id - Delete a student by ID
app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  students.splice(index, 1);
  res.status(204).send(); // No content response
});

// new changes added

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});