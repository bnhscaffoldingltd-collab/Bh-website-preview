(function () {
  var JOBS = window.BH_JOBS || [];
  var LABELS = { residential: "Residential", flats: "Flats & housing", commercial: "Commercial & specialist", roofing: "Roofing" };
  var ARROW = '<svg class="arrow" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11 11 3M5 3h6v6"/></svg>';
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // Year + mobile menu
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-count]").forEach(function (el) { el.textContent = JOBS.length; });
  document.querySelectorAll("[data-photo-count]").forEach(function (el) {
    el.textContent = JOBS.reduce(function (n, j) { return n + j.photos.length; }, 0);
  });
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
  var grid = document.getElementById("jobs");
  if (!grid) return;
  var mode = grid.dataset.mode; // "featured" (homepage) or "all"
  var list = mode === "featured" ? JOBS.filter(function (j) { return j.featured; }).slice(0, 6) : JOBS;
  var countEl = document.getElementById("shown");

  function card(j) {
    var i = JOBS.indexOf(j);
    return '<button class="job" data-i="' + i + '">' +
      '<div class="job-img"><img src="' + esc(j.photos[0]) + '" alt="' + esc(j.title) + '" loading="lazy">' +
      (j.photos.length > 1 ? '<span class="n">' + j.photos.length + ' photos</span>' : '') +
      '<span class="go">' + ARROW + '</span></div>' +
      '<span class="tag">' + esc(j.tag || LABELS[j.category]) + '</span>' +
      '<h3>' + esc(j.title) + '</h3>' +
      (j.location ? '<div class="loc">' + esc(j.location) + '</div>' : '') +
      '<p>' + esc(j.summary) + '</p></button>';
  }
  function render(filter) {
    var shown = list.filter(function (j) { return filter === "all" || j.category === filter; });
    grid.innerHTML = shown.map(card).join("");
    if (countEl) countEl.textContent = shown.length + (shown.length === 1 ? " project" : " projects") + " shown";
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

  // Lightbox
  var lb = document.getElementById("lb");
  var stage = document.getElementById("lbStage"), thumbs = document.getElementById("lbThumbs");
  var cur = null, idx = 0;
  function show(n) {
    var ph = cur.photos;
    idx = (n + ph.length) % ph.length;
    var img = stage.querySelector("img");
    img.src = ph[idx];
    img.alt = cur.title + " — photo " + (idx + 1) + " of " + ph.length;
    var multi = ph.length > 1;
    document.getElementById("lbPrev").hidden = !multi;
    document.getElementById("lbNext").hidden = !multi;
    document.getElementById("lbCounter").textContent = multi ? "Photo " + (idx + 1) + " of " + ph.length : "";
    thumbs.innerHTML = multi ? ph.map(function (src, k) {
      return '<button data-k="' + k + '" aria-label="Photo ' + (k + 1) + '" aria-current="' + (k === idx) + '"><img src="' + esc(src) + '" alt=""></button>';
    }).join("") : "";
    // preload the next photo
    if (multi) { var pre = new Image(); pre.src = ph[(idx + 1) % ph.length]; }
  }
  grid.addEventListener("click", function (e) {
    var c = e.target.closest(".job"); if (!c) return;
    cur = JOBS[+c.dataset.i];
    document.getElementById("lbTag").textContent = (cur.tag || LABELS[cur.category]) + (cur.location ? " · " + cur.location : "");
    document.getElementById("lbTitle").textContent = cur.title;
    document.getElementById("lbSummary").textContent = cur.summary;
    show(0);
    lb.showModal();
  });
  thumbs.addEventListener("click", function (e) { var t = e.target.closest("button"); if (t) show(+t.dataset.k); });
  document.getElementById("lbPrev").onclick = function () { show(idx - 1); };
  document.getElementById("lbNext").onclick = function () { show(idx + 1); };
  document.getElementById("lbClose").onclick = function () { lb.close(); };
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  // swipe on phones
  var sx = null;
  stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (sx === null || cur.photos.length < 2) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
  });
  document.querySelectorAll(".lb-cta a").forEach(function (a) { a.addEventListener("click", function () { lb.close(); }); });
})();
