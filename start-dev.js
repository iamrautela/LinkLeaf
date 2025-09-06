#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting LinkLeaf Full-Stack Development Environment...\n');

// Start backend
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n🎨 Starting frontend development server...');
  
  // Start frontend
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 2000);

backend.on('error', (err) => {
  console.error('❌ Backend failed to start:', err);
});

backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend exited with code ${code}`);
  }
});
