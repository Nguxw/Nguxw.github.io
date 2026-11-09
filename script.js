const languageButton = document.querySelector("#langToggle");
const description = document.querySelector('meta[name="description"]');
const accessDialog = document.querySelector("#access-dialog");
const accessTitle = document.querySelector("#access-title");
const accessDescription = document.querySelector("#access-description");
const accessForm = document.querySelector("#access-form");
const accessKey = document.querySelector("#access-key");
const accessError = document.querySelector("#access-error");
const main = document.querySelector("#main");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
// Set to true to require the access key again before the site is shown.
const accessGateEnabled = false;
const profileMetadata = {
  zh: {
    title: "Xianwei Guo | AI 应用开发与 Agent 工程",
    description: "Xianwei Guo，东南大学软件工程硕士在读，专注 AI 应用开发与 Agent 工程。"
  },
  en: {
    title: "Xianwei Guo | AI Application & Agent Engineering",
    description: "Xianwei Guo, a software engineering master’s student at Southeast University working on AI applications and Agent engineering."
  }
};

const translations = [...document.querySelectorAll("[data-en], [data-en-label], [data-en-alt]")].map((element) => ({
  element,
  text: element.dataset.en === undefined ? undefined : element.textContent,
  label: element.getAttribute("aria-label"),
  alt: element.getAttribute("alt")
}));

function applyLanguage(language) {
  const isEnglish = language === "en";

  document.documentElement.lang = isEnglish ? "en" : "zh-CN";

  for (const { element, text, label, alt } of translations) {
    if (text !== undefined) element.textContent = isEnglish ? element.dataset.en : text;
    if (element.dataset.enLabel) element.setAttribute("aria-label", isEnglish ? element.dataset.enLabel : label);
    if (element.dataset.enAlt) element.setAttribute("alt", isEnglish ? element.dataset.enAlt : alt);
  }

  languageButton.textContent = isEnglish ? "中文" : "English";
  languageButton.lang = isEnglish ? "zh-CN" : "en";

  const profile = profileMetadata[language];
  document.title = main.hidden ? accessTitle.textContent : profile.title;
  description.content = main.hidden ? accessDescription.textContent : profile.description;
}

let language = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
try {
  const savedLanguage = localStorage.getItem("preferred-language");
  if (savedLanguage === "zh" || savedLanguage === "en") language = savedLanguage;
} catch {
  // Browsers can restrict storage. The switch still works for the current page.
}

applyLanguage(language);
languageButton.hidden = false;
languageButton.addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  applyLanguage(language);
  try {
    localStorage.setItem("preferred-language", language);
  } catch {
    // The current page already reflects the selected language.
  }
});

/* ---------- Background dot field ---------- */
const field = (() => {
  const canvas = document.querySelector("#field");
  const context = canvas.getContext("2d");
  const spacing = 26;
  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(performance.now());
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    const t = time / 1000;
    const offsetX = (width % spacing) / 2;
    const offsetY = (height % spacing) / 2;

    for (let y = offsetY; y < height; y += spacing) {
      for (let x = offsetX; x < width; x += spacing) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const near = Math.max(0, 1 - distance / 220);
        const wave = (Math.sin(x * 0.012 + y * 0.008 - t * 0.9) + 1) / 2;
        const push = near * near * 10;
        const px = x + (distance ? (dx / distance) * push : 0);
        const py = y + (distance ? (dy / distance) * push : 0);
        const alpha = 0.07 + wave * 0.06 + near * 0.55;
        context.fillStyle = near > 0.05
          ? `rgba(255, ${Math.round(90 + (1 - near) * 140)}, ${Math.round(31 + (1 - near) * 200)}, ${alpha})`
          : `rgba(237, 236, 232, ${alpha})`;
        const size = 1 + near * 1.4;
        context.fillRect(px - size / 2, py - size / 2, size, size);
      }
    }
  }

  function loop(time) {
    draw(time);
    frame = visible && !reduceMotion.matches ? requestAnimationFrame(loop) : 0;
  }

  function setVisible(next) {
    if (next === visible) return;
    visible = next;
    if (visible && !frame && !reduceMotion.matches) frame = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    if (pointer.x < -1000) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer.tx = -9999; pointer.ty = -9999; });
  document.addEventListener("visibilitychange", () => setVisible(!document.hidden && Number(canvas.style.opacity || 1) > 0));

  resize();
  if (!reduceMotion.matches) frame = requestAnimationFrame(loop);

  return {
    fade(opacity) {
      canvas.style.opacity = String(opacity);
      setVisible(opacity > 0 && !document.hidden);
    }
  };
})();

