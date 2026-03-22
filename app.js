const orbs = document.querySelectorAll('[data-orb]');
const cards = document.querySelectorAll('[data-tilt]');

window.addEventListener('pointermove', (event) => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;

  orbs.forEach((orb, index) => {
    const depth = (index + 1) * 18;
    const offsetX = (x - 0.5) * depth;
    const offsetY = (y - 0.5) * depth;
    orb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });
});

cards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 10;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});
