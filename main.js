// ---------- Editable wedding config ----------
const WEDDING_CONFIG = {
  coupleNames: "Felix & Merjorie",
  dateMonth: "NOVEMBER",
  dateDay: "07",
  dateYear: "2026",
  dateMeta: "SATURDAY  |  4:00 PM",
  venue: "At the Ezdan Palace Hotel, Qatar",
  audioSrc: "audio/wedding-song.mp3",
  waveformBars: 40,
};

function applyConfig() {
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set("coupleNames", WEDDING_CONFIG.coupleNames);
  set("dateMonth", WEDDING_CONFIG.dateMonth);
  set("dateDay", WEDDING_CONFIG.dateDay);
  set("dateYear", WEDDING_CONFIG.dateYear);
  set("dateMeta", WEDDING_CONFIG.dateMeta);
  set("venueLine", WEDDING_CONFIG.venue);
}

// ---------- Fade-up on scroll ----------
function initFadeUp() {
  const items = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => observer.observe(item));
}

// ---------- Falling petals & leaves ----------
function buildPetals() {
  const container = document.querySelector(".petals");
  if (!container) return;
  const types = ["petal--blush", "petal--rose", "petal--burgundy", "petal--leaf"];
  const count = 7;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("div");
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 11 + Math.round(Math.random() * 6);
    const duration = 14 + Math.random() * 12;
    const delay = Math.random() * duration;
    const left = Math.random() * 100;

    petal.className = `petal ${type}`;
    petal.style.left = left + "vw";
    petal.style.width = size + "px";
    petal.style.height = size * 1.4 + "px";
    petal.style.animationDuration = duration.toFixed(1) + "s";
    petal.style.animationDelay = "-" + delay.toFixed(1) + "s";

    const shape = document.createElement("div");
    shape.className = "petal-shape";
    petal.appendChild(shape);

    container.appendChild(petal);
  }
}

// ---------- Cursor petal trail ----------
function initCursorTrail() {
  if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch devices

  const types = ["petal--blush", "petal--rose", "petal--burgundy", "petal--leaf"];
  let lastSpawn = 0;
  const minInterval = 90; // ms between spawns

  function spawnTrailPetal(x, y) {
    const petal = document.createElement("div");
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 7 + Math.round(Math.random() * 6);
    const driftX = (Math.random() - 0.5) * 60;
    const rotateEnd = (Math.random() - 0.5) * 240;

    petal.className = `cursor-petal ${type}`;
    petal.style.left = x + "px";
    petal.style.top = y + "px";
    petal.style.width = size + "px";
    petal.style.height = size * 1.4 + "px";
    petal.style.setProperty("--driftX", driftX + "px");
    petal.style.setProperty("--rotateEnd", rotateEnd + "deg");

    const shape = document.createElement("div");
    shape.className = "petal-shape";
    petal.appendChild(shape);

    document.body.appendChild(petal);
    petal.addEventListener("animationend", () => petal.remove());
  }

  document.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastSpawn < minInterval) return;
    lastSpawn = now;
    spawnTrailPetal(e.clientX, e.clientY);
  });
}

// ---------- Waveform ----------
function buildWaveform() {
  const wf = document.getElementById("waveform");
  if (!wf) return;
  for (let i = 0; i < WEDDING_CONFIG.waveformBars; i++) {
    const bar = document.createElement("span");
    const h = 8 + Math.round(Math.random() * 32);
    bar.style.height = h + "px";
    bar.style.animationDelay = (Math.random() * 1).toFixed(2) + "s";
    wf.appendChild(bar);
  }
}

