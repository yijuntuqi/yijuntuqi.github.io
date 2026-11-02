import './style.css';
import {
  createIcons,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Move3d,
  Menu,
  X,
  HeartHandshake,
  Mail,
  Copy,
  Printer,
} from 'lucide';
import { initScene } from './scene.js';

const iconSet = {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Move3d,
  Menu,
  X,
  HeartHandshake,
  Mail,
  Copy,
  Printer,
};

function refreshIcons() {
  createIcons({ icons: iconSet, attrs: { 'aria-hidden': 'true' } });
}
refreshIcons();

const sceneDescriptions = [
  '从知识图谱到 RAG，让分散的信息建立联系。',
  '从产品构想到完整交付，让每行代码回应真实需求。',
  '在协作与服务中，让技术保有理解人的温度。',
];

const scene = initScene(document.getElementById('scene-mount'));
const modeButtons = [...document.querySelectorAll('[data-scene-mode]')];
modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const mode = Number(button.dataset.sceneMode);
    modeButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('scene-description').textContent = sceneDescriptions[mode];
    scene?.setMode(mode);
  });
});

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const projectItems = [...document.querySelectorAll('.project-item')];
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;
    filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    projectItems.forEach((item) => {
      const visible = filter === 'all' || item.dataset.category === filter;
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    document.getElementById('filter-empty').hidden = visibleCount > 0;
  });
});

const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
function setMenu(open) {
  siteNav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
  menuToggle.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
  refreshIcons();
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', (event) => {
  const eventPath = event.composedPath();
  if (menuToggle.getAttribute('aria-expanded') === 'true' && !eventPath.includes(siteNav) && !eventPath.includes(menuToggle)) {
    setMenu(false);
  }
});

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

document.getElementById('copy-email').addEventListener('click', async () => {
  const email = '202411109014@mail.bnu.edu.cn';
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
    } else {
      const input = document.createElement('textarea');
      input.value = email;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      if (!copied) throw new Error('copy unavailable');
    }
    showToast('邮箱已复制，期待你的来信。');
  } catch {
    showToast('请手动复制：202411109014@mail.bnu.edu.cn');
  }
});

document.getElementById('print-resume').addEventListener('click', () => window.print());

const hero = document.querySelector('.hero');
let scrollQueued = false;
function updateScrollScene() {
  const progress = Math.max(0, Math.min(1, window.scrollY / Math.max(window.innerHeight, 1)));
  hero.style.setProperty('--scroll', progress.toFixed(3));
  scene?.setScroll(progress);
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateScrollScene);
  }
}, { passive: true });
updateScrollScene();
