const { ipcRenderer } = require('electron');

const startBtn = document.getElementById('start-btn');
const taskInput = document.getElementById('task-input');
const updateTasksBtn = document.getElementById('update-tasks-btn');

let isTracking = false;

startBtn.addEventListener('click', () => {
  if (isTracking) {
    ipcRenderer.send('stop-tracking');
  } else {
    ipcRenderer.send('start-tracking');
  }
});

ipcRenderer.on('tracking-started', () => {
  isTracking = true;
  startBtn.textContent = 'Stop';
  startBtn.classList.add('stop-btn');
});

ipcRenderer.on('tracking-stopped', () => {
  isTracking = false;
  startBtn.textContent = 'Start';
  startBtn.classList.remove('stop-btn');
});


document.querySelectorAll('.break-btn').forEach(button => {
  button.addEventListener('click', () => {
    const breakType = button.textContent;
    if (breakType === 'Other') {
      const reason = prompt('Please enter the reason for your break:');
      if (reason) {
        ipcRenderer.send('take-break', { type: 'Other', reason });
      }
    } else {
      ipcRenderer.send('take-break', { type: breakType });
    }
  });
});

updateTasksBtn.addEventListener('click', () => {
  const tasks = taskInput.value;
  ipcRenderer.send('update-tasks', tasks);
});
