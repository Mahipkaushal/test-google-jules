const { ipcRenderer } = require('electron');

document.getElementById('login-form').addEventListener('submit', (evt) => {
  evt.preventDefault();
  // In a real app, you'd have authentication logic here.
  // For now, we'll just send a message to the main process to open the main window.
  ipcRenderer.send('login-successful');
});
