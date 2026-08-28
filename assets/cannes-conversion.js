(function () {
  var demo = document.querySelector('[data-agentic-demo]');

  function track(name, data) {
    if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data || {});
  }

  if (demo) {
    var heroVideos = Array.prototype.slice.call(demo.querySelectorAll('[data-hero-film-video]'));
    var videoToggle = demo.querySelector('[data-agentic-video-toggle]');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var constrainedNetwork = !!(connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || '')));
    var demoRect = demo.getBoundingClientRect();
    var demoIsVisible = demoRect.bottom > 0 && demoRect.top < window.innerHeight;
    var videosManuallyPaused = false;
    var userRequestedPlayback = false;
    var flowRevealReady = false;
    var flowRevealTimer = null;
    var heroRetryTimer = null;
    var heroRetryCount = 0;

    function shouldPlayHeroFilms() {
      var preferenceAllowsPlayback = (!reducedMotion.matches && !constrainedNetwork) || userRequestedPlayback;
      return flowRevealReady && demoIsVisible && !document.hidden && !videosManuallyPaused && preferenceAllowsPlayback;
    }

    function beginHeroReveal() {
      if (flowRevealReady || flowRevealTimer || !demoIsVisible) return;
      demo.classList.add('is-flow-started');
      flowRevealTimer = window.setTimeout(function () {
        flowRevealTimer = null;
        flowRevealReady = true;
        syncHeroFilms();
      }, reducedMotion.matches ? 0 : 2700);
    }

    function heroState(video) {
      return video.closest('.hero-triptych-card').querySelector('.hero-triptych-live');
    }

    function setHeroState(video, value) {
      var state = heroState(video);
      if (!state) return;
      var label = state.lastChild;
      if (label && label.nodeType === Node.TEXT_NODE) label.textContent = value;
    }

    function refreshHeroToggle() {
      var allPlaying = heroVideos.length && heroVideos.every(function (video) { return !video.paused && !video.ended; });
      if (videoToggle) {
        videoToggle.textContent = allPlaying ? 'Pause all' : 'Play all';
        videoToggle.setAttribute('aria-label', allPlaying ? 'Pause all films' : 'Play all films');
      }
    }

    function scheduleHeroRetry() {
      window.clearTimeout(heroRetryTimer);
      if (!shouldPlayHeroFilms() || heroRetryCount >= 6) return;
      if (!heroVideos.some(function (video) { return video.paused; })) return;
      var delays = [120, 280, 600, 1100, 1800, 2800];
      heroRetryTimer = window.setTimeout(function () {
        heroRetryCount += 1;
        syncHeroFilms();
      }, delays[heroRetryCount]);
    }

    function playHeroFilm(video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          setHeroState(video, 'Playing');
          refreshHeroToggle();
        }).catch(function () {
          setHeroState(video, 'Tap play');
          refreshHeroToggle();
          scheduleHeroRetry();
        });
      }
    }

    function syncHeroFilms() {
      window.clearTimeout(heroRetryTimer);
      if (!shouldPlayHeroFilms()) {
        heroVideos.forEach(function (video) { video.pause(); });
        refreshHeroToggle();
        return;
      }
      heroVideos.forEach(playHeroFilm);
      scheduleHeroRetry();
    }

    heroVideos.forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.autoplay = true;
      video.playsInline = true;
      video.addEventListener('playing', function () {
        setHeroState(video, 'Playing');
        refreshHeroToggle();
      });
      video.addEventListener('pause', function () {
        setHeroState(video, 'Paused');
        refreshHeroToggle();
      });
      video.addEventListener('waiting', function () { setHeroState(video, 'Loading'); });
      video.addEventListener('canplay', function () {
        if (shouldPlayHeroFilms() && video.paused) playHeroFilm(video);
      });
      video.addEventListener('error', function () {
        setHeroState(video, 'Unavailable');
        refreshHeroToggle();
      });
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          demoIsVisible = entry.isIntersecting;
          if (entry.isIntersecting) {
            heroRetryCount = 0;
            beginHeroReveal();
          }
          syncHeroFilms();
        });
      }, { threshold: .01 });
      observer.observe(demo);
    } else {
      demoIsVisible = true;
    }

    if (videoToggle && heroVideos.length) videoToggle.addEventListener('click', function () {
      var anyPlaying = heroVideos.some(function (video) { return !video.paused && !video.ended; });
      videosManuallyPaused = anyPlaying;
      userRequestedPlayback = !anyPlaying;
      if (!anyPlaying) {
        demo.classList.add('is-flow-started');
        flowRevealReady = true;
        heroRetryCount = 0;
      }
      syncHeroFilms();
      track('PC hero Yesim — films ' + (videosManuallyPaused ? 'paused' : 'played'));
    });

    reducedMotion.addEventListener('change', function () {
      userRequestedPlayback = false;
      videosManuallyPaused = false;
      heroRetryCount = 0;
      beginHeroReveal();
      syncHeroFilms();
    });

    document.addEventListener('visibilitychange', syncHeroFilms);
    window.addEventListener('pageshow', function () {
      heroRetryCount = 0;
      syncHeroFilms();
    });
    window.requestAnimationFrame(function () {
      beginHeroReveal();
      syncHeroFilms();
    });
  }

  var magicForms = Array.prototype.slice.call(document.querySelectorAll('[data-magic-link-form]'));
  var magicMeta = new WeakMap();
  var sharedEmail = '';

  function resetMagicForms(focusForm, keepEmail) {
    magicForms.forEach(function (form) {
      var meta = magicMeta.get(form);
      if (!meta) return;
      form.classList.remove('is-sent');
      form.removeAttribute('aria-busy');
      meta.email.readOnly = false;
      meta.email.removeAttribute('aria-invalid');
      meta.email.value = keepEmail || '';
      meta.button.disabled = false;
      meta.button.innerHTML = meta.buttonLabel;
      meta.message.textContent = meta.initialMessage;
      meta.message.classList.remove('is-error');
      var actions = form.querySelector('[data-magic-actions]');
      if (actions) actions.remove();
    });
    sharedEmail = keepEmail || '';
    if (focusForm) {
      var input = focusForm.querySelector('input[type="email"]');
      if (input) input.focus();
    }
  }

  function addMagicActions(form) {
    var meta = magicMeta.get(form);
    if (!meta || form.querySelector('[data-magic-actions]')) return;
    var actions = document.createElement('div');
    actions.className = 'magic-actions';
    actions.setAttribute('data-magic-actions', '');

    var resend = document.createElement('button');
    resend.type = 'button';
    resend.disabled = true;
    resend.textContent = 'Resend in 45s';

    var change = document.createElement('button');
    change.type = 'button';
    change.textContent = 'Use another email';

    actions.append(resend, change);
    meta.message.insertAdjacentElement('afterend', actions);

    window.setTimeout(function () {
      resend.disabled = false;
      resend.textContent = 'Resend link';
    }, 45000);

    resend.addEventListener('click', function () {
      var emailValue = sharedEmail;
      track('magic_resend', { placement: form.getAttribute('data-placement') || 'unknown' });
      resetMagicForms(form, emailValue);
      form.requestSubmit();
    });

    change.addEventListener('click', function () {
      track('magic_email_change', { placement: form.getAttribute('data-placement') || 'unknown' });
      resetMagicForms(form, '');
    });
  }

  function showMagicSuccess(value) {
    sharedEmail = value;
    magicForms.forEach(function (form) {
      var meta = magicMeta.get(form);
      if (!meta) return;
      form.classList.add('is-sent');
      form.setAttribute('aria-busy', 'false');
      meta.email.value = value;
      meta.email.readOnly = true;
      meta.button.disabled = true;
      meta.button.textContent = 'Check inbox';
      meta.message.textContent = 'Link sent. Open the Orcool email to sign in; your MCP connection choices follow.';
      meta.message.classList.remove('is-error');
      addMagicActions(form);
    });
  }

  magicForms.forEach(function (form) {
    var email = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var message = form.querySelector('[data-magic-message]');
    if (!email || !button || !message) return;
    magicMeta.set(form, { email: email, button: button, message: message, initialMessage: message.textContent, buttonLabel: button.innerHTML });

    button.addEventListener('click', function () {
      track('magic_cta_click', { placement: form.getAttribute('data-placement') || 'unknown' });
    });

    email.addEventListener('focus', function () {
      track('magic_email_focus', { placement: form.getAttribute('data-placement') || 'unknown' });
    }, { once: true });

    email.addEventListener('input', function () {
      email.removeAttribute('aria-invalid');
      message.classList.remove('is-error');
      if (!form.classList.contains('is-sent')) message.textContent = magicMeta.get(form).initialMessage;
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = email.value.trim();
      var placement = form.getAttribute('data-placement') || 'unknown';
      var params = new URLSearchParams(window.location.search);
      var eventContext = {
        placement: placement,
        client: form.getAttribute('data-agent') || 'unselected',
        mission: form.getAttribute('data-mission') || 'unselected',
        utm_source: params.get('utm_source') || 'direct',
        experiment_variant: params.get('variant') || params.get('preview') || 'default'
      };

      if (!value || !email.checkValidity()) {
        email.setAttribute('aria-invalid', 'true');
        message.textContent = 'Enter a valid email, like name@company.com.';
        message.classList.add('is-error');
        track('magic_validation_error', eventContext);
        email.focus();
        return;
      }

      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      button.textContent = 'Sending…';
      message.textContent = 'Sending your secure link…';
      message.classList.remove('is-error');
      track('magic_submit', eventContext);

      fetch('https://app.orcool.com/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, isBusiness: false, baseUrl: 'https://app.orcool.com' })
      }).then(function (response) {
        if (!response.ok) throw new Error(response.status === 429 ? 'rate-limit' : 'request-failed');
        showMagicSuccess(value);
        track('magic_send_success', eventContext);
      }).catch(function (error) {
        var meta = magicMeta.get(form);
        form.removeAttribute('aria-busy');
        button.disabled = false;
        button.innerHTML = meta.buttonLabel;
        message.textContent = !navigator.onLine ? 'You’re offline. Reconnect and try again.' : error.message === 'rate-limit' ? 'Too many attempts. Wait a minute, then resend.' : 'We couldn’t send the link. Please try again.';
        message.classList.add('is-error');
        track('magic_send_error', eventContext);
      });
    });
  });

  if ('IntersectionObserver' in window) {
    var viewedForms = new WeakSet();
    var formObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || viewedForms.has(entry.target)) return;
        viewedForms.add(entry.target);
        track('magic_cta_view', { placement: entry.target.getAttribute('data-placement') || 'unknown' });
      });
    }, { threshold: .55 });
    magicForms.forEach(function (form) { formObserver.observe(form); });
  }
})();

