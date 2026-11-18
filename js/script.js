/* NISRX — navigation, flag interactions, and profile dossier. */
(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");
  const profileDialog = document.querySelector("#profile-dialog");

  // Keep the navigation fixed and increase its contrast after scrolling.
  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Mobile navigation menu.
  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    mobileNav.hidden = true;
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    mobileNav.hidden = isOpen;
  });

  mobileNav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", event => {
    if (
      mobileNav && !mobileNav.hidden &&
      !mobileNav.contains(event.target) &&
      !menuButton?.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // Underline the navigation link for the section currently in view.
  const navLinks = [...document.querySelectorAll(".desktop-nav a, .mobile-nav a")];
  const sections = ["about", "skills", "timeline", "contact"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach(link => {
        const matches = link.getAttribute("href") === `#${visible.target.id}`;
        if (matches) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, {
      rootMargin: "-18% 0px -62% 0px",
      threshold: [0, 0.15, 0.35, 0.6]
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // Dynamic text update on flag hover.
  const languageStatus = document.querySelector("#language-status");
  const defaultLanguageHTML = languageStatus?.innerHTML || "";

  document.querySelectorAll(".flag-strip").forEach(strip => {
    strip.addEventListener("mouseenter", () => {
      if (languageStatus && strip.dataset.lang) {
        languageStatus.textContent = strip.dataset.lang;
      }
    });
  });

  document.querySelector(".flag-ribbons")?.addEventListener("mouseleave", () => {
    if (languageStatus) {
      languageStatus.innerHTML = defaultLanguageHTML;
    }
  });

  // Open and close the read-only personal identification dossier.
  const openProfile = () => {
    closeMenu();
    if (typeof profileDialog?.showModal === "function") {
      profileDialog.showModal();
      document.body.classList.add("dialog-open");
    }
  };

  const closeProfile = () => {
    if (profileDialog?.open) profileDialog.close();
    document.body.classList.remove("dialog-open");
  };

  document.querySelectorAll("[data-open-profile]").forEach(button => {
    button.addEventListener("click", openProfile);
  });

  document.querySelector("[data-close-profile]")?.addEventListener("click", closeProfile);

  profileDialog?.addEventListener("click", event => {
    if (event.target === profileDialog) closeProfile();
  });

  profileDialog?.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // Light / dark theme toggle (remembers the choice; defaults to dark).
  const root = document.documentElement;
  const themeMeta = document.querySelector("meta[name=theme-color]");
  const applyTheme = theme => {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#0e0f0d" : "#454640");
    document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    });
  };
  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("nisrx-theme", next); } catch (e) {}
    });
  });

  // Timeline: reveal items on scroll and fill the line with progress.
  document.documentElement.classList.add("js");
  const timeline = document.querySelector(".timeline");
  if (timeline) {
    const items = [...timeline.querySelectorAll(".tl-item")];
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible", "is-active"); io.unobserve(e.target); }
      }), { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
      items.forEach(i => io.observe(i));
    } else {
      items.forEach(i => i.classList.add("is-visible", "is-active"));
    }
    const updateProgress = () => {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      timeline.style.setProperty("--tl", p.toFixed(3));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
  }
})();