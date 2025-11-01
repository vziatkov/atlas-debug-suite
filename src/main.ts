// Atlas Debug Suite - Demo
import './style.css';
import './gptLogger'; // Инициализируем GPT Logger
import { gptLog, gptLogSuccess, gptLogInfo } from './gptLogger';

const app = document.querySelector<HTMLDivElement>('#app')!;

gptLogSuccess('🚀 Atlas Debug Suite initialized', ['init', 'startup']);

// Создаем простую демо-страницу
const demoContainer = document.createElement('div');
demoContainer.style.cssText = `
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
  color: #fff;
`;

const title = document.createElement('h1');
title.textContent = '⚡ Atlas Debug Suite';
title.style.cssText = 'font-size: 3em; margin-bottom: 20px;';

const subtitle = document.createElement('p');
subtitle.textContent = 'Visual Logging Panel - Try the console API!';
subtitle.style.cssText = 'font-size: 1.2em; opacity: 0.9; margin-bottom: 30px;';

const buttonContainer = document.createElement('div');
buttonContainer.style.cssText = 'display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin: 30px 0;';

const createButton = (text: string, onClick: () => void) => {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText = `
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.3s;
  `;
  btn.onmouseenter = () => {
    btn.style.background = 'rgba(255, 255, 255, 0.3)';
    btn.style.transform = 'translateY(-2px)';
  };
  btn.onmouseleave = () => {
    btn.style.background = 'rgba(255, 255, 255, 0.2)';
    btn.style.transform = 'translateY(0)';
  };
  btn.onclick = onClick;
  return btn;
};

buttonContainer.appendChild(createButton('📝 Info', () => {
  gptLogInfo('This is an info message', ['demo', 'info']);
}));

buttonContainer.appendChild(createButton('✅ Success', () => {
  gptLogSuccess('Operation completed!', ['demo', 'success']);
}));

buttonContainer.appendChild(createButton('⚠️ Warning', () => {
  gptLog('Warning message', 'warning', ['demo', 'warning']);
}));

buttonContainer.appendChild(createButton('❌ Error', () => {
  gptLog('Error occurred!', 'error', ['demo', 'error']);
}));

buttonContainer.appendChild(createButton('🏷️ With Tags', () => {
  gptLog('Message with tags', 'info', ['game', 'shard', 'progress']);
}));

buttonContainer.appendChild(createButton('📦 Object', () => {
  gptLog({
    user: 'John',
    score: 1234,
    level: 5
  }, 'success', ['demo', 'data']);
}));

buttonContainer.appendChild(createButton('📋 Copy', () => {
  if (window.gptLogCopy) {
    window.gptLogCopy();
  }
}));

buttonContainer.appendChild(createButton('📥 Export', () => {
  if (window.gptLogExport) {
    window.gptLogExport();
  }
}));

const consoleExample = document.createElement('div');
consoleExample.style.cssText = `
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  margin-top: 30px;
  text-align: left;
  font-family: 'Monaco', monospace;
  font-size: 0.9em;
`;
consoleExample.innerHTML = `
  <h3 style="margin-bottom: 10px;">💡 Try in console:</h3>
  <pre style="overflow-x: auto;">gptLog('Hello from console!')
gptLogInfo('Info', ['tag1', 'tag2'])
gptLogSuccess('Success!', ['achievement'])
gptLogCopy()   // Copy visible logs
gptLogExport() // Export logs
gptLogClear()  // Clear logs</pre>
  <p style="margin-top: 15px; opacity: 0.9;"><strong>New:</strong> Use filter buttons (ALL, INFO, SUCCESS, WARNING, ERROR) in the log panel to filter logs by level!</p>
`;

demoContainer.appendChild(title);
demoContainer.appendChild(subtitle);
demoContainer.appendChild(buttonContainer);
demoContainer.appendChild(consoleExample);

app.appendChild(demoContainer);

gptLogSuccess('✅ Demo page loaded', ['init', 'ready']);
gptLogInfo('💡 Tip: Open console and try gptLog() functions!', ['tip']);
