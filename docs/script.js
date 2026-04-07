// --- Screenshot Slideshow ---
(function () {
  const slides = document.querySelectorAll("#preview-slideshow img");
  const dots = document.querySelectorAll("#preview-dots button");
  let current = 0;
  let interval;

  function goTo(index) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = index;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function startAuto() {
    interval = setInterval(next, 4000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      clearInterval(interval);
      goTo(i);
      startAuto();
    });
  });

  startAuto();
})();

// --- Scroll animations ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);

document
  .querySelectorAll(".animate-on-scroll")
  .forEach((el) => observer.observe(el));

// --- Navbar background on scroll ---
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    navbar.style.background = "rgba(9, 9, 11, 0.95)";
  } else {
    navbar.style.background = "rgba(9, 9, 11, 0.8)";
  }
});

// --- Smart Download Button (OS Detection) ---
function getOS() {
  const ua = navigator.userAgent || navigator.platform || "";
  if (/Win/i.test(ua)) return "windows";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "linux";
  if (/Mac/i.test(ua)) return "macos";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  return "other";
}

document.getElementById("smart-download-btn").addEventListener("click", (e) => {
  e.preventDefault();
  const os = getOS();
  if (os === "windows") {
    window.location.href =
      "https://github.com/Machiamelli/Algo-Compare/releases/latest/download/AlgoCompare-Setup-1.0.0.exe";
  } else if (os === "linux") {
    window.location.href =
      "https://github.com/Machiamelli/Algo-Compare/releases/latest/download/AlgoCompare-1.0.0.AppImage";
  } else {
    // Scroll to the download section for unsupported OS
    document.getElementById("download").scrollIntoView({ behavior: "smooth" });
  }
});

// --- Copy buttons ---
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-copy");
    navigator.clipboard.writeText(text).then(() => {
      const svg = btn.querySelector("svg");
      const original = svg.innerHTML;
      svg.innerHTML =
        '<polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      btn.classList.add("copied");
      setTimeout(() => {
        svg.innerHTML = original;
        btn.classList.remove("copied");
      }, 2000);
    });
  });
});
