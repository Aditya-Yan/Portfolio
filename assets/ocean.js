// Move the original buttons; their existing game, gallery, rank and toast listeners stay intact.
const scatter = document.createElement('div');
scatter.className = 'easter-scatter';
scatter.setAttribute('role', 'group');
scatter.setAttribute('aria-label', 'A few surprises beyond the code');
const items = [
  ['ball', 'Take a shot'], ['game', 'Play a 15-second aim test'],
  ['food', 'Open the food gallery'], ['book', 'One more chapter'],
  ['valorant', 'Reveal my Valorant rank']
];
items.forEach(([name, label]) => {
  const button = document.querySelector('.decor-' + name);
  button.classList.add('egg-object');
  button.title = label;
  button.setAttribute('aria-label', label);
  button.querySelector('span').textContent = 'Click me';
  scatter.append(button);
});
document.querySelector('.hub').append(scatter);
