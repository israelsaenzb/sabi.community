(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Scroll progress bar fallback (used when the browser does
     not support native `animation-timeline: scroll()`).
     --------------------------------------------------------- */
  var supportsScrollTimeline =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("animation-timeline: scroll()");

  var fill = document.getElementById("progressFill");

  function updateProgress() {
    if (!fill) return;
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? scrollTop / height : 0;
    fill.style.width = (pct * 100).toFixed(2) + "%";
  }

  if (!supportsScrollTimeline) {
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* ---------------------------------------------------------
     Feature reveal on scroll + global accent-color sync.
     Each feature section carries its own --accent-a/--accent-b
     via CSS; when it becomes the active section we copy those
     values onto the document root so surrounding chrome
     (scroll cue, focus rings, nav underline) drifts along the
     same blue -> green run as the logo.
     --------------------------------------------------------- */
  var features = Array.prototype.slice.call(document.querySelectorAll(".feature"));

  if ("IntersectionObserver" in window && features.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      // rootMargin shrinks the effective viewport to a thin band around
      // its vertical center, so a feature only counts as "visible" (and
      // triggers its animation) once it crosses roughly the middle of
      // the screen — not the instant it peeks in at the bottom edge.
      { threshold: 0, rootMargin: "-60% 0px -60% 0px" }
    );

    features.forEach(function (el) { revealObserver.observe(el); });

    var accentObserver = new IntersectionObserver(
      function (entries) {
        var best = null;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        });
        if (best) {
          var styles = getComputedStyle(best.target);
          root.style.setProperty("--accent-a", styles.getPropertyValue("--accent-a"));
          root.style.setProperty("--accent-b", styles.getPropertyValue("--accent-b"));
        }
      },
      { threshold: [0.15, 0.3, 0.45, 0.6, 0.75] }
    );

    features.forEach(function (el) { accentObserver.observe(el); });
  } else {
    // No IntersectionObserver support: show everything immediately.
    features.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------------------------------------------------------
     Modals: Contacto / Aviso de privacidad
     --------------------------------------------------------- */
  var openers = document.querySelectorAll("[data-modal-open]");
  var closers = document.querySelectorAll("[data-modal-close]");
  var activeModal = null;
  var lastFocused = null;

  function openModal(id) {
    var modal = document.getElementById("modal-" + id);
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    activeModal = modal;
    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    activeModal = null;
  }

  openers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-modal-open"));
    });
  });

  closers.forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeModal) closeModal();
  });

  /* Simple focus trap while a modal is open */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !activeModal) return;
    var focusable = activeModal.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