/* ---------- Tech ticker ---------- */
// The track scrolls by half its width, so a second copy makes the loop seamless.
const tickerTrack = document.querySelector("#ticker-track");
tickerTrack.append(tickerTrack.firstElementChild.cloneNode(true));

/* ---------- Live execution trace ---------- */
function startTrace() {
  const log = document.querySelector("#trace-log");
  const phases = [...document.querySelectorAll("#trace-phases li")];
  const lines = [...log.children];
  const phaseOf = (index) => (index < 5 ? 0 : index < 7 ? 1 : 2);
  const setPhase = (index) => phases.forEach((phase, i) => phase.classList.toggle("is-active", i === index));

  if (reduceMotion.matches) {
    phases.forEach((phase) => phase.classList.add("is-active"));
    return;
  }

  let index = 0;
  function step() {
    if (index === 0) lines.forEach((line) => { line.hidden = true; line.classList.remove("is-new", "is-cursor"); });
    const line = lines[index];
    lines[index - 1]?.classList.remove("is-cursor");
    line.hidden = false;
    line.classList.add("is-new", "is-cursor");
    setPhase(phaseOf(index));
    index += 1;
    const atEnd = index === lines.length;
    const pause = atEnd ? 4200 : line.dataset.tone === "warn" ? 1100 : 420 + Math.random() * 380;
    if (atEnd) index = 0;
    setTimeout(step, pause);
  }
  step();
}

/* ---------- Page interactions (after unlock) ---------- */
function startPage() {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.remove("is-in"));
  const revealer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      revealer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((element) => revealer.observe(element));

  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = navLinks.map((link) => document.querySelector(link.hash));
  const spy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of navLinks) {
        if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((section) => section && spy.observe(section));

  const progress = document.querySelector("#scroll-progress");
  const hero = document.querySelector(".hero");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    const fadeEnd = hero.offsetHeight * 0.9;
    field.fade(Math.max(0, 1 - window.scrollY / fadeEnd).toFixed(3));
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  for (const card of document.querySelectorAll("[data-spotlight]")) {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    });
  }

  const clock = document.querySelector("#clock");
  const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" });
  const tick = () => { clock.textContent = format.format(new Date()); };
  tick();
  setInterval(tick, 15000);

  startTrace();
}

/* ---------- Access gate ---------- */
accessDialog.addEventListener("cancel", (event) => event.preventDefault());

accessKey.addEventListener("input", () => {
  accessKey.removeAttribute("aria-invalid");
  accessError.textContent = "";
});

function unlock({ moveFocus = true } = {}) {
  for (const element of document.querySelectorAll("[data-requires-key]")) {
    element.hidden = false;
  }
  accessForm.reset();
  accessDialog.close();
  accessDialog.classList.remove("is-leaving");
  applyLanguage(language);
  if (moveFocus) main.focus({ preventScroll: true });
  document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
  startPage();
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // This static site uses a client-side gate for casual visitors.
  if (accessKey.value !== "1234") {
    accessKey.removeAttribute("aria-invalid");
    void accessKey.offsetWidth;
    accessKey.setAttribute("aria-invalid", "true");
    accessError.textContent = language === "en" ? "Incorrect access key. Try again." : "密钥不正确，请重试。";
    accessKey.focus();
    accessKey.select();
    return;
  }

  if (reduceMotion.matches) {
    unlock();
    return;
  }
  accessDialog.classList.add("is-leaving");
  setTimeout(unlock, 420);
});

if (accessGateEnabled) {
  accessDialog.showModal();
} else {
  unlock({ moveFocus: false });
}
