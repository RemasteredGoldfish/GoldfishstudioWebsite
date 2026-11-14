const en = document.documentElement.lang === 'en';
const motionButton = document.querySelector('#motion-toggle');
const backgroundPlayer = document.querySelector('#background-player');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let backgroundPlaying = false;
function setBackground(playing) {
  backgroundPlayer.replaceChildren();
  if (playing) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://player.mux.com/O00qf5HrTommDuoYh6xIq3GloLj1IM5WqzjtS9aBWOwg?autoplay=muted&muted=true&loop=true&controls=false&playsinline=1';
    iframe.title = 'GoldfishStudio achtergrondfilm';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.tabIndex = -1;
    backgroundPlayer.append(iframe);
  }
  backgroundPlaying = playing;
  motionButton.setAttribute('aria-pressed', String(playing));
  motionButton.setAttribute('aria-label', playing ? (en ? 'Pause background video' : 'Achtergrondfilm pauzeren') : (en ? 'Play background video' : 'Achtergrondfilm afspelen'));
  motionButton.querySelector('.motion-symbol').textContent = playing ? 'Ⅱ' : '▶';
  motionButton.querySelector('.motion-label').textContent = playing ? (en ? 'Pause video' : 'Pauzeer film') : (en ? 'Play video' : 'Speel film');
}
motionButton.addEventListener('click', () => setBackground(!backgroundPlaying));
setBackground(true);
reduceMotion.addEventListener('change', event => { if (event.matches) setBackground(false); });

const dialog = document.querySelector('#film-dialog');
const filmPlayer = document.querySelector('#film-player');
let resumeBackground = false;
document.querySelectorAll('[data-playback]').forEach(button => {
  button.addEventListener('click', () => {
    resumeBackground = backgroundPlaying;
    if (backgroundPlaying) setBackground(false);
    document.querySelector('#film-title').textContent = button.dataset.title;
    document.querySelector('#film-project').href = button.dataset.page;
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.mux.com/${button.dataset.playback}?autoplay=true&controls=true&playsinline=true`;
    iframe.title = button.dataset.title;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    filmPlayer.replaceChildren(iframe);
    dialog.showModal();
    updatePreviews();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  filmPlayer.replaceChildren();
  if (resumeBackground) setBackground(true);
  updatePreviews();
});
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-picture');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.project-film img').forEach(image => observer.observe(image));
}

// Muted previews only run while the project is visible.
const previewToggle = document.querySelector('#previews-toggle');
const visiblePreviews = new Set();
let previewsPlaying = true;
function updatePreviews() {
  document.querySelectorAll('[data-playback]').forEach(button => {
    const shouldPlay = previewsPlaying && visiblePreviews.has(button) && !dialog.open && !document.hidden;
    const existing = button.querySelector('.project-preview');
    if (!shouldPlay) { if (existing) existing.remove(); return; }
    if (existing) return;
    const iframe = document.createElement('iframe');
    iframe.className = 'project-preview';
    iframe.src = `https://player.mux.com/${button.dataset.playback}?autoplay=muted&muted=true&loop=true&controls=false&playsinline=true`;
    iframe.title = `${button.dataset.title} — stille preview`;
    iframe.allow = 'autoplay; encrypted-media';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    button.append(iframe);
  });
}
const previewObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visiblePreviews.add(entry.target);
    else visiblePreviews.delete(entry.target);
  });
  updatePreviews();
}, { threshold: 0.15 });
document.querySelectorAll('[data-playback]').forEach(button => previewObserver.observe(button));
previewToggle.addEventListener('click', () => {
  previewsPlaying = !previewsPlaying;
  previewToggle.setAttribute('aria-pressed', String(previewsPlaying));
  previewToggle.textContent = previewsPlaying ? (en ? 'Ⅱ Pause previews' : 'Ⅱ Pauzeer previews') : (en ? '▶ Play previews' : '▶ Speel previews');
  updatePreviews();
});
document.addEventListener('visibilitychange', updatePreviews);
