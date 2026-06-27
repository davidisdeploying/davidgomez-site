/* David Gomez - Swiss motion layer.
   Progressive enhancement: nothing here runs under reduced-motion, and every
   animated element is fully visible if this script never executes. Uses
   IntersectionObserver only (no scroll listeners). transform/opacity only. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var hasIO = "IntersectionObserver" in window;

  /* ---- 1. Scroll reveals -------------------------------------------------- */
  var revealSel = [
    ".ent", ".pcard", ".proj", ".entry", ".edu", ".skrow",
    ".ccard", ".scard", ".hcard", ".jstage", ".fstep", ".trow",
    ".feature", ".pq", ".section-body",
    ".post-body > p", ".post-body > h2", ".post-body > h3",
    ".post-body > ul", ".post-body > ol", ".post-body > pre",
    ".post-body > blockquote", ".post-body > img"
  ].join(",");
  var labelSel = [
    ".indexsec > h2", ".homemap h2", ".shead .lbl",
    ".section .eyebrow", ".section-title",
    ".whero .eyebrow", ".whero h1", ".wsub", ".rname", ".postdate", ".posttitle"
  ].join(",");

  var reveals = [].slice.call(document.querySelectorAll(revealSel));
  var labels = [].slice.call(document.querySelectorAll(labelSel));
  reveals.forEach(function (el) { el.classList.add("rv"); });
  labels.forEach(function (el) { el.classList.add("rvx"); });

  if (!hasIO) {
    reveals.forEach(function (el) { el.classList.add("rv-in"); });
    labels.forEach(function (el) { el.classList.add("rvx-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains("rvx") ? "rvx-in" : "rv-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    reveals.concat(labels).forEach(function (el) { io.observe(el); });

    /* gentle stagger for siblings inside a grid/list */
    [".idx .ent", ".posts .pcard", ".cust .ccard", ".skills .scard",
     ".hard .hcard", ".jstages .jstage", ".wstats .wstat", ".ptags span",
     ".ebullets li"].forEach(function (sel) {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) {
        els[i].style.transitionDelay = (Math.min(i, 8) * 55) + "ms";
      }
    });
  }

  /* ---- 2. Count-up on stats ---------------------------------------------- */
  if (hasIO) {
    [].slice.call(document.querySelectorAll(".wstat .n, .hnum")).forEach(function (el) {
      var m = el.textContent.trim().match(/^(\d[\d,]*)(.*)$/);
      if (!m) return;                       /* skip non-numeric (Zero, infinity, ~30) */
      var target = parseInt(m[1].replace(/,/g, ""), 10);
      var suffix = m[2];
      var fired = false;
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting || fired) return;
          fired = true; o.unobserve(el); count(el, target, suffix);
        });
      }, { threshold: 0.5 });
      o.observe(el);
    });
  }
  function count(el, target, suffix) {
    var dur = 950, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- 3. Bubble-map stagger pop ----------------------------------------- */
  var bub = document.querySelector(".bubbles");
  if (bub) {
    bub.classList.add("stagger");
    var orbs = bub.querySelectorAll(".orb");
    for (var i = 0; i < orbs.length; i++) {
      var d = (Math.min(i, 32) * 26) + "ms";
      orbs[i].style.transitionDelay = d;
      var c = orbs[i].querySelector("circle");
      if (c) c.style.transitionDelay = d;
    }
    if (!hasIO) {
      bub.classList.add("orbs-in");
    } else {
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { bub.classList.add("orbs-in"); ob.disconnect(); } });
      }, { threshold: 0.15 });
      ob.observe(bub);
    }
  }
})();
