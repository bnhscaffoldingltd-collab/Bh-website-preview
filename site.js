(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".menu-label").textContent = open ? "Close" : "Menu";
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Hero slideshow ---------- */
  var hero = document.querySelector(".hero");
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".dot"));
  var countEl = hero.querySelector(".slide-count"), textEl = hero.querySelector(".slide-text");
  var DURATION = 7000, current = 0, timer = null, playing = !reduced, userPaused = reduced;
  hero.style.setProperty("--dur", DURATION + "ms");

  // Load later slides only after the first photo has loaded
  function hydrate(slide) {
    slide.querySelectorAll("[data-srcset]").forEach(function (el) { el.srcset = el.dataset.srcset; el.removeAttribute("data-srcset"); });
    slide.querySelectorAll("img[data-src]").forEach(function (el) { el.src = el.dataset.src; el.removeAttribute("data-src"); });
  }
  function hydrateRest() { slides.slice(1).forEach(hydrate); }
  var firstImg = slides[0].querySelector("img");
  if (firstImg.complete) setTimeout(hydrateRest, 300);
  else firstImg.addEventListener("load", function () { setTimeout(hydrateRest, 300); }, { once: true });
  window.addEventListener("load", function () { setTimeout(hydrateRest, 600); });

  function go(n, fromUser) {
    var next = (n + slides.length) % slides.length;
    hydrate(slides[next]);
    slides.forEach(function (s, i) {
      var on = i === next;
      s.classList.toggle("is-active", on);
      if (on) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
    });
    dots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === next);
      d.classList.toggle("is-done", i < next);
      if (i === next) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
    });
    // restart the progress animation on the active dot
    var bar = dots[next].querySelector("span"); bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
    current = next;
    countEl.textContent = "0" + (next + 1) + " / 0" + slides.length;
    textEl.textContent = slides[next].querySelector("figcaption").textContent;
    hero.querySelector(".slide-caption").setAttribute("aria-live", fromUser ? "polite" : "off");
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (playing) timer = setTimeout(function () { go(current + 1); }, DURATION);
  }
  function setPlaying(p) {
    playing = p;
    hero.classList.toggle("is-playing", p);
    var btn = hero.querySelector(".pause");
    btn.setAttribute("aria-label", p ? "Pause slideshow" : "Play slideshow");
    if (p) go(current); else clearTimeout(timer);
  }
  hero.querySelector(".next").addEventListener("click", function () { go(current + 1, true); });
  hero.querySelector(".prev").addEventListener("click", function () { go(current - 1, true); });
  hero.querySelector(".pause").addEventListener("click", function () { userPaused = playing; setPlaying(!playing); });
  dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i, true); }); });
  hero.addEventListener("keydown", function (e) {
    if (e.target.closest("input,textarea")) return;
    if (e.key === "ArrowRight") go(current + 1, true);
    if (e.key === "ArrowLeft") go(current - 1, true);
  });
  // Pause while the tab is hidden or the slideshow is scrolled out of view
  var visible = true;
  function syncAuto() { if (!userPaused) setPlaying(visible && !document.hidden); }
  document.addEventListener("visibilitychange", syncAuto);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncAuto(); }, { threshold: 0.2 }).observe(hero);
  }
  // Pause when keyboard focus is inside the controls, so users are not interrupted
  hero.querySelector(".ctrls").addEventListener("focusin", function () { if (playing) clearTimeout(timer); });
  hero.querySelector(".ctrls").addEventListener("focusout", function () { schedule(); });
  setPlaying(playing);

  /* ---------- Enlarged photo viewer ---------- */
  var viewer = document.getElementById("viewer");
  var vImg = viewer.querySelector(".v-stage img"), vTitle = viewer.querySelector(".v-title"), vCount = viewer.querySelector(".v-count");
  var vPrev = viewer.querySelector(".v-prev"), vNext = viewer.querySelector(".v-next");
  var photos = [], idx = 0, opener = null, title = "";
  function show(n) {
    idx = (n + photos.length) % photos.length;
    vImg.src = photos[idx];
    vImg.alt = title + (photos.length > 1 ? ", photo " + (idx + 1) + " of " + photos.length : "");
    vCount.textContent = photos.length > 1 ? (idx + 1) + " / " + photos.length : "";
  }
  document.querySelectorAll(".proj").forEach(function (card) {
    card.addEventListener("click", function () {
      photos = card.dataset.photos.split("|"); title = card.dataset.title; opener = card;
      vTitle.textContent = title;
      vPrev.hidden = vNext.hidden = photos.length < 2;
      show(0);
      viewer.showModal();
      viewer.querySelector(".v-close").focus();
    });
  });
  vPrev.addEventListener("click", function () { show(idx - 1); });
  vNext.addEventListener("click", function () { show(idx + 1); });
  viewer.querySelector(".v-close").addEventListener("click", function () { viewer.close(); });
  viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener("keydown", function (e) {
    if (photos.length < 2) return;
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
  viewer.addEventListener("close", function () { if (opener) opener.focus(); });
  var sx = null;
  viewer.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (sx === null || photos.length < 2) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
  });

  /* ---------- Quote form ---------- */
  var form = document.getElementById("quote-form"), msg = document.getElementById("form-msg");
  var EMAIL = "ops@bhscaffolding.co.uk";
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clearErrors() {
    form.querySelectorAll(".field.invalid").forEach(function (f) { f.classList.remove("invalid"); });
    form.querySelectorAll(".err").forEach(function (e) { e.remove(); });
  }
  function validate() {
    clearErrors();
    var first = null;
    form.querySelectorAll("[required]").forEach(function (el) {
      var bad = !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      if (bad) {
        var f = el.closest(".field"); f.classList.add("invalid");
        var e = document.createElement("span"); e.className = "err"; e.id = el.id + "-err";
        e.textContent = el.type === "email" && el.value.trim() ? "Enter a valid email address." : "Please fill this in.";
        f.appendChild(e); el.setAttribute("aria-describedby", e.id); el.setAttribute("aria-invalid", "true");
        if (!first) first = el;
      } else { el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); }
    });
    var fileInput = form.elements.files, files = fileInput.files, total = 0;
    for (var i = 0; i < files.length; i++) total += files[i].size;
    if (files.length > 5 || total > 10 * 1024 * 1024) {
      var ff = fileInput.closest(".field"); ff.classList.add("invalid");
      var e2 = document.createElement("span"); e2.className = "err"; e2.textContent = "Please attach up to 5 files, 10 MB in total."; ff.appendChild(e2);
      first = first || fileInput;
    }
    if (first) first.focus();
    return !first;
  }
  function summary() {
    var v = function (n) { return (form.elements[n].value || "").trim(); };
    return [
      "Name: " + v("name"), "Company: " + (v("company") || "-"), "Phone: " + v("phone"), "Email: " + v("email"),
      "Site: " + v("site"), "Required from: " + (v("start") || "-"), "Duration: " + (v("duration") || "-"),
      "", "Scope:", v("scope")
    ].join("\n");
  }
  function showMsg(html, ok) {
    msg.innerHTML = html; msg.hidden = false; msg.classList.toggle("ok", !!ok); msg.focus();
  }
  function offlineMsg() {
    var mail = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Scaffolding enquiry: " + form.elements.site.value.trim()) + "&body=" + encodeURIComponent(summary());
    showMsg(
      "<p><strong>Online sending is not switched on yet.</strong> Your enquiry has not been sent.</p>" +
      "<p>Please send it by email to <strong>" + EMAIL + "</strong> or WhatsApp Harry on <strong>07453 351635</strong>. Attach any photos to your email.</p>" +
      '<div class="msg-actions"><a class="btn btn-dark" href="' + esc(mail) + '">Open in my email app</a>' +
      '<button type="button" class="btn btn-line-dark" id="copy-enq">Copy details</button></div>'
    );
    var copy = document.getElementById("copy-enq");
    copy.className = "btn"; copy.style.border = "1.5px solid #151919";
    copy.addEventListener("click", function () {
      var t = summary();
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () {
        copy.textContent = "Copied";
      }, function () { copy.textContent = "Select and copy the form manually"; });
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    if (form.dataset.live !== "true") { offlineMsg(); return; }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Sending…";
    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          showMsg("<p><strong>Thank you, your enquiry has been sent.</strong> We will reply to the email address you gave.</p>", true);
        } else {
          showMsg("<p><strong>Your enquiry could not be sent.</strong> " + esc(res.j.error || "Please try again, or email " + EMAIL + ".") + "</p>");
        }
      })
      .catch(function () { showMsg("<p><strong>Your enquiry could not be sent.</strong> Please check your connection and try again, or email " + EMAIL + ".</p>"); })
      .then(function () { btn.disabled = false; btn.textContent = "Send enquiry"; });
  });
})();
