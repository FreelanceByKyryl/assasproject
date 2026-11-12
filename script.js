
(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const year = $("#current-year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const menuButton = $("#menu-toggle");
  const navigation = $("#main-nav");

  function closeMenu() {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");

    navigation.classList.remove("open");
    document.body.classList.remove("nav-open");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const open =
        menuButton.getAttribute("aria-expanded") !== "true";

      menuButton.setAttribute(
        "aria-expanded",
        String(open)
      );

      menuButton.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation"
      );

      navigation.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
    });

    $$("a", navigation).forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        const wasOpen =
          menuButton.getAttribute("aria-expanded") === "true";

        closeMenu();

        if (wasOpen) {
          menuButton.focus();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) {
        closeMenu();
      }
    });
  }

  const bar = $("#scroll-meter-bar");

  let scrollTick = 0;

  function paintProgress() {
    scrollTick = 0;

    if (!bar) return;

    const max = Math.max(
      1,
      document.documentElement.scrollHeight -
      window.innerHeight
    );

    const progress = Math.min(
      1,
      Math.max(0, window.scrollY / max)
    );

    bar.style.transform =
      `scaleX(${progress.toFixed(4)})`;
  }

  function requestProgress() {
    if (!scrollTick) {
      scrollTick = requestAnimationFrame(paintProgress);
    }
  }

  window.addEventListener("scroll", requestProgress, {
    passive: true
  });

  window.addEventListener("resize", requestProgress, {
    passive: true
  });

  requestProgress();

  if (
    !reduceMotion &&
    "IntersectionObserver" in window
  ) {
    const items = $$(".reveal");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: .06,
        rootMargin: "0px 0px -25px 0px"
      }
    );

    items.forEach(item => {
      observer.observe(item);
    });

    document.documentElement.classList.add("js-ready");

    items.forEach(item => {
      if (
        item.getBoundingClientRect().top <
        window.innerHeight * .9
      ) {
        item.classList.add("visible");
      }
    });
  }

  const flows = {
    launch: {
      title: "Product launch campaign",
      description:
        "Turn a product brief into a structured launch plan.",
      input: "Product brief",
      process: "Organize & prioritize",
      output: "Launch roadmap",
      result:
        "Your draft roadmap is ready: define the audience, " +
        "prepare 3 launch messages, schedule the announcement, " +
        "and review performance after launch."
    },

    standup: {
      title: "Weekly team standup",
      description:
        "Transform scattered updates into one focused summary.",
      input: "Team updates",
      process: "Summarize & identify blockers",
      output: "Weekly team recap",
      result:
        "Your demo recap: 6 tasks completed, 2 priorities " +
        "for next week, and 1 blocker to resolve during " +
        "the next team sync."
    },

    insights: {
      title: "Customer feedback insights",
      description:
        "Spot the themes hidden in product feedback.",
      input: "Customer comments",
      process: "Group recurring themes",
      output: "Insights summary",
      result:
        "Your demo insights: onboarding clarity and mobile " +
        "navigation are the most common themes. Suggested " +
        "next step: test a simplified welcome flow."
    }
  };

  let activeFlow = "launch";
  let demoTimer = null;

  const runButton = $("#run-demo");
  const resultStatus = $("#result-status");
  const resultText = $("#result-text");
  const demoConsole = $("#demo-console");

  function setText(selector, value) {
    const element = $(selector);

    if (element) {
      element.textContent = value;
    }
  }

  function chooseFlow(id) {
    if (!flows[id]) return;

    activeFlow = id;

    if (demoTimer) {
      window.clearTimeout(demoTimer);
    }

    demoTimer = null;

    if (runButton) {
      runButton.disabled = false;
      runButton.innerHTML =
        'Run interactive demo <span>↗</span>';
    }

    demoConsole?.classList.remove("is-running");

    $$(".workflow-choice").forEach(button => {
      const selected = button.dataset.flow === id;

      button.classList.toggle("active", selected);

      button.setAttribute(
        "aria-pressed",
        String(selected)
      );
    });

    const flow = flows[id];

    setText("#workflow-title", flow.title);
    setText("#workflow-description", flow.description);
    setText("#flow-input", flow.input);
    setText("#flow-process", flow.process);
    setText("#flow-output", flow.output);

    if (resultStatus) {
      resultStatus.textContent = "READY";
    }

    if (resultText) {
      resultText.textContent =
        'Choose "Run demo" to preview a generated workflow outcome.';
    }
  }

  $$(".workflow-choice").forEach(button => {
    button.addEventListener("click", () => {
      chooseFlow(button.dataset.flow);
    });
  });

  if (runButton) {
    runButton.addEventListener("click", () => {
      if (runButton.disabled) return;

      runButton.disabled = true;

      runButton.innerHTML =
        'Processing demo <span>✳</span>';

      demoConsole?.classList.add("is-running");

      if (resultStatus) {
        resultStatus.textContent = "PROCESSING";
      }

      if (resultText) {
        resultText.textContent =
          "Organizing your selected workflow...";
      }

      demoTimer = window.setTimeout(() => {
        const selected = flows[activeFlow];

        if (resultStatus) {
          resultStatus.textContent = "COMPLETED ✓";
        }

        if (resultText) {
          resultText.textContent = selected.result;
        }

        runButton.innerHTML =
          'Run again <span>↗</span>';

        runButton.disabled = false;
        demoTimer = null;
      }, reduceMotion ? 100 : 900);
    });
  }

  const storySteps = $$(".story-step");
  const stage = $("#story-stage");

  const stageNames = [
    "COLLECT",
    "SHAPE",
    "MOVE"
  ];

  const stageCaptions = [
    "Bring everything together",
    "Create a clear direction",
    "Turn ideas into action"
  ];

  function updateStory(index) {
    if (!stage || index < 0 || index > 2) return;

    stage.dataset.stage = String(index);

    setText(
      "#story-big-number",
      String(index + 1).padStart(2, "0")
    );

    setText(
      "#story-card-text",
      stageCaptions[index]
    );

    setText(
      "#story-stage-label",
      stageNames[index]
    );

    storySteps.forEach((step, i) => {
      step.classList.toggle(
        "active",
        index === i
      );
    });
  }

  if (
    storySteps.length &&
    "IntersectionObserver" in window
  ) {
    const storyObserver = new IntersectionObserver(
      entries => {
        const visible = entries.filter(
          entry => entry.isIntersecting
        );

        if (!visible.length) return;

        visible.sort(
          (a, b) =>
            b.intersectionRatio - a.intersectionRatio
        );

        updateStory(
          storySteps.indexOf(visible[0].target)
        );
      },
      {
        threshold: [.12, .3, .5, .65],
        rootMargin: "-15% 0px -25% 0px"
      }
    );

    storySteps.forEach(step => {
      storyObserver.observe(step);
    });
  }

  const billingButtons = $$("[data-billing]");

  billingButtons.forEach(button => {
    button.addEventListener("click", () => {
      const period = button.dataset.billing;

      billingButtons.forEach(item => {
        const selected = item === button;

        item.classList.toggle(
          "active",
          selected
        );

        item.setAttribute(
          "aria-pressed",
          String(selected)
        );
      });

      $$(".price-amount strong[data-monthly]").forEach(amount => {
        amount.textContent = amount.dataset[period];
      });
    });
  });

  const contactForm = $("#demo-contact-form");
  const feedback = $("#form-feedback");

  if (contactForm && feedback) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();

      feedback.classList.remove(
        "error",
        "success"
      );

      const name = $("#contact-name");
      const email = $("#contact-email");

      if (
        !name.value.trim() ||
        name.value.trim().length < 2
      ) {
        feedback.textContent =
          "Please enter your name (at least 2 characters).";

        feedback.classList.add("error");
        name.focus();
        return;
      }

      if (
        !email.validity.valid ||
        !email.value.trim()
      ) {
        feedback.textContent =
          "Please enter a valid email address.";

        feedback.classList.add("error");
        email.focus();
        return;
      }

      feedback.textContent =
        `Preview complete, ${name.value.trim()}! ` +
        "This is a frontend demo — no message was sent or stored.";

      feedback.classList.add("success");
    });
  }

const ticker = document.querySelector(".ticker");
const tickerTrack = document.querySelector(".ticker-track");

if (ticker && tickerTrack) {
    const original = tickerTrack.firstElementChild;
    let resizeTimer;

    function updateTicker() {
        tickerTrack.style.animation = "none";

        tickerTrack.replaceChildren(original);

        const width = original.getBoundingClientRect().width;

        if (width <= 0) return;

        const copies = Math.max(
            3,
            Math.ceil(ticker.clientWidth / width) + 2
        );

        for (let i = 1; i < copies; i++) {
            const clone = original.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            tickerTrack.appendChild(clone);
        }

        tickerTrack.style.setProperty(
            "--ticker-distance",
            `${width}px`
        );

        tickerTrack.style.setProperty(
            "--ticker-duration",
            `${width / 85}s`
        );

        void tickerTrack.offsetWidth;
        tickerTrack.style.removeProperty("animation");
    }

    updateTicker();

    window.addEventListener("load", updateTicker);

    document.fonts?.ready.then(updateTicker);

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateTicker, 150);
    });
}

})();
