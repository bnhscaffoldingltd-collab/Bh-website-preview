(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // Year + mobile menu
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var menuBtn = document.querySelector(".menu-btn"), menu = document.getElementById("menu");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
      menuBtn.textContent = open ? "Close" : "Menu";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); menuBtn.textContent = "Menu"; }
    });
  }

  // Gallery
  var PHOTOS = window.BH_PHOTOS || [];
  var LABELS = { residential: "Residential", flats: "Flats & housing", commercial: "Commercial & specialist", roofing: "Roofing" };
  var grid = document.getElementById("jobs");
  if (!grid) return;
  var home = grid.dataset.mode === "featured";
  // Mix the order: first photo of every set, then second photos, and so on
  var seen = {};
  var mixed = PHOTOS.map(function (p, i) { var k = p.label; seen[k] = (seen[k] || 0) + 1; return { p: p, r: seen[k], i: i }; })
    .sort(function (x, y) { return x.r - y.r || x.i - y.i; }).map(function (x) { return x.p; });
  var base = home ? PHOTOS.filter(function (p) { return p.home; }).slice(0, 6) : mixed;
  var shown = base;

  function render(filter) {
    shown = base.filter(function (p) { return filter === "all" || p.category === filter; });
    grid.innerHTML = shown.map(function (p, i) {
      return '<button class="job" data-i="' + i + '" aria-label="' + esc(p.label) + '"><div class="job-img"><img src="' + esc(p.src) + '" alt="' + esc(p.label) + '" loading="lazy">' +
        '<span class="cap">' + esc(p.label) + '</span></div></button>';
    }).join("");
  }
  var start = "all";
  try { var h = location.hash.replace("#", ""); if (LABELS[h]) start = h; } catch (e) {}
  document.querySelectorAll(".filters button").forEach(function (b) {
    b.setAttribute("aria-pressed", b.dataset.f === start);
    b.addEventListener("click", function () {
      document.querySelectorAll(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      render(b.dataset.f);
      try { history.replaceState(null, "", b.dataset.f === "all" ? location.pathname : "#" + b.dataset.f); } catch (e) {}
    });
  });
  render(start);

  // Lightbox: steps through every photo currently shown
  var lb = document.getElementById("lb"), stage = document.getElementById("lbStage"), idx = 0;
  function show(n) {
    idx = (n + shown.length) % shown.length;
    var p = shown[idx], img = stage.querySelector("img");
    img.src = p.src; img.alt = p.label;
    document.getElementById("lbTag").textContent = LABELS[p.category];
    document.getElementById("lbTitle").textContent = p.label;
    var pre = new Image(); pre.src = shown[(idx + 1) % shown.length].src;
  }
  grid.addEventListener("click", function (e) {
    var c = e.target.closest(".job"); if (!c) return;
    show(+c.dataset.i); lb.showModal();
  });
  document.getElementById("lbPrev").onclick = function () { show(idx - 1); };
  document.getElementById("lbNext").onclick = function () { show(idx + 1); };
  document.getElementById("lbClose").onclick = function () { lb.close(); };
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  var sx = null;
  stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
  });
  document.querySelectorAll(".lb-cta a").forEach(function (a) { a.addEventListener("click", function () { lb.close(); }); });
})();
