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

  /* ---------- Hero: drifting photographs that dissolve into each other ---------- */
  var hero = document.querySelector(".hero");
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".slide"));
  var SHOW = 7500, FADE = 2000, current = 0, timer = null;
  hero.style.setProperty("--drift", (SHOW + FADE + 600) + "ms");

  function hydrate(slide) {
    slide.querySelectorAll("[data-srcset]").forEach(function (el) { el.srcset = el.dataset.srcset; el.removeAttribute("data-srcset"); });
    slide.querySelectorAll("img[data-src]").forEach(function (el) { el.src = el.dataset.src; el.removeAttribute("data-src"); });
  }
  // Size the photo to cover the frame, then set the start and end of its slow camera move
  function layout(slide) {
    var img = slide.querySelector("img");
    if (!img.naturalWidth) return false;
    var fw = hero.clientWidth, fh = hero.clientHeight;
    var s = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var from = slide.dataset.from.split(",").map(Number), to = slide.dataset.to.split(",").map(Number);
    var st = slide.style;
    st.setProperty("--w", w + "px"); st.setProperty("--h", h + "px");
    st.setProperty("--x0", (fw - w) * from[0] + "px"); st.setProperty("--y0", (fh - h) * from[1] + "px"); st.setProperty("--s0", from[2]);
    st.setProperty("--x1", (fw - w) * to[0] + "px");   st.setProperty("--y1", (fh - h) * to[1] + "px");   st.setProperty("--s1", to[2]);
    slide.classList.add("is-laid");
    return true;
  }
  function startMove(slide) {
    if (reduced || !layout(slide)) return;
    slide.classList.remove("is-moving"); void slide.offsetWidth; slide.classList.add("is-moving");
  }
  function showSlide(next) {
    var prev = slides[current], slide = slides[next];
    if (slide === prev) return;
    startMove(slide);
    prev.classList.remove("is-active"); prev.classList.add("is-prev"); prev.setAttribute("aria-hidden", "true");
    slide.classList.add("is-active"); slide.removeAttribute("aria-hidden");
    setTimeout(function () { prev.classList.remove("is-prev", "is-moving"); }, FADE + 100);
    current = next;
  }
  function advance() {
    var next = (current + 1) % slides.length, img = slides[next].querySelector("img");
    hydrate(slides[next]);
    var ready = img.decode ? img.decode() : Promise.resolve();
    ready.then(function () { showSlide(next); }, function () { /* not loaded yet: keep the current photo */ })
      .then(function () { hydrate(slides[(next + 1) % slides.length]); schedule(); });
  }
  function schedule() { clearTimeout(timer); if (!reduced && !document.hidden && inView) timer = setTimeout(advance, SHOW); }

  var inView = true, first = slides[0].querySelector("img");
  function begin() {
    startMove(slides[0]);
    hero.classList.add("is-ready");
    setTimeout(function () { hydrate(slides[1]); }, 400);   // the next photo loads only after the first is showing
    schedule();
  }
  if (first.complete && first.naturalWidth) begin(); else first.addEventListener("load", begin, { once: true });

  function syncPause() {
    var paused = document.hidden || !inView;
    hero.classList.toggle("is-paused", paused);
    if (paused) clearTimeout(timer); else schedule();
  }
  document.addEventListener("visibilitychange", syncPause);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { inView = e[0].isIntersecting; syncPause(); }, { threshold: 0.05 }).observe(hero);
  }
  var rz;
  window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { slides.forEach(function (s) { if (s.classList.contains("is-laid")) layout(s); }); }, 150); });

  /* ---------- Scroll-in ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    var groups = [".work-head", ".proof-list li", ".enq-info", ".quote-form"];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (c) { return c.matches(sel); });
        el.style.setProperty("--d", Math.min(sibs.indexOf(el), 4) * 110 + "ms");
        el.classList.add("rv"); io.observe(el);
      });
    });
  }

  /* ---------- Our work: a strip of photographs that drifts slowly; drag, swipe or scroll to move it ---------- */
  var strip = document.querySelector(".strip");
  if (strip) {
    var track = strip.querySelector(".strip-track"), auto = !reduced, seenStrip = false, held = false, pos = 0, last = 0;
    if (auto) {                      // duplicate the photos so the drift can loop without a jump
      Array.prototype.slice.call(track.children).forEach(function (n) { var c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.alt = ""; track.appendChild(c); });
    }
    function half() { return track.scrollWidth / 2; }
    function frame(t) {
      if (auto && seenStrip && !held && !document.hidden) {
        var dt = Math.min(t - last, 50); pos = strip.scrollLeft + dt * 0.035;
        if (pos >= half()) pos -= half();
        strip.scrollLeft = pos;
      }
      last = t; requestAnimationFrame(frame);
    }
    if (auto) requestAnimationFrame(frame);
    var resume;
    function hold() { held = true; clearTimeout(resume); }
    function release() { clearTimeout(resume); resume = setTimeout(function () { held = false; }, 2500); }
    ["pointerdown", "touchstart", "wheel", "focusin", "mouseenter"].forEach(function (e) { strip.addEventListener(e, hold, { passive: true }); });
    ["pointerup", "touchend", "mouseleave", "focusout"].forEach(function (e) { strip.addEventListener(e, release, { passive: true }); });
    strip.addEventListener("wheel", release, { passive: true });
    var down = null;               // mouse drag
    strip.addEventListener("mousedown", function (e) { down = { x: e.pageX, s: strip.scrollLeft }; strip.classList.add("dragging"); });
    window.addEventListener("mousemove", function (e) { if (down) strip.scrollLeft = down.s - (e.pageX - down.x); });
    window.addEventListener("mouseup", function () { down = null; strip.classList.remove("dragging"); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { seenStrip = e[0].isIntersecting; }, { threshold: 0.1 }).observe(strip); else seenStrip = true;
  }

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
    var v = function (n) { var el = form.elements[n]; return ((el && el.value) || "").trim(); };
    return [
      "Name: " + v("name"), "Phone: " + v("phone"), "Email: " + v("email"),
      "Site: " + v("site"), "Required from: " + (v("start") || "-"),
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
