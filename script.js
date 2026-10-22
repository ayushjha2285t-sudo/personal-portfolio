/* Portfolio behaviour: mobile menu, theme toggle, project search/filter. */

(function () {
  const nav = document.getElementById("primary-nav");
  const navToggle = document.getElementById("nav-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const searchInput = document.getElementById("project-search");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");
  const status = document.getElementById("filter-status");
  const placeholderLinks = document.querySelectorAll("[data-placeholder-link]");

  const THEME_KEY = "ayush-portfolio-theme";

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    const isDark = theme === "dark";
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggle.querySelector(".theme-toggle-icon").textContent = isDark
      ? "☀️"
      : "🌙";
    themeToggle.querySelector(".theme-toggle-text").textContent = isDark
      ? "Light"
      : "Dark";
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  function toggleNav() {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function currentFilter() {
    const active = document.querySelector(".filter-btn.is-active");
    return active ? active.dataset.filter : "all";
  }

  function applyProjectFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const filter = currentFilter();
    let visible = 0;

    cards.forEach(function (card) {
      const category = card.dataset.category;
      const haystack = (
        card.dataset.search +
        " " +
        card.textContent
      ).toLowerCase();
      const matchesFilter = filter === "all" || category === filter;
      const matchesSearch = query === "" || haystack.indexOf(query) !== -1;
      const show = matchesFilter && matchesSearch;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
      }
    });

    if (visible === 0) {
      status.textContent = "No projects match this search or filter.";
    } else if (query || filter !== "all") {
      status.textContent =
        visible + (visible === 1 ? " project shown." : " projects shown.");
    } else {
      status.textContent = "";
    }
  }

  navToggle.addEventListener("click", toggleNav);

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  themeToggle.addEventListener("click", function () {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    setTheme(next);
  });

  searchInput.addEventListener("input", applyProjectFilters);

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      applyProjectFilters();
    });
  });

  // Placeholder links must not pretend to be live pages.
  placeholderLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
    });
  });

  initTheme();
  applyProjectFilters();
  // Portfolio AI Chatbot
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const message = chatInput.value.trim();
      if (!message) return;

      const userMessage = document.createElement("p");
      userMessage.textContent = "You: " + message;
      chatMessages.appendChild(userMessage);

      chatInput.value = "";

      const loading = document.createElement("p");
      loading.textContent = "AI: Thinking...";
      chatMessages.appendChild(loading);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        loading.textContent = response.ok
          ? "AI: " + data.reply.replace(/\*\*/g, "")
          : "AI: " + (data.error || "Something went wrong.");
      } catch (error) {
        loading.textContent = "AI: Could not connect. Please try again.";
      }
    });
  }})();
