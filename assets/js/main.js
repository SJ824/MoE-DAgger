"use strict";
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.PROJECT_CONFIG || {};
  const data = window.PROJECT_DATA || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dataSaver = Boolean(navigator.connection && navigator.connection.saveData);
  let toastTimer;
  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("show"), 3200);
  }

  // Native dialogs preserve keyboard focus and support Escape to dismiss.
  const resourceDialog = $("#resource-dialog");
  const mediaDialog = $("#media-dialog");
  function openDialog(dialog) {
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }
  function restoreScroll() {
    if (!resourceDialog.open && !mediaDialog.open) document.body.style.overflow = "";
  }
  $$('dialog').forEach(dialog => {
    $(".dialog-close", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", restoreScroll);
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
  function resourceNotice() {
    $("#resource-dialog-title").textContent = "Code release coming soon.";
    $("#resource-dialog-description").textContent = "The source code is planned for a future release. The paper and supplementary video are available now.";
    openDialog(resourceDialog);
  }
  function safeUrl(value) {
    try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
  }
  const arxivUrl = safeUrl(config.arxivUrl);
  const codeUrl = safeUrl(config.codeUrl);
  function activateResource(id, url) {
    const button = $(id);
    if (!url) {
      if (button.tagName !== "A") button.addEventListener("click", resourceNotice);
      return;
    }
    const anchor = document.createElement("a");
    anchor.id = button.id;
    anchor.className = button.className.replace("badge-muted", "");
    anchor.innerHTML = button.innerHTML;
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.removeAttribute("aria-haspopup");
    const status = $("small", anchor);
    if (status) status.textContent = id === "#code-footer" ? "Browse the source code" : "";
    button.replaceWith(anchor);
  }
  activateResource("#arxiv-resource", arxivUrl);
  activateResource("#code-resource", codeUrl);
  activateResource("#code-footer", codeUrl);

  const menuButton = $(".menu-toggle");
  const nav = $("#main-nav");
  function closeMenu() { menuButton.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  $$('a[href^="#"]', nav).forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  if ("IntersectionObserver" in window) {
    const navigationObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$("a", nav).forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-15% 0px -65% 0px" });
    ["overview", "method", "results", "resources"].forEach(id => navigationObserver.observe(document.getElementById(id)));
  }

  // GIFs remain true GIF assets. Only nearby media are loaded; pausing restores
  // a poster. Resuming a GIF restarts that animation from its first frame.
  const animationStates = new Map();
  function setAnimation(frame, play) {
    const state = animationStates.get(frame);
    if (!state) return;
    const wanted = play ? state.image.dataset.gif : state.image.dataset.poster;
    if (state.requestedSrc === wanted) return;
    state.requestedSrc = wanted;
    state.playRequested = play;
    state.playing = false;
    const requestId = ++state.requestId;

    // A reused <img> can keep painting the previous GIF while its next src loads.
    // Replace it immediately and show the selected poster until this request is ready.
    const image = state.image.cloneNode(false);
    image.removeAttribute("src");
    image.loading = "eager";
    image.style.visibility = "hidden";
    state.stage.style.aspectRatio = `${image.width} / ${image.height}`;
    state.stage.style.backgroundImage = `url("${image.dataset.poster}")`;
    state.status.textContent = play ? "Loading animation…" : "";
    state.status.hidden = !play;
    state.stage.setAttribute("aria-busy", String(play));
    state.button.textContent = play ? "Cancel loading" : "Play GIF";
    state.button.setAttribute("aria-label", play ? "Cancel animation loading" : "Play animation from the beginning");
    state.button.setAttribute("aria-pressed", "false");
    frame.classList.toggle("is-paused", !play);
    image.addEventListener("load", () => {
      if (requestId !== state.requestId) return;
      image.style.visibility = "";
      state.playing = play;
      state.status.hidden = true;
      state.stage.setAttribute("aria-busy", "false");
      state.button.textContent = play ? "Pause GIF" : "Play GIF";
      state.button.setAttribute("aria-label", play ? "Pause animation" : "Play animation from the beginning");
      state.button.setAttribute("aria-pressed", String(play));
    }, { once: true });
    image.addEventListener("error", () => {
      if (requestId !== state.requestId) return;
      if (play) {
        state.userPaused = true;
        setAnimation(frame, false);
        toast("The animation could not load. Try Play GIF again.");
      } else {
        state.stage.setAttribute("aria-busy", "false");
        state.status.textContent = "Preview unavailable. Select Play GIF to try the animation.";
        state.status.hidden = false;
      }
    }, { once: true });
    const previousImage = state.image;
    previousImage.replaceWith(image);
    state.image = image;
    previousImage.removeAttribute("src");
    image.src = wanted;
  }
  function canAutoplay(state) { return state.visible && !state.userPaused && !reducedMotion.matches && !dataSaver && !mediaDialog.open && !document.hidden; }
  $$('[data-animation]').forEach(frame => {
    const image = $("img", frame);
    const button = $("[data-toggle-animation]", frame);
    const stage = document.createElement("div");
    stage.className = "animation-stage";
    image.before(stage);
    stage.append(image);
    const status = document.createElement("span");
    status.className = "animation-status";
    status.setAttribute("role", "status");
    status.hidden = true;
    stage.append(status);
    const state = { image, button, stage, status, playing: false, playRequested: false, requestId: 0, requestedSrc: "", visible: false, userPaused: false };
    animationStates.set(frame, state);
    setAnimation(frame, false);
    button.addEventListener("click", () => {
      state.userPaused = state.playRequested;
      setAnimation(frame, !state.playRequested);
    });
    $("[data-expand]", frame).addEventListener("click", event => {
      const image = state.image;
      const dialogImage = $("#media-dialog-image");
      const wasPlaying = state.playing;
      $("#media-dialog-title").textContent = event.currentTarget.dataset.title;
      dialogImage.alt = image.alt;
      dialogImage.dataset.gif = image.dataset.gif;
      dialogImage.dataset.poster = image.dataset.poster;
      dialogImage.dataset.playing = String(wasPlaying);
      dialogImage.src = wasPlaying ? image.dataset.gif : image.dataset.poster;
      $("#dialog-gif-download").href = image.dataset.gif;
      $("#dialog-animation-toggle").textContent = wasPlaying ? "Pause animation" : "Play animation";
      animationStates.forEach((_, otherFrame) => setAnimation(otherFrame, false));
      openDialog(mediaDialog);
    });
  });
  if ("IntersectionObserver" in window) {
    const mediaObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const state = animationStates.get(entry.target);
      state.visible = entry.isIntersecting;
      setAnimation(entry.target, canAutoplay(state));
    }), { rootMargin: "160px 0px", threshold: 0.01 });
    animationStates.forEach((_, frame) => mediaObserver.observe(frame));
  }
  $("#dialog-animation-toggle").addEventListener("click", event => {
    const image = $("#media-dialog-image");
    const play = image.dataset.playing !== "true";
    image.dataset.playing = String(play);
    image.src = play ? image.dataset.gif : image.dataset.poster;
    event.currentTarget.textContent = play ? "Pause animation" : "Play animation";
  });
  mediaDialog.addEventListener("close", () => {
    $("#media-dialog-image").removeAttribute("src");
    animationStates.forEach((state, frame) => setAnimation(frame, canAutoplay(state)));
  });
  document.addEventListener("visibilitychange", () => {
    animationStates.forEach((state, frame) => setAnimation(frame, canAutoplay(state)));
    if (document.hidden) $("#supplementary-video").pause();
  });
  reducedMotion.addEventListener("change", () => animationStates.forEach((state, frame) => setAnimation(frame, canAutoplay(state))));

  const demoFrame = $(".demo-animation");
  const demoData = {
    routing: { slug: "router-probabilities", type: "GREEN · SUCCESSFUL ROLLOUT", title: "Soft routing through the task.", description: "External and wrist views are synchronized with the five phase probabilities and router entropy. The policy blends phase-anchored action heads as the robot progresses through the task.", alt: "Successful Green rollout with external and wrist views, router probabilities, and entropy.", speed: "Source playback speed" },
    entropy: { slug: "high-entropy", type: "GREEN · PARTIAL-PUSH EXAMPLE", title: "Earlier-phase support during withdrawal.", description: "In this partial-push example, the router supports the earlier P0 phase during later withdrawal motion. The elevated entropy accompanies nonlocal support, not simply a normal adjacent handoff. Partial-push detection remains incomplete in the study.", alt: "Green partial-push example: nonlocal P0 support and entropy during withdrawal, shown at half speed.", speed: "0.5× playback · source timing preserved" },
    without: { slug: "without-veto", type: "GREEN · ILLUSTRATIVE COUNTERFACTUAL REPLAY", title: "When a benign handoff becomes a query.", description: "With the transition veto disabled, this successful Green rollout receives illustrative proposals at nominal handoff-local entropy peaks. These replay markers explain the mechanism; they are separate from the active no-veto collection and retraining experiment.", alt: "Illustrative counterfactual replay of a successful Green rollout without the adjacent-transition veto.", speed: "Illustrative replay · source timing preserved" },
    complete: { slug: "complete-rule", type: "RED · COLLISION TRACE / CAUSAL REPLAY", title: "A proposal before collision onset.", description: "The complete acquisition rule replays a Red collision trace and proposes correction before the observed collision onset. The synchronized views show causal entropy, veto eligibility, and proposal timing. This replay does not demonstrate physical recovery.", alt: "Complete-rule causal replay on a Red collision trace, with a correction proposal before collision onset.", speed: "1.5× playback · source timing preserved" },
    causal: { slug: "causal-entropy", type: "RED · NO-CONTACT EXAMPLE", title: "Persistent ambiguity, seen causally.", description: "A close-up of a Red no-contact failure shows persistent P1/P2 ambiguity, causal filtered entropy, and the query and veto states. The gate uses only information available up to the current step.", alt: "Red no-contact example showing causal entropy, persistent P1/P2 ambiguity, and query and veto state, at half speed.", speed: "0.5× playback · source timing preserved" },
    retry: { slug: "red-second-push", type: "RED · TWO SECOND-PUSH ROLLOUTS", title: "Returning for a second push.", description: "The first push does not move the red cube far enough. In these two inference rollouts, the robot returns for a second push. Each row shows one rollout, with synchronized external and wrist views.", alt: "Two Red task rollouts returning for a second push, arranged in a two-by-two grid with one rollout per row, external views on the left and wrist views on the right.", speed: "1× playback · synchronized camera views", width: 1100, height: 700 }
  };
  function selectDemo(name, focus = false) {
    const selected = demoData[name];
    if (!selected) return;
    $$("[data-demo]").forEach(button => {
      const active = button.dataset.demo === name;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      $("[data-demo-action]", button).textContent = active ? "Selected" : "View clip";
      $("[data-demo-indicator]", button).textContent = active ? "✓" : "→";
      if (active) {
        const index = $$("[data-demo]").indexOf(button) + 1;
        const label = button.getAttribute("aria-label").replace(/^\d+\s+/, "");
        $("#demo-selection").textContent = `Selected: ${String(index).padStart(2, "0")} / ${String($$("[data-demo]").length).padStart(2, "0")} · ${label}`;
      }
      if (active && focus) { button.focus(); button.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" }); }
    });
    $("#demo-panel").setAttribute("aria-labelledby", `tab-${name}`);
    $("#demo-type").textContent = selected.type;
    $("#demo-title").textContent = selected.title;
    $("#demo-description").textContent = selected.description;
    $("#demo-speed").textContent = selected.speed;
    const state = animationStates.get(demoFrame);
    state.image.dataset.gif = `assets/gifs/${selected.slug}.gif`;
    state.image.dataset.poster = `assets/images/${selected.slug}.webp`;
    state.image.alt = selected.alt;
    state.image.width = selected.width || 1100;
    state.image.height = selected.height || 619;
    state.userPaused = false;
    $("[data-expand]", demoFrame).dataset.title = selected.title;
    $("#demo-download").href = state.image.dataset.gif;
    setAnimation(demoFrame, canAutoplay(state));
  }
  const tabs = $$("[data-demo]");
  tabs.forEach((button, index) => {
    button.addEventListener("click", () => {
      selectDemo(button.dataset.demo);
      if (window.matchMedia("(max-width: 600px)").matches) {
        $("#demo-panel").scrollIntoView({ block: "start", behavior: reducedMotion.matches ? "instant" : "smooth" });
      }
    });
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectDemo(tabs[next].dataset.demo, true); }
    });
  });

  $$("[data-entropy]").forEach(button => button.addEventListener("click", () => {
    const adjacent = button.dataset.entropy === "adjacent";
    $$("[data-entropy]").forEach(item => {
      const active = item === button;
      item.setAttribute("aria-pressed", String(active));
      $("[data-entropy-action]", item).textContent = active ? "Selected" : "Compare";
      $("[data-entropy-indicator]", item).textContent = active ? "✓" : "→";
    });
    const bars = $$("#probability-bars i");
    bars[1].style.setProperty("--bar-height", adjacent ? "95%" : "3.333%");
    bars[4].style.setProperty("--bar-height", adjacent ? "3.333%" : "95%");
    $("#entropy-title").textContent = adjacent ? "An adjacent handoff." : "Support for a distant phase.";
    $("#entropy-description").textContent = adjacent
      ? "Support is shared by P0 and its legal successor, P1. A locally compatible transition is allowed to settle within a bounded window."
      : "The same entropy now comes from P0 and nonadjacent P4. This support is incompatible with the legal next phase; persistent ambiguity can request correction.";
    const decision = $("#entropy-decision");
    decision.innerHTML = adjacent ? '<span aria-hidden="true">↗</span> Continue while the handoff settles' : '<span aria-hidden="true">↗</span> Query if the ambiguity persists';
    decision.classList.toggle("nonlocal", !adjacent);
    $(".entropy-plot").setAttribute("aria-label", adjacent
      ? "Illustrative distribution: P0 and P1 each have probability 0.475; P2, P3 and P4 each have probability about 0.0167. Normalized entropy is 0.57."
      : "Illustrative distribution: P0 and P4 each have probability 0.475; P1, P2 and P3 each have probability about 0.0167. Normalized entropy remains 0.57.");
  }));

  const results = data.results || [];
  const chartOrder = [7, 5, 6, 2, 4, 3, 1, 0];
  function renderResults(taskIndex) {
    const chart = $("#results-chart");
    chart.setAttribute("aria-label", `Task success by method, ${taskIndex === 0 ? "Green" : "Red"} task`);
    chart.replaceChildren();
    chartOrder.forEach(index => {
      const item = results[index];
      if (!item) return;
      const row = document.createElement("div");
      row.className = "chart-row" + (index === 7 ? " is-ours" : "");
      const value = item.success_percent[taskIndex];
      const ci = item.success_CI[taskIndex];
      const label = document.createElement("div");
      label.className = "chart-label";
      label.textContent = item.method;
      if (index === 7) { const tag = document.createElement("small"); tag.textContent = "OURS"; label.append(tag); }
      const track = document.createElement("div");
      track.className = "chart-track";
      track.setAttribute("aria-hidden", "true");
      const bar = document.createElement("div");
      bar.className = "chart-bar";
      bar.style.setProperty("--value", `${value}%`);
      if (taskIndex === 1 && index !== 7) bar.style.backgroundColor = "#b18d7d";
      const whisker = document.createElement("span");
      whisker.className = "ci-line";
      whisker.style.setProperty("--ci-left", `${ci[0]}%`);
      whisker.style.setProperty("--ci-width", `${ci[1] - ci[0]}%`);
      track.append(bar, whisker);
      const number = document.createElement("div");
      number.className = "chart-value";
      number.textContent = `${value}%`;
      const range = document.createElement("small");
      range.textContent = `${ci[0].toFixed(1)}–${ci[1].toFixed(1)}`;
      range.setAttribute("aria-label", `95 percent confidence interval ${ci[0]} to ${ci[1]} percent`);
      number.append(range);
      row.append(label, track, number);
      chart.append(row);
    });
    const axis = document.createElement("div");
    axis.className = "chart-axis";
    axis.setAttribute("aria-hidden", "true");
    axis.innerHTML = "<span></span><div><span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span></div><span></span>";
    chart.append(axis);
  }
  $$("[data-task]").forEach(button => button.addEventListener("click", () => {
    $$("[data-task]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    renderResults(Number(button.dataset.task));
  }));
  renderResults(0);
  const tableBody = $("#results-table tbody");
  results.forEach(item => {
    const row = document.createElement("tr");
    const method = document.createElement("th"); method.scope = "row"; method.textContent = item.method;
    const success = document.createElement("td"); success.textContent = item.success_percent.join(" / ");
    const confidence = document.createElement("small"); confidence.textContent = item.success_CI.map(ci => `[${ci.map(x => x.toFixed(1)).join(", ")}]`).join(" / "); success.append(confidence);
    row.append(method, success);
    [item.sequence_percent, item.collision_percent, item.human_seconds].forEach(values => { const cell = document.createElement("td"); cell.textContent = values.join(" / "); row.append(cell); });
    tableBody.append(row);
  });
  if (data.abstract) $("#abstract-text").textContent = data.abstract;

  // The displayed citation and static .bib download match the official arXiv export.
  const bibtex = $("#bibtex").textContent.trim();
  $("#copy-bib").addEventListener("click", async () => {
    let copied = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(bibtex); copied = true; } } catch { /* Use the local-file fallback below. */ }
    if (!copied) {
      const textarea = document.createElement("textarea"); textarea.value = bibtex; textarea.style.cssText = "position:fixed;left:-9999px;top:0"; document.body.append(textarea); textarea.select();
      try { copied = document.execCommand("copy"); } catch { copied = false; }
      textarea.remove();
    }
    toast(copied ? "BibTeX copied to clipboard." : "Copy is unavailable here. Download the .bib file instead.");
  });
})();
