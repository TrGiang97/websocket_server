// Ws connection
const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });
let server = require('http').createServer();
// Express webpage
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.redirect('https://toeicsinhvien.com/temp/recordingWS/student.html');
});

let wss = new WebSocket.Server({ server })
server.on('request', app);

// Store connected students and teacher
const users = new Map(); // Use Map to store users with unique identifiers
const connectedClients = new Set(); // Use Set to store connected clients
let lastQuestion = null;
let nextUserId = 1; // Counter for assigning unique user IDs

wss.on('connection', (ws) => {
  // Generate a unique user ID for the new connection
  const userId = nextUserId++;
  // Add the client to the set of connected clients
  connectedClients.add(ws);
  // Initialize user data
  const user = {
    id: userId,
    name: null,
    avatar: null,
    role: null,
    socket: ws,
  };

  // Send the user's information to the user
  ws.send(JSON.stringify({ type: 'welcome', data: { id: userId, lastQuestion } }));

  // Handle incoming messages from users
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // console.log(data);
    // If the message is to set the user's profile, update the data
    if (data.type === 'setProfile') {
      user.name = data.name;
      user.avatar = data.avatar;
      user.role = data.role;

      // Notify other users that a new user has connected
      if (user.role === 'student') {
        const teacher = findTeacher();
        if (teacher && teacher.socket.readyState === WebSocket.OPEN) {
          teacher.socket.send(JSON.stringify({ type: 'new_user', data: { id: user.id, name: user.name, avatar: user.avatar } }));
        }
      } else if (user.role === 'teacher') {
        // Send the list of connected students to the teacher
        const studentList = getStudentList();
        studentList.forEach(studentData => {
          user.socket.send(JSON.stringify({ type: 'new_user', data: studentData }));
        })
      }
    } else if (data.type === 'student_record' && user.role === 'student') {
      // Send the student's recorded audio to the teacher
      const teacher = findTeacher();
      if (teacher && teacher.socket.readyState === WebSocket.OPEN) {
        teacher.socket.send(JSON.stringify({ type: 'new_record', studentId: userId, binaryData: data.binaryData }));
      } 
    } else if (data.type === 'new_question' && user.role === 'teacher') {
      const { question, expireTime, audioData, imageData, classModule, classExercise } = data.data;
      lastQuestion = { question, expireTime, audioData, imageData, classModule, classExercise }
      broadcastToAll({ type: 'new_question', data: { question, expireTime, audioData, imageData, classModule, classExercise } });
    }
  });

  // Add the user to the map of connected users
  users.set(userId, user);

  // Remove the user from the map when they disconnect
  ws.on('close', () => {
    // Capture the 'user' object in a closure to ensure its availability
    const user = users.get(userId);
    if (user) {
      users.delete(userId);

      // Notify other users about the disconnection
      if (user.role === 'teacher') {
        // Notify all students about the teacher's disconnection
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const clientUser = users.get(client.id);
            if (clientUser && clientUser.role === 'student') {
              client.send(JSON.stringify({ type: 'teacher_disconnected' }));
            }
          }
        });
      } else {
        // Notify the teacher that a student has disconnected
        const teacher = findTeacher();
        if (teacher && teacher.socket.readyState === WebSocket.OPEN) {
          teacher.socket.send(JSON.stringify({ type: 'student_disconnected', studentId: userId }));
        }
      }
    }
  });

  // Helper function to broadcast a message to all connected clients
  function broadcastToAll(message) {
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    })
  };

  // Helper function to find the teacher user
  function findTeacher() {
    for (const user of users.values()) {
      if (user.role === 'teacher') {
        return user;
      }
    }
    return null;
  }

  // Helper function to gather the list of connected students
  function getStudentList() {
    const studentList = [];
    for (const user of users.values()) {
      if (user.role === 'student') {
        studentList.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        });
      }
    }
    return studentList;
  }

});

server.listen(8080, function() {
    console.log(`User connected`);
});