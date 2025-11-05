// Atlas Debug Suite - Demo
import './style.css';
import './gptLogger'; // Инициализируем GPT Logger
import { 
  gptLog, 
  gptLogSuccess, 
  gptLogInfo,
  gptLogGroup,
  gptLogGroupEnd,
  gptTimer,
  gptTimerEnd,
  gptAIDialog
} from './gptLogger';

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
    level: 5,
    achievements: ['first', 'legendary'],
    settings: {
      theme: 'dark',
      sound: true,
      notifications: false
    }
  }, 'success', ['demo', 'data']);
}));

buttonContainer.appendChild(createButton('📁 Group', () => {
  gptLogGroup('Demo Group');
  gptLogInfo('First log in group', ['group']);
  gptLogSuccess('Second log', ['group']);
  setTimeout(() => gptLogGroupEnd('Demo Group'), 100);
}));

buttonContainer.appendChild(createButton('⏱️ Timer', () => {
  gptTimer('demo-task');
  setTimeout(() => {
    gptTimerEnd('demo-task');
  }, Math.random() * 1000 + 500);
}));

buttonContainer.appendChild(createButton('🤖 AI Dialog', () => {
  gptAIDialog(
    'What is the weather?',
    'The weather is sunny, 25°C',
    Math.floor(Math.random() * 2000 + 500)
  );
}));

// Функция для красивого логирования импульсов
function logPulse(x: number, y: number, z: number, intensity: number, color: string, type: string) {
  const pulseData = {
    position: { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) },
    intensity: intensity.toFixed(2),
    color: color,
    type: type,
    timestamp: new Date().toISOString()
  };
  
  const level = intensity > 0.7 ? 'success' : intensity > 0.4 ? 'info' : 'warning';
  gptLog(`⚡ Pulse ${type}`, level, ['pulse', type.toLowerCase()]);
  gptLog(pulseData, level, ['pulse', 'data']);
}

// Делаем функцию доступной глобально для консоли
declare global {
  interface Window {
    logPulse: typeof logPulse;
  }
}
window.logPulse = logPulse;

buttonContainer.appendChild(createButton('⚡ Random Pulse', () => {
  const x = (Math.random() - 0.5) * 20;
  const y = (Math.random() - 0.5) * 20;
  const z = (Math.random() - 0.5) * 20;
  const intensity = Math.random();
  const colors = ['#4F46E5', '#F59E0B', '#EC4899', '#10B981'];
  const types = ['Energy', 'Signal', 'Wave', 'Quantum'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  
  logPulse(x, y, z, intensity, color, type);
}));

buttonContainer.appendChild(createButton('🌊 Pulse Wave', () => {
  gptLogGroup('⚡ Pulse Wave Sequence');
  gptTimer('pulse-wave');
  
  const colors = ['#4F46E5', '#7C3AED', '#C026D3', '#DB2777'];
  const positions = [
    { x: 10, y: 0, z: 0, type: 'Primary', intensity: 0.9 },
    { x: 5, y: 5, z: 5, type: 'Secondary', intensity: 0.7 },
    { x: -5, y: -5, z: 5, type: 'Tertiary', intensity: 0.6 },
    { x: 0, y: 10, z: 0, type: 'Resonance', intensity: 0.8 }
  ];
  
  positions.forEach((pos, i) => {
    setTimeout(() => {
      logPulse(pos.x, pos.y, pos.z, pos.intensity, colors[i % colors.length], pos.type);
      if (i === positions.length - 1) {
        setTimeout(() => {
          gptTimerEnd('pulse-wave');
          gptLogSuccess('🌊 Pulse wave sequence complete', ['pulse', 'wave', 'complete']);
          gptLogGroupEnd('⚡ Pulse Wave Sequence');
        }, 100);
      }
    }, i * 200);
  });
}));

buttonContainer.appendChild(createButton('💥 Pulse Burst', () => {
  gptLogGroup('💥 Pulse Burst Event');
  
  const burstCount = 5;
  const types = ['Neural', 'Quantum', 'Energy', 'Signal', 'Wave'];
  
  for (let i = 0; i < burstCount; i++) {
    setTimeout(() => {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      const intensity = 0.5 + Math.random() * 0.5;
      const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
      const type = types[i % types.length];
      
      logPulse(x, y, z, intensity, color, type);
      
      if (i === burstCount - 1) {
        setTimeout(() => {
          gptLogSuccess(`💥 Burst complete: ${burstCount} pulses generated`, ['pulse', 'burst', 'complete']);
          gptLogGroupEnd('💥 Pulse Burst Event');
        }, 100);
      }
    }, i * 150);
  }
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
  <pre style="overflow-x: auto;">// Basic logging
gptLog('Hello from console!')
gptLogInfo('Info', ['tag1', 'tag2'])
gptLogSuccess('Success!', ['achievement'])

// Advanced features
gptLogGroup('My Group')
gptTimer('task-name')
gptTimerEnd('task-name')
gptAIDialog('Prompt', 'Response', 1234)

// Pulse logging
logPulse(10, 5, -3, 0.85, '#4F46E5', 'Energy')

// Utilities
gptLogCopy()   // Copy visible logs (Ctrl+Shift+C)
gptLogExport() // Export logs (Ctrl+E)
gptLogClear()  // Clear logs (Ctrl+L)</pre>
  <p style="margin-top: 15px; opacity: 0.9;">
    <strong>✨ Features:</strong> Click tags to filter • Toggle theme (🌙) • Keyboard shortcuts • Collapsible objects • Groups • Timers • AI dialogs • <strong>⚡ Pulse logging</strong>
  </p>
`;

demoContainer.appendChild(title);
demoContainer.appendChild(subtitle);
demoContainer.appendChild(buttonContainer);
demoContainer.appendChild(consoleExample);

app.appendChild(demoContainer);

gptLogSuccess('✅ Demo page loaded', ['init', 'ready']);
gptLogInfo('💡 Tip: Open console and try gptLog() functions!', ['tip']);