(function () {
  function track(name, data) {
    if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data || {});
  }

  var collider = document.querySelector('[data-commitment-collider]');
  if (collider) {
    if ('IntersectionObserver' in window) {
      var commitmentObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            collider.classList.add('is-live');
            commitmentObserver.disconnect();
          }
        });
      }, { threshold: .28 });
      commitmentObserver.observe(collider);
    } else {
      collider.classList.add('is-live');
    }
  }

  var gates = document.querySelector('[data-evidence-gates]');
  if (gates) {
    var gateButtons = Array.prototype.slice.call(gates.querySelectorAll('[data-gate-index]'));
    function selectGate(index, interaction) {
      gateButtons.forEach(function (button, buttonIndex) {
        var active = buttonIndex === index;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      gates.setAttribute('data-active-gate', String(index));
      gates.style.setProperty('--gate-progress', (index * 25) + '%');
      if (interaction) track('PC evidence gate — selected', { gate: index + 1 });
    }
    gateButtons.forEach(function (button, index) {
      button.addEventListener('click', function () { selectGate(index, true); });
      button.addEventListener('mouseenter', function () { selectGate(index, false); });
      button.addEventListener('focus', function () { selectGate(index, false); });
    });
  }

  var agentButtons = Array.prototype.slice.call(document.querySelectorAll('button[data-agent]'));
  var missionButtons = Array.prototype.slice.call(document.querySelectorAll('[data-mission]'));
  var agentAwareForms = Array.prototype.slice.call(document.querySelectorAll('[data-magic-link-form]'));
  var selectedAgentLabels = Array.prototype.slice.call(document.querySelectorAll('[data-access-selected-agent]'));
  var selectedAgentIcons = Array.prototype.slice.call(document.querySelectorAll('[data-selected-agent-icon]'));
  var agentIconSources = {
    Claude: '/assets/brand/claude-icon.svg',
    Codex: '/assets/brand/chatgpt-icon.png',
    Cursor: '/assets/brand/cursor-cube.svg'
  };
  var agentAccessRoot = document.querySelector('#apply');
  var agentPromptCards = Array.prototype.slice.call(document.querySelectorAll('[data-agent-prompt-card]'));
  var agentAccessContent = {
    Claude: {
      mode: 'Strategic synthesis · Limited preview',
      headline: 'Think with the market before you write.',
      library: 'These prompts use Claude for strategic synthesis while Orcool keeps the evidence boundary visible.',
      connectTitle: 'Add Orcool to Claude',
      setup: 'Open Customize → Connectors → + → Add custom connector. Name it Orcool, paste the endpoint, choose Add, then Connect.',
      auth: 'Complete Orcool browser sign-in, then return to Claude.',
      verify: 'Enable Orcool for this conversation from + → Connectors.',
      verifyCommand: '+ → Connectors → Orcool',
      caveat: 'Availability depends on your Claude plan and workspace policy.',
      steps: ['Email link', 'Connect Orcool', 'Start a strategy thread'],
      prompts: [
        {
          id: 'claude-evidence-brief',
          kicker: '01 / Evidence brief',
          title: 'Read before recommending.',
          text: 'Read the available Orcool evidence for [brand / category] in [market] before offering an idea. Summarize what is OBSERVED, what is INFERRED, and what is UNSUPPORTED or missing. Attach source references to observed claims; do not fill gaps with general knowledge.'
        },
        {
          id: 'claude-tension',
          kicker: '02 / Strategic tension',
          title: 'Find a tension worth testing.',
          text: 'Compare the available own-performance, competitor, native/creator, customer-language and local-signal records for [market]. Find one tension worth testing. Show which source families support or contradict it, then state a hypothesis—not a winner claim.'
        },
        {
          id: 'claude-routes',
          kicker: '03 / Creative routes',
          title: 'Make three ideas disagree.',
          text: 'Turn that tension into three materially different creative routes for [audience]. For each, name the mechanism, opening, proof required and one controlled variable. Keep evidence and interpretation separate and do not predict performance.'
        }
      ]
    },
    Codex: {
      mode: 'Read & audit workflow · Validated',
      headline: 'Turn evidence into an inspectable working file.',
      library: 'Codex can turn read-only Orcool evidence into auditable briefs, matrices and claim-gate artifacts in your workspace.',
      connectTitle: 'Add the Orcool MCP server to Codex',
      setup: 'Open Settings → MCP servers → Add server. Choose Streamable HTTP, name the server orcool, paste the endpoint, save, then restart Codex.',
      auth: 'Choose Authenticate when Codex shows the Orcool server. Your browser opens Orcool sign-in.',
      verify: 'Open /mcp and confirm that the server named orcool is enabled before running the prompt.',
      verifyCommand: '/mcp',
      caveat: 'Starter prompts use an audited read-tool allowlist. Review local file changes and connector permissions separately.',
      surfaces: {
        Desktop: {
          setup: 'Open Settings → MCP servers → Add server. Choose Streamable HTTP, name the server orcool, paste the endpoint, save, then restart Codex.',
          auth: 'Choose Authenticate when Codex shows the Orcool server. Your browser opens Orcool sign-in.',
          verify: 'Open /mcp and confirm that the server named orcool is enabled before running the prompt.',
          verifyCommand: '/mcp'
        },
        CLI: {
          setup: 'Add the remote server from your terminal. Codex stores the shared MCP configuration for the same host.',
          setupCommand: 'codex mcp add orcool --url https://mcp.orcool.com',
          auth: 'Authenticate the server from your terminal. The command opens Orcool browser sign-in.',
          authCommand: 'codex mcp login orcool',
          verify: 'Confirm that orcool is listed and enabled before running the working prompt.',
          verifyCommand: 'codex mcp list'
        },
        IDE: {
          setup: 'Open the gear menu → MCP servers → Add server. Choose Streamable HTTP, name it orcool, paste the endpoint, save, then restart the extension.',
          auth: 'Choose Authenticate for the Orcool server and complete browser sign-in.',
          verify: 'Open the MCP servers panel and confirm that orcool is enabled for the task.',
          verifyCommand: 'MCP servers → orcool → Enabled'
        }
      },
      steps: ['Email link', 'Connect Orcool', 'Run a scoped task'],
      prompts: [
        {
          id: 'codex-coverage-audit',
          kicker: '01 / Coverage audit',
          title: 'Audit the evidence base.',
          text: 'Using read-only Orcool evidence, audit [brand] / [market] and draft [output path]/orcool-evidence-audit.md. Include available source classes and counts where returned, coverage or contamination gaps, and OBSERVED / INFERRED / UNSUPPORTED findings. Abstain where evidence is insufficient; edit no other files.'
        },
        {
          id: 'codex-test-matrix',
          kicker: '02 / Test matrix',
          title: 'Build a testable artifact.',
          text: 'Create [output path]/creative-test-matrix.json from the available Orcool evidence. Define three hypotheses that test different mechanisms, each with provenance, required asset, controlled variable, shared KPI gate and missing data. Validate the JSON. Do not assign a likely winner or predicted lift.'
        },
        {
          id: 'codex-claim-gate',
          kicker: '03 / Claim gate',
          title: 'Veto unsupported claims.',
          text: 'Audit the claims in [path/to/brief] against the available Orcool records. Produce a report with supporting evidence, conflicting evidence, missing evidence and a verdict of SAFE TO TEST, NEEDS QUALIFICATION or UNSUPPORTED for each claim. Do not rewrite unsupported claims as facts.'
        }
      ]
    },
    Cursor: {
      mode: 'Evidence inside the workspace · Workflow template',
      headline: 'Bring market truth into the brief you are editing.',
      library: 'Cursor compares the files already in your workspace with Orcool evidence before proposing a precise patch.',
      connectTitle: 'Add the Orcool MCP server to Cursor',
      setup: 'Open Cursor Settings → MCP → Add server. Add orcool as a remote Streamable HTTP server and paste the endpoint.',
      auth: 'Choose Connect or Authenticate for orcool and complete Orcool browser sign-in.',
      verify: 'Confirm that orcool and its tools appear as available in the MCP panel before asking Cursor to use them.',
      verifyCommand: 'Settings → MCP → orcool',
      caveat: 'Cursor conformance is not yet validated; custom MCP availability depends on the version and workspace policy.',
      steps: ['Email link', 'Connect Orcool', 'Open the working repo'],
      prompts: [
        {
          id: 'cursor-brief-diff',
          kicker: '01 / Brief diff',
          title: 'Check the current brief.',
          text: 'Compare [path/to/brief] with the available Orcool evidence for [market]. Propose an annotated diff that marks every market, customer and competitor claim OBSERVED, INFERRED or UNSUPPORTED and retains source provenance. Show the diff first; do not apply it until I approve.'
        },
        {
          id: 'cursor-route-schema',
          kicker: '02 / Route objects',
          title: 'Fit evidence to the schema.',
          text: 'Use the creative schema already in this workspace to propose three evidence-grounded route objects for [market]. Each must test a different mechanism and include source references, required proof, one controlled variable and unknowns. If no schema exists, show one first. Do not predict a winner.'
        },
        {
          id: 'cursor-copy-patch',
          kicker: '03 / Copy patch',
          title: 'Remove evidence debt.',
          text: 'Review [path/to/campaign] for claims that exceed the available Orcool evidence. Propose the smallest patch that removes or qualifies unsupported claims, then list the missing sources needed to restore them. Do not change files until I approve.'
        }
      ]
    }
  };
  var prompt = document.querySelector('[data-mission-prompt]');
  var missionPrompts = {
    'Map my category': 'Map the creative whitespace for eSIM in Japan. Show what the category repeats, what remains unclaimed and three routes worth testing.',
    'Find an unclaimed tension': 'Find the tension this category keeps circling but nobody owns. Preserve the source trail and show why the opening is credible.',
    'Design three lineages': 'Turn one open tension into three creative lineages that test materially different mechanisms under the same business gate.',
    'Diagnose a winner': 'Read the winning asset as evidence. Separate the likely mechanism from surface detail and design three controlled descendants.'
  };
  var missionResults = {
    'Map my category': [
      ['37 reference slots in this demo', 'Competitor repetition, customer language and local context remain inspectable.'],
      ['Everyone sells convenience.', 'Nobody owns the anxiety of losing continuity at the exact moment it matters.'],
      ['Make continuity feel like infrastructure.', 'The category promise becomes consequential before the product appears.'],
      ['Three materially different routes.', 'Confession · interruption · live proof. One business gate judges all three.']
    ],
    'Find an unclaimed tension': [
      ['Repeated promises remain traceable.', 'The demo separates category convention from customer language and local context.'],
      ['Convenience is owned. Consequence is open.', 'The gap appears when connectivity fails at the moment of arrival.'],
      ['Own the moment continuity breaks.', 'Make the cost of interruption tangible before introducing the product.'],
      ['Challenge the tension three ways.', 'Confession · interruption · proof under the same business gate.']
    ],
    'Design three lineages': [
      ['One grounded tension enters.', 'The source trail stays attached before any creative route is designed.'],
      ['One audience response is named.', 'The test asks whether continuity can feel like infrastructure.'],
      ['The routes deliberately disagree.', 'A confession, a situational interruption and a product proof test different mechanisms.'],
      ['One fair test receives all three.', 'Equal cells and one KPI make the result comparable.']
    ],
    'Diagnose a winner': [
      ['Delivery evidence returns.', 'The demo reads the selected lineage against the agreed business gate.'],
      ['The likely mechanism is isolated.', 'Urgent continuity, not the surface scene, is treated as the working reason.'],
      ['Accidental detail is separated.', 'Hook, scene and proof can change while the parent mechanism stays locked.'],
      ['Three descendants return.', 'Each changes one variable and keeps lineage attribution intact.']
    ]
  };

  function selectAgent(agent, interaction) {
    var access = agentAccessContent[agent] || agentAccessContent.Claude;
    agentButtons.forEach(function (button) {
      var active = button.getAttribute('data-agent') === agent;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    selectedAgentLabels.forEach(function (label) { label.textContent = agent; });
    selectedAgentIcons.forEach(function (icon) { icon.src = agentIconSources[agent] || agentIconSources.Claude; });
    agentAwareForms.forEach(function (form) { form.setAttribute('data-agent', agent); });
    if (agentAccessRoot) {
      agentAccessRoot.setAttribute('data-access-client', agent.toLowerCase());
      var mode = agentAccessRoot.querySelector('[data-agent-mode]');
      var headline = agentAccessRoot.querySelector('[data-agent-headline]');
      var library = agentAccessRoot.querySelector('[data-agent-library-copy]');
      var connectTitle = agentAccessRoot.querySelector('[data-agent-connect-title]');
      var setup = agentAccessRoot.querySelector('[data-agent-setup]');
      var auth = agentAccessRoot.querySelector('[data-agent-auth]');
      var verify = agentAccessRoot.querySelector('[data-agent-verify]');
      var verifyCommand = agentAccessRoot.querySelector('[data-agent-verify-command]');
      var surfacePicker = agentAccessRoot.querySelector('[data-agent-surface-picker]');
      var caveat = agentAccessRoot.querySelector('[data-agent-caveat]');
      var formLabel = agentAccessRoot.querySelector('[data-agent-form-label]');
      var steps = Array.prototype.slice.call(agentAccessRoot.querySelectorAll('[data-agent-step]'));
      if (mode) mode.textContent = access.mode;
      if (headline) headline.textContent = access.headline;
      if (library) library.textContent = access.library;
      if (connectTitle) connectTitle.textContent = access.connectTitle;
      function renderSurface(surfaceName) {
        var surface = access.surfaces && access.surfaces[surfaceName] ? access.surfaces[surfaceName] : access;
        if (setup) {
          setup.textContent = surface.setup;
          if (surface.setupCommand) {
            var setupCode = document.createElement('code');
            setupCode.className = 'pc5-inline-command';
            setupCode.textContent = surface.setupCommand;
            setup.appendChild(setupCode);
          }
        }
        if (auth) {
          auth.textContent = surface.auth;
          if (surface.authCommand) {
            var authCode = document.createElement('code');
            authCode.className = 'pc5-inline-command';
            authCode.textContent = surface.authCommand;
            auth.appendChild(authCode);
          }
        }
        if (verify) verify.textContent = surface.verify;
        if (verifyCommand) verifyCommand.textContent = surface.verifyCommand;
      }
      if (surfacePicker) {
        surfacePicker.replaceChildren();
        var surfaceNames = access.surfaces ? Object.keys(access.surfaces) : [];
        surfacePicker.hidden = surfaceNames.length === 0;
        surfaceNames.forEach(function (surfaceName, index) {
          var surfaceButton = document.createElement('button');
          surfaceButton.type = 'button';
          surfaceButton.textContent = surfaceName;
          surfaceButton.className = index === 0 ? 'is-active' : '';
          surfaceButton.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
          surfaceButton.addEventListener('click', function () {
            Array.prototype.slice.call(surfacePicker.querySelectorAll('button')).forEach(function (button) {
              var active = button === surfaceButton;
              button.classList.toggle('is-active', active);
              button.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            renderSurface(surfaceName);
            if (interaction) track('agent_surface_selected', { client: agent, surface: surfaceName });
          });
          surfacePicker.appendChild(surfaceButton);
        });
        renderSurface(surfaceNames[0]);
      } else {
        renderSurface();
      }
      if (caveat) caveat.textContent = access.caveat;
      if (formLabel) formLabel.textContent = agent;
      steps.forEach(function (step, index) { step.textContent = access.steps[index] || ''; });
      agentPromptCards.forEach(function (card, index) {
        var item = access.prompts[index];
        if (!item) return;
        var kicker = card.querySelector('[data-agent-prompt-kicker]');
        var title = card.querySelector('[data-agent-prompt-title]');
        var text = card.querySelector('[data-agent-prompt-text]');
        var copy = card.querySelector('.prompt-copy');
        if (kicker) kicker.textContent = item.kicker;
        if (title) title.textContent = item.title;
        if (text) text.textContent = item.text;
        if (copy) {
          copy.setAttribute('data-copy-client', agent);
          copy.setAttribute('data-copy-prompt', item.id);
          copy.setAttribute('aria-label', 'Copy ' + agent + ' prompt: ' + item.title);
        }
      });
    }
    if (interaction) track('agent_selected', { client: agent });
  }

  function selectMission(mission, interaction) {
    missionButtons.forEach(function (button) {
      var active = button.getAttribute('data-mission') === mission;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (prompt) prompt.textContent = missionPrompts[mission] || missionPrompts['Map my category'];
    var result = missionResults[mission] || missionResults['Map my category'];
    var resultCards = Array.prototype.slice.call(document.querySelectorAll('[data-trace-step]'));
    resultCards.forEach(function (card, index) {
      var title = card.querySelector('[data-trace-title]');
      var copy = card.querySelector('[data-trace-copy]');
      if (title) title.textContent = result[index][0];
      if (copy) copy.textContent = result[index][1];
    });
    agentAwareForms.forEach(function (form) { form.setAttribute('data-mission', mission); });
    if (interaction) track('mission_selected', { mission: mission });
  }

  agentButtons.forEach(function (button) {
    button.addEventListener('click', function () { selectAgent(button.getAttribute('data-agent'), true); });
  });
  missionButtons.forEach(function (button) {
    button.addEventListener('click', function () { selectMission(button.getAttribute('data-mission'), true); });
  });
  if (agentButtons.length) selectAgent('Claude', false);
  else agentAwareForms.forEach(function (form) { form.removeAttribute('data-agent'); });
  if (missionButtons.length) selectMission('Map my category', false);
  else agentAwareForms.forEach(function (form) { form.removeAttribute('data-mission'); });

  var engineReading = document.querySelector('[data-engine-reading]');
  if (engineReading && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var readingStates = ['Reading the market', 'Finding repetition', 'Naming the opening'];
    var readingIndex = 0;
    window.setInterval(function () {
      readingIndex = (readingIndex + 1) % readingStates.length;
      engineReading.textContent = readingStates[readingIndex];
    }, 1800);
  }

  var trace = document.querySelector('[data-trace-answer]');
  var runSample = document.querySelector('[data-run-sample]');
  var traceTimer = null;
  var tracePhase = 0;

  function renderTrace(index) {
    if (!trace) return;
    tracePhase = index;
    trace.setAttribute('data-trace-phase', String(index));
    trace.style.setProperty('--trace-progress', ((index + 1) * 25) + '%');
    Array.prototype.slice.call(trace.querySelectorAll('[data-trace-step]')).forEach(function (step, stepIndex) {
      step.classList.toggle('is-active', stepIndex <= index);
    });
  }

  function playTrace(interaction) {
    window.clearInterval(traceTimer);
    renderTrace(0);
    traceTimer = window.setInterval(function () {
      if (tracePhase >= 3) {
        window.clearInterval(traceTimer);
        return;
      }
      renderTrace(tracePhase + 1);
    }, 900);
    if (interaction) track('PC traceable answer — sample run');
  }

  if (runSample) runSample.addEventListener('click', function () { playTrace(true); });
  if (trace && 'IntersectionObserver' in window) {
    var traceObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          playTrace(false);
          traceObserver.disconnect();
        }
      });
    }, { threshold: .28 });
    traceObserver.observe(trace);
  } else if (trace) {
    playTrace(false);
  }
})();
