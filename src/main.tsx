import { createRoot } from 'react-dom/client';
import App from './ui/App';
import '@fontsource/zcool-kuaile';
import '@fontsource/baloo-2/600.css';
import './styles.css';

// 注：不用 StrictMode——它的双挂载会让 TTS 播报与隐式确认计时器重复触发。
createRoot(document.getElementById('root')!).render(<App />);
