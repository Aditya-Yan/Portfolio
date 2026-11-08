// One contained shot: spawn the hoop, arc the existing ball through it, then clean up.
let basketballBusy = false;
async function shootBasketball(button) {
  if (basketballBusy) return;
  basketballBusy = true;
  const original = button.querySelector('svg');
  const layer = document.createElement('div');
  layer.className = 'basketball-scene';
  layer.setAttribute('aria-hidden', 'true');
  const source = original.getBoundingClientRect();
  const rimX = Math.min(innerWidth - 90, Math.max(90, source.left + (source.left < innerWidth / 2 ? 190 : -170)));
  const rimY = Math.max(90, Math.min(innerHeight - 100, Math.max(150, source.top + 35)));
  const hoop = document.createElement('div');
  hoop.className = 'basketball-hoop';
  hoop.style.left = `${rimX - 80}px`;
  hoop.style.top = `${rimY - 78}px`;
  hoop.innerHTML = `<svg viewBox="0 0 160 160" fill="none"><rect x="36" y="8" width="100" height="62" rx="4" fill="#dce9e6" fill-opacity=".95" stroke="#94b7bd" stroke-width="3"/><path d="M70 40h40v28H70z" stroke="#dd8150" stroke-width="3"/><path class="basketball-net" d="m45 79 12 47h46l12-47M55 81l17 45M69 82l19 44M87 82l16 44M107 82l-20 44M92 82l-20 44M77 82l-20 44M51 101h58" stroke="#eaf3ec" stroke-width="2"/><ellipse cx="80" cy="78" rx="35" ry="7" stroke="#e78e58" stroke-width="5"/></svg>`;
  const ball = document.createElement('div');
  ball.className = 'basketball-flight';
  ball.style.width = `${source.width}px`; ball.style.height = `${source.height}px`;
  ball.style.left = `${source.left}px`; ball.style.top = `${source.top}px`;
  ball.append(original.cloneNode(true));
  const frontRim = document.createElement('div');
  frontRim.className = 'basketball-front-rim';
  frontRim.style.left = hoop.style.left; frontRim.style.top = hoop.style.top;
  frontRim.innerHTML = '<svg viewBox="0 0 160 160" fill="none"><path d="M45 78c0 10 70 10 70 0" stroke="#e78e58" stroke-width="5"/></svg>';
  layer.append(hoop, ball, frontRim);
  document.body.append(layer);
  original.style.visibility = 'hidden';
  button.setAttribute('aria-busy', 'true');
  button.disabled = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const dx = rimX - source.left - source.width / 2;
    const dy = rimY - source.top - source.height / 2;
    if (reduced) {
      // No traveling animation: show the made basket briefly at its destination.
      ball.style.transform = `translate(${dx}px,${dy + 16}px) scale(.65)`;
      await new Promise(resolve => setTimeout(resolve, 450));
    } else {
      await hoop.animate([{ opacity: 0, scale: .8 }, { opacity: 1, scale: 1 }], { duration: 180, easing: 'ease-out' }).finished;
      const arc = Math.min(180, Math.max(100, rimY - 35));
      await ball.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', offset: 0 },
        { transform: `translate(${dx*.3}px,${Math.min(dy,0)-arc}px) rotate(100deg) scale(.9)`, offset: .35 },
        { transform: `translate(${dx*.8}px,${dy-65}px) rotate(220deg) scale(.73)`, offset: .7 },
        { transform: `translate(${dx}px,${dy}px) rotate(300deg) scale(.65)`, offset: .84 },
        { transform: `translate(${dx}px,${dy+65}px) rotate(360deg) scale(.6)`, opacity: 0, offset: 1 }
      ], { duration: 1050, easing: 'linear', fill: 'forwards' }).finished;
      await hoop.querySelector('.basketball-net').animate([
        { transform: 'translateY(0)' }, { transform: 'translateY(5px)' }, { transform: 'translateY(0)' }
      ], { duration: 200, easing: 'ease-out' }).finished;
      await layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).finished;
    }
    revealEgg('Nothing but net. Back to building.', 2000);
  } catch { /* Resizing or cancelling the visual must never disable the original object. */ }
  finally {
    layer.remove(); original.style.visibility = ''; button.disabled = false;
    button.removeAttribute('aria-busy'); basketballBusy = false;
  }
}
