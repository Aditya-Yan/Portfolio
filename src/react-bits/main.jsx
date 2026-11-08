import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Waves from './Waves.jsx';
import './portfolio-waves.css';

// Actual React Bits component, isolated from the existing content and interactions.
const host = document.createElement('div');
host.id = 'react-bits-ocean';
host.dataset.component = 'React Bits / Waves';
document.querySelector('.scene').prepend(host);

function OceanWaves() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const [reduceMotion, setReduceMotion] = useState(reduced.matches);
  const [userPaused, setUserPaused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  useEffect(() => {
    const updatePreference = event => setReduceMotion(event.matches);
    reduced.addEventListener('change', updatePreference);
    const overlay = document.getElementById('panel-overlay');
    const observer = new MutationObserver(() => setPanelOpen(overlay.classList.contains('active')));
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    return () => { reduced.removeEventListener('change', updatePreference); observer.disconnect(); };
  }, []);
  return <>
    <div className="portfolio-waves" aria-hidden="true">
      <Waves lineColor="#5996a5" accentColor="#b9dcd5" spacing={28}
        rotation={-68} amplitude={38} twist={0.65} speed={0.35}
        mouseRadius={130} mouseStrength={0.45} opacity={0.26} fade={0.6}
        dpr={1} intro={false} clickRipple={!reduceMotion}
        mouseInteraction={!reduceMotion} paused={userPaused || reduceMotion || panelOpen} />
    </div>
    <button className="ocean-motion-toggle" hidden={panelOpen || reduceMotion}
      aria-pressed={userPaused} onClick={() => setUserPaused(value => !value)}>
      {userPaused ? 'Play ocean motion' : 'Pause ocean motion'}
    </button>
  </>;
}
createRoot(host).render(<OceanWaves />);
