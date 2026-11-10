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

  // Stream lightweight MP4s for playback; original GIFs remain download links.
  // Off-screen clips pause without discarding their buffers.
  const animationStates = new Map();
  function renderAnimation(state, message = "") {
    state.status.textContent = message;
    state.status.hidden = !message;
    state.stage.setAttribute("aria-busy", String(state.loading));
    state.frame.classList.toggle("is-paused", !state.playRequested);
    state.button.textContent = state.failed ? "Retry" : state.loading ? "Cancel loading" : state.playRequested ? "Pause clip" : "Play clip";
    state.button.setAttribute("aria-label", state.failed ? "Retry clip" : state.loading ? "Cancel clip loading" : state.playRequested ? "Pause clip" : "Play clip");
    state.button.setAttribute("aria-pressed", String(state.playing));
  }
  function clipDetails(video) {
    return { src: video.dataset.src, gif: video.dataset.gif, poster: video.getAttribute("poster"), label: video.getAttribute("aria-label"), width: video.width, height: video.height };
  }
  function replaceClip(state, clip) {
    const previous = state.video;
    const video = previous.cloneNode(false);
    video.removeAttribute("src");
    video.dataset.src = clip.src;
    video.dataset.gif = clip.gif;
    video.poster = clip.poster;
    video.setAttribute("aria-label", clip.label);
    video.width = clip.width;
    video.height = clip.height;
    video.preload = "none";
    clearTimeout(state.loadTimer);
    state.playId++;
    state.video = video;
    state.playRequested = state.playing = state.loading = state.failed = false;
    previous.replaceWith(video);
    previous.pause();
    previous.removeAttribute("src");
    previous.load(); // Cancel the previous clip, including any outstanding range request.
    bindVideo(state, video);
    renderAnimation(state);
  }
  function failAnimation(state, message) {
    replaceClip(state, clipDetails(state.video));
    state.userPaused = state.failed = true;
    renderAnimation(state, message);
  }
  function waitForPlayback(state) {
    if (state.loadTimer) return;
    const video = state.video;
    state.loadTimer = setTimeout(() => {
      state.loadTimer = null;
      if (state.video === video && state.playRequested && state.loading) {
        failAnimation(state, "Loading took too long. Select Retry to try again.");
      }
    }, 20000);
  }
  function bindVideo(state, video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    state.stage.style.aspectRatio = `${video.width} / ${video.height}`;
    video.addEventListener("playing", () => {
      if (state.video !== video || !state.playRequested) return;
      clearTimeout(state.loadTimer);
      state.loadTimer = null;
      state.loading = false;
      state.playing = true;
      renderAnimation(state);
    });
    video.addEventListener("waiting", () => {
      if (state.video !== video || !state.playRequested) return;
      state.loading = true;
      state.playing = false;
      renderAnimation(state, video.currentTime > 0 ? "Buffering…" : "Loading clip…");
      waitForPlayback(state);
    });
    video.addEventListener("error", () => {
      if (state.video !== video || !state.playRequested) return;
      failAnimation(state, "This clip could not load. Select Retry to try again.");
    });
  }
  function setAnimation(state, play) {
    if (state.playRequested === play) return;
    if (play && state.failed) replaceClip(state, clipDetails(state.video));
    const video = state.video;
    const playId = ++state.playId;
    state.playRequested = play;
    state.playing = false;
    state.loading = play;
    clearTimeout(state.loadTimer);
    state.loadTimer = null;
    if (!play) {
      video.pause();
      video.preload = "metadata";
      renderAnimation(state);
      return;
    }
    renderAnimation(state, "Loading clip…");
    if (!video.hasAttribute("src")) video.src = video.dataset.src;
    video.preload = "auto";
    waitForPlayback(state);
    // play()/playing starts once a few frames are buffered, not after the file finishes.
    video.play().catch(error => {
      if (state.video !== video || state.playId !== playId || !state.playRequested) return;
      if (error.name === "NotAllowedError") {
        state.userPaused = true;
        setAnimation(state, false);
        renderAnimation(state, "Select Play clip to start.");
      } else if (error.name !== "AbortError") {
        failAnimation(state, "This clip could not play. Select Retry to try again.");
      }
    });
  }
  function createAnimationState(frame, button) {
    const video = $("video", frame);
    const stage = document.createElement("div");
    stage.className = "animation-stage";
    video.before(stage);
    stage.append(video);
    const status = document.createElement("span");
    status.className = "animation-status";
    status.setAttribute("role", "status");
    status.hidden = true;
    stage.append(status);
    const state = { frame, video, button, stage, status, playing: false, playRequested: false, loading: false, failed: false, playId: 0, loadTimer: null, visible: false, userPaused: false };
    bindVideo(state, video);
    renderAnimation(state);
    button.addEventListener("click", () => {
      state.userPaused = state.playRequested;
      setAnimation(state, !state.playRequested);
    });
    return state;
  }
  function canAutoplay(state) { return state.visible && !state.userPaused && !reducedMotion.matches && !dataSaver && !mediaDialog.open && !document.hidden; }
  const dialogState = createAnimationState($("#dialog-animation-frame"), $("#dialog-animation-toggle"));
  $$('[data-animation]').forEach(frame => {
    const state = createAnimationState(frame, $("[data-toggle-animation]", frame));
    animationStates.set(frame, state);
    $("[data-expand]", frame).addEventListener("click", event => {
      const play = state.playRequested;
      const position = state.video.currentTime;
      const clip = clipDetails(state.video);
      $("#media-dialog-title").textContent = event.currentTarget.dataset.title;
      $("#dialog-gif-download").href = clip.gif;
      replaceClip(dialogState, clip);
      const video = dialogState.video;
      video.addEventListener("loadedmetadata", () => {
        if (dialogState.video === video && position > 0 && position < video.duration) video.currentTime = position;
      }, { once: true });
      animationStates.forEach(otherState => setAnimation(otherState, false));
      openDialog(mediaDialog);
      setAnimation(dialogState, play);
    });
  });
  if ("IntersectionObserver" in window) {
    const mediaObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const state = animationStates.get(entry.target);
      state.visible = entry.isIntersecting;
      setAnimation(state, canAutoplay(state));
    }), { rootMargin: "0px", threshold: 0.01 });
    animationStates.forEach((_, frame) => mediaObserver.observe(frame));
  }
  mediaDialog.addEventListener("close", () => {
    replaceClip(dialogState, clipDetails(dialogState.video));
    animationStates.forEach(state => setAnimation(state, canAutoplay(state)));
  });
  document.addEventListener("visibilitychange", () => {
    animationStates.forEach(state => setAnimation(state, canAutoplay(state)));
    if (document.hidden) {
      $("#supplementary-video").pause();
      setAnimation(dialogState, false);
    }
  });
  reducedMotion.addEventListener("change", () => animationStates.forEach(state => setAnimation(state, canAutoplay(state))));

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
    replaceClip(state, {
      src: `assets/videos/clips/${selected.slug}.mp4`,
      gif: `assets/gifs/${selected.slug}.gif`,
      poster: `assets/images/${selected.slug}.webp`,
      label: selected.alt,
      width: selected.width || 1100,
      height: selected.height || 620
    });
    state.userPaused = false;
    // Warm only the explicitly selected clip, even when the player is just below view.
    state.video.preload = "metadata";
    state.video.src = state.video.dataset.src;
    $("[data-expand]", demoFrame).dataset.title = selected.title;
    $("#demo-download").href = state.video.dataset.gif;
    setAnimation(state, canAutoplay(state));
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
