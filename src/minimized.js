const { ipcRenderer } = require('electron');

const stopBtn = document.getElementById('stop-btn');
const statusEl = document.getElementById('status');
const openMainBtn = document.getElementById('open-main');

stopBtn.addEventListener('click', () => {
  ipcRenderer.send('stop-tracking');
});

ipcRenderer.on('tracking-started', () => {
  statusEl.textContent = 'Running';
});

ipcRenderer.on('tracking-stopped', () => {
  statusEl.textContent = 'Stopped';
});

openMainBtn.addEventListener('click', () => {
  ipcRenderer.send('open-main-window');
});