// ---------- Music player ----------
function initPlayer() {
  const audio = document.getElementById("weddingAudio");
  const playBtn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const pauseIcon = document.getElementById("pauseIcon");
  const waveform = document.getElementById("waveform");
  const repeatBtn = document.getElementById("repeatBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let isPlaying = false;
  let userPaused = false;

  audio.loop = true;

  function setPlayingState(playing) {
    isPlaying = playing;
    playIcon.style.display = playing ? "none" : "block";
    pauseIcon.style.display = playing ? "block" : "none";
    waveform.classList.toggle("playing", playing);
  }

  function tryPlay() {
    if (userPaused) return;
    audio.play().then(() => setPlayingState(true)).catch(() => {
      // even muted autoplay was blocked: wait for first user interaction
    });
  }

  // Browsers block unmuted autoplay with no prior interaction, but they always
  // allow MUTED autoplay. Start muted, then kick off playback once the
  // envelope's flower entrance animation finishes so it lines up with the reveal.
  audio.muted = true;
  audio.autoplay = true;
  // Matches the flower's zoom-in entrance (0.05s delay + 0.85s duration) in css/style.css.
  // A timer is used instead of an animationend listener because the CSS animation can
  // start painting before this script runs, which would make the event fire too early to catch.
  setTimeout(tryPlay, 900);

  const autoplayEvents = ["click", "touchstart", "keydown", "scroll", "mousemove"];
  function unlockAutoplay() {
    audio.muted = false;
    if (!isPlaying) tryPlay();
    autoplayEvents.forEach((evt) => document.removeEventListener(evt, unlockAutoplay));
  }
  autoplayEvents.forEach((evt) => document.addEventListener(evt, unlockAutoplay, { once: true, passive: true }));

  playBtn.addEventListener("click", () => {
    if (!isPlaying) {
      userPaused = false;
      audio.play().catch(() => {
        // missing/blocked audio: still toggle visual state gracefully
      });
      setPlayingState(true);
    } else {
      userPaused = true;
      audio.pause();
      setPlayingState(false);
    }
  });

  audio.addEventListener("ended", () => setPlayingState(false));

  repeatBtn.addEventListener("click", () => repeatBtn.classList.toggle("active"));
  shuffleBtn.addEventListener("click", () => shuffleBtn.classList.toggle("active"));
  prevBtn.addEventListener("click", () => {
    audio.currentTime = 0;
  });
  nextBtn.addEventListener("click", () => {
    audio.currentTime = 0;
  });
}

// ---------- RSVP flow (modal popup) ----------
function initRSVP() {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const yesForm = document.getElementById("yesForm");
  const noForm = document.getElementById("noForm");
  const overlay = document.getElementById("modalOverlay");
  const backdrop = document.getElementById("modalBackdrop");
  const closeYesBtn = document.getElementById("closeYesForm");
  const closeNoBtn = document.getElementById("closeNoForm");

  function openModal(section) {
    overlay.hidden = false;
    section.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      section.classList.add("modal-visible");
    });
  }

  function closeModal() {
    yesForm.classList.remove("modal-visible");
    noForm.classList.remove("modal-visible");
    document.body.style.overflow = "";
    setTimeout(() => {
      overlay.hidden = true;
      yesForm.hidden = true;
      noForm.hidden = true;
    }, 300);
  }

  yesBtn.addEventListener("click", () => {
    yesBtn.classList.add("active");
    noBtn.classList.remove("active");
    noForm.hidden = true;
    openModal(yesForm);
  });

  noBtn.addEventListener("click", () => {
    noBtn.classList.add("active");
    yesBtn.classList.remove("active");
    yesForm.hidden = true;
    openModal(noForm);
  });

  closeYesBtn.addEventListener("click", closeModal);
  closeNoBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });
}

// ---------- Toast ----------
function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

// ---------- Form submissions ----------
function initForms() {
  const rsvpForm = document.getElementById("rsvpForm");
  const regretForm = document.getElementById("regretForm");

  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast();
    rsvpForm.reset();
    document.getElementById("closeYesForm").click();
  });

  regretForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast();
    regretForm.reset();
    document.getElementById("closeNoForm").click();
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  buildPetals();
  buildWaveform();
  initFadeUp();
  initPlayer();
  initRSVP();
  initForms();
  initCursorTrail();
});
