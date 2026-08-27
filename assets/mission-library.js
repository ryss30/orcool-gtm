(function () {
  'use strict';

  var MISSION_FAMILIES = {
    quality: { label: 'Evidence quality', ids: ['coverage', 'claim_gate'] },
    audience: { label: 'Audience truth', ids: ['voice'] },
    market: { label: 'Market opportunity', ids: ['whitespace', 'local'] },
    own: { label: 'Own learning', ids: ['own_truth'] },
    test: { label: 'Test design', ids: ['candidate', 'routes'] },
    production: { label: 'Production readiness', ids: ['lineage'] },
    learning: { label: 'Learning loop', ids: ['live_learning', 'team_learning'] }
  };

  var AVAILABILITY = {
    evidence: {
      label: 'Connected evidence',
      description: 'Works when the relevant Orcool evidence is connected.'
    },
    configured: {
      label: 'Configured sources',
      description: 'Depends on monitored accounts, feeds, keywords or local sources.'
    },
    delivery: {
      label: 'Requires media outcomes',
      description: 'Needs comparable delivery data and an agreed KPI gate.'
    },
    feedback: {
      label: 'Requires team feedback',
      description: 'Needs explicit pick, skip and comment history.'
    }
  };

  var AGENTS = {
    claude: {
      label: 'Claude',
      mode: 'Strategic synthesis · Limited preview',
      setup: 'Uses the connected Orcool connector first, then turns the returned evidence into a strategic choice.',
      activation: 'Use the connected custom connector named `Orcool` for this request. If more than one Orcool connector is available, use the non-admin connector named exactly `Orcool`.'
    },
    codex: {
      label: 'Codex',
      mode: 'Audits and working artifacts · Validated',
      setup: 'Uses the connected `.orcool.com` app first, then produces an auditable brief, matrix or evidence report.',
      activation: 'Use the connected `.orcool.com` app (Orcool MCP) for this task.'
    },
    cursor: {
      label: 'Cursor',
      mode: 'Evidence inside the workspace · Workflow template',
      setup: 'Workflow template for a Cursor workspace with an Orcool MCP server configured as `orcool`.',
      activation: 'Use the MCP server named `orcool` for this task. If no server with that name is configured and available, stop.'
    }
  };

  var MISSION_TOOL_PLANS = {
    coverage: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_target_audiences', 'studio_list_best_performing_references', 'studio_list_competitors', 'studio_list_competitor_references', 'studio_list_inspiring_references', 'studio_list_brand_trends', 'studio_list_global_trends', 'studio_list_concepts', 'studio_list_creative_packs', 'studio_list_videos'],
    voice: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_target_audiences'],
    own_truth: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_best_performing_references'],
    whitespace: ['studio_get_brand', 'studio_list_competitors', 'studio_list_competitor_references', 'studio_list_inspiring_references', 'studio_list_reviews', 'studio_list_insights', 'studio_list_brand_trends'],
    local: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_brand_trends', 'studio_list_global_trends'],
    candidate: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_target_audiences', 'studio_list_best_performing_references', 'studio_list_concepts'],
    routes: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_target_audiences', 'studio_list_best_performing_references', 'studio_list_competitors', 'studio_list_competitor_references', 'studio_list_inspiring_references', 'studio_list_brand_trends', 'studio_list_global_trends', 'studio_list_policies', 'studio_list_concepts'],
    claim_gate: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_best_performing_references', 'studio_list_competitor_references', 'studio_list_inspiring_references', 'studio_list_brand_trends', 'studio_list_policies'],
    lineage: ['studio_get_brand', 'studio_list_reviews', 'studio_list_insights', 'studio_list_concepts', 'studio_list_creative_packs', 'studio_list_videos'],
    live_learning: ['studio_get_brand', 'studio_list_concepts', 'studio_list_creative_packs', 'studio_list_videos'],
    team_learning: ['studio_get_brand', 'studio_list_concepts', 'studio_list_creative_packs']
  };

  var MISSION_LIMITS = {
    local: 'Stored trend and research records do not by themselves prove a live social or local-news read. If dated, GEO-specific returned evidence is absent, mark “here, now” UNSUPPORTED.',
    live_learning: 'The current validated Orcool read catalog does not expose comparable media-delivery outcomes. Require a client-provided result artifact with spend, attribution, GEO/date and the agreed KPI gate; otherwise return NOT_ENOUGH_DATA.',
    team_learning: 'No first-class Brand Lens, pick/skip or team-comment read is validated in the current catalog. Do not invent a Brand Lens call or score; return NOT_ENOUGH_DATA unless explicit feedback records are actually exposed.'
  };

  var MISSIONS = [
    {
      id: 'coverage',
      family: 'quality',
      title: 'Can we trust the evidence?',
      output: 'Coverage matrix · gaps · abstention',
      sources: ['OWN', 'VOICE', 'COMP', 'NATIVE', 'LOCAL', 'GRAPH'],
      lens: 'none',
      availability: 'evidence',
      prompts: {
        claude: 'Before we brief this market, do we have enough evidence to say something specific? Show what is actually connected, what may be stale or contaminated, and what we should not infer.',
        codex: 'Audit the available Orcool evidence for this scope. Return source classes, counts where available, GEO/date coverage, broken lineage and evidence gaps. Abstain if the corpus cannot support a brief.',
        cursor: 'Compare the evidence assumptions in the current brief with the available Orcool records. Show an annotated diff for every missing, stale or unsupported input; do not apply it yet.'
      }
    },
    {
      id: 'voice',
      family: 'audience',
      title: 'What are people actually saying?',
      output: 'Customer-language clusters · testable tension',
      sources: ['VOICE'],
      lens: 'none',
      availability: 'evidence',
      prompts: {
        claude: 'What are people spontaneously frustrated by in this market, and which parts are repeated enough to become a creative question? Keep their language separate from our interpretation.',
        codex: 'Build an evidence table of recurring customer frictions. Link each observed pattern to returned records, mark interpretation separately, and reject any claim whose raw root is missing.',
        cursor: 'Compare the audience claims in the current persona or brief with the available customer-language evidence. Propose annotations for supported, inferred and unsupported statements.'
      }
    },
    {
      id: 'own_truth',
      family: 'own',
      title: 'Are our strongest patterns still relevant?',
      output: 'Own-winner × customer-truth crosswalk',
      sources: ['OWN', 'VOICE'],
      lens: 'optional',
      availability: 'evidence',
      prompts: {
        claude: 'Do our own strongest creative patterns match what customers are telling us, or are we about to repeat the wrong angle?',
        codex: 'Cross-check own best-performing references against customer-language evidence. Return agreements, contradictions and one controlled messaging split; do not rank a winner without comparable outcomes.',
        cursor: 'Compare the current campaign routes with own-reference patterns and customer evidence. Show which mechanisms are preserved, contradicted or unsupported before proposing a patch.'
      }
    },
    {
      id: 'whitespace',
      family: 'market',
      title: 'Where is the credible opening?',
      output: 'Corpus-quality gate · whitespace hypothesis',
      sources: ['COMP', 'NATIVE', 'VOICE'],
      lens: 'none',
      availability: 'configured',
      prompts: {
        claude: 'What is everyone in this category repeating, what does native creator work do differently, and which customer tension still looks unclaimed?',
        codex: 'Audit the competitor and native-reference corpus for relevance, then cluster repeated promises. Return one whitespace hypothesis with supporting, conflicting and missing evidence.',
        cursor: 'Compare the routes in the current campaign with the connected competitor and native-reference corpus. Mark saturated mechanisms and propose only evidence-grounded openings.'
      }
    },
    {
      id: 'local',
      family: 'market',
      title: 'What makes this relevant here, now?',
      output: 'Dated local opportunity · expiry risk',
      sources: ['LOCAL', 'VOICE'],
      lens: 'optional',
      availability: 'configured',
      prompts: {
        claude: 'What is happening in this market that could make our promise unusually relevant now—and what would be opportunistic nonsense?',
        codex: 'Filter the available local signals by date, GEO and provenance. Return one usable context, its expiry risk, contradictory evidence and the proof the creative would need.',
        cursor: 'Review the current localization against available local and customer-language evidence. Propose a diff and flag every line that relies on generic cultural assumptions.'
      }
    },
    {
      id: 'candidate',
      family: 'test',
      title: 'What should we test next?',
      output: 'Grounded candidate · visible evidence chain',
      sources: ['VOICE', 'OWN', 'GRAPH'],
      lens: 'optional',
      availability: 'evidence',
      prompts: {
        claude: 'Given the evidence we actually have, what is the single most useful question to spend media money answering next?',
        codex: 'Which existing concept has the strongest resolvable evidence chain for this audience and market? Show every upstream object, broken edge and missing outcome. Return a test candidate, not a predicted winner.',
        cursor: 'Match the existing concepts in this workspace to the available Orcool evidence. Propose the best-grounded candidate for the next cell and show unresolved lineage before editing anything.'
      }
    },
    {
      id: 'routes',
      family: 'test',
      title: 'How should three routes truly disagree?',
      output: 'Three controlled creative cells',
      sources: ['VOICE', 'OWN', 'COMP', 'NATIVE', 'LOCAL', 'GRAPH'],
      lens: 'optional',
      availability: 'evidence',
      prompts: {
        claude: 'Turn the evidenced tension into three routes that disagree about why the audience should care. Name the mechanism each route tests.',
        codex: 'Create a three-cell test matrix from the selected evidence. Give each cell a distinct mechanism, opening, required proof, one controlled variable, shared KPI gate and provenance.',
        cursor: 'Fit three evidence-grounded route objects into the creative schema in this workspace. If the schema cannot preserve provenance, controlled variables and unknowns, show the schema change first.'
      }
    },
    {
      id: 'claim_gate',
      family: 'quality',
      title: 'Which claims can we defend?',
      output: 'Per-claim support ledger · vetoes',
      sources: ['OWN', 'VOICE', 'COMP', 'NATIVE', 'LOCAL'],
      lens: 'none',
      availability: 'evidence',
      prompts: {
        claude: 'Which statements in this brief are evidence, which are interpretation, and which would embarrass us if a client asked for the source?',
        codex: 'Audit every claim in the brief. Return supporting records, conflicts, missing evidence and SAFE TO TEST, NEEDS QUALIFICATION or UNSUPPORTED for each one.',
        cursor: 'Propose the smallest diff to the current brief or copy that removes or qualifies evidence debt. Show the missing sources needed to restore each claim and wait for approval.'
      }
    },
    {
      id: 'lineage',
      family: 'production',
      title: 'Can we trace this idea to evidence?',
      output: 'Lineage audit · production-readiness gate',
      sources: ['GRAPH', 'VOICE', 'OWN'],
      lens: 'none',
      availability: 'evidence',
      prompts: {
        claude: 'Can I explain where this concept came from, what changed on the way to the pack, and what is still missing before production?',
        codex: 'Trace the selected concept or pack to a meaningful raw evidence root. Report valid edges, broken or empty source references, required assets and finished-video state.',
        cursor: 'Audit the concept and asset manifests in this workspace against Orcool lineage. Propose fixes for missing provenance or production requirements without describing an unlinked pack as evidence-backed.'
      }
    },
    {
      id: 'live_learning',
      family: 'learning',
      title: 'What did the test actually teach us?',
      output: 'Comparable-result audit · descendant plan',
      sources: ['DELIVERY', 'GRAPH', 'OWN'],
      lens: 'optional',
      availability: 'delivery',
      prompts: {
        claude: 'What did this test actually teach us beyond which ad received more clicks, and which part of the winning route should stay fixed?',
        codex: 'Validate cell comparability, attribution, spend, GEO/date and the agreed KPI gate. If the gate passes, isolate the likely mechanism and specify controlled descendants; otherwise abstain.',
        cursor: 'Use the approved test result to propose updates to the experiment record and descendant configs. Preserve the evidenced mechanism and change one variable per child; show the diff first.'
      }
    },
    {
      id: 'team_learning',
      family: 'learning',
      title: 'What does our team keep choosing?',
      output: 'Traceable pick/skip patterns · contradictions',
      sources: ['LENS', 'GRAPH'],
      lens: 'required',
      availability: 'feedback',
      prompts: {
        claude: 'Across our actual picks, skips and comments, what does this team consistently value—and where are we contradicting ourselves?',
        codex: 'Aggregate explicit pick, skip and comment records by route mechanism and decision context. Show underlying feedback, contradictions and sample limits; do not manufacture a Brand Lens score.',
        cursor: 'Compare the current brief with prior approved and rejected route feedback. Propose annotations where it repeats a previously rejected mechanism; do not change the file yet.'
      }
    }
  ];

  var DEFAULT_MISSIONS = {
    claude: ['voice', 'whitespace', 'routes'],
    codex: ['coverage', 'candidate', 'claim_gate'],
    cursor: ['claim_gate', 'routes', 'lineage']
  };

  var MCP_EXECUTION_RULES = [
    'Do not answer from memory, web search or general category knowledge before a successful Orcool tool call.',
    'First call `studio_list_brands` with the Brand / product value below. Use only the brand returned in this run; never guess or reuse a brandId.',
    'Then call `studio_get_brand` and confirm the returned country / GEO. If multiple brands match, ask me to choose one before reading brand-scoped records.',
    'For this task, use only Orcool read/list/get tools. Do not call create, update, delete, generate, analyze, order, grant, revoke, toggle or animate tools.',
    'If no Orcool tool call succeeds, stop and answer exactly: ORCOOL_NOT_CALLED — enable the Orcool connector and retry.',
    'If Orcool runs but the required raw evidence is absent, return NOT_ENOUGH_DATA and name what must be connected next.'
  ].join(' ');

  var TRUTH_SUFFIX = [
    'Separate OBSERVED, INFERRED and UNSUPPORTED.',
    'Start with the resolved brand, GEO and date range or NOT_EXPOSED. List the exact Orcool tools called and the object count returned by each.',
    'For OBSERVED claims, cite the Orcool source objects used and show the evidence coverage and missing inputs.',
    'If the required raw evidence or client outcome data is absent, answer “Not enough data” instead of filling the gap from general knowledge.',
    'Choose exactly one verdict: EVIDENCE_BACKED, HYPOTHESIS_TO_TEST or NOT_ENOUGH_DATA.',
    'End with one decision and the missing inputs.',
    'Do not call a winner or predict lift, ROAS, CPI, CTR or retention unless connected outcome data and the agreed client KPI gate support it.'
  ].join(' ');

  function normalizeAgent(value) {
    var normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'chatgpt') return 'codex';
    return AGENTS[normalized] ? normalized : 'claude';
  }

  function createElement(tagName, className, textValue) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (typeof textValue === 'string') node.textContent = textValue;
    return node;
  }

  function track(eventName, properties) {
    if (!window.umami || typeof window.umami.track !== 'function') return;
    window.umami.track(eventName, properties || {});
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        if (!document.execCommand('copy')) throw new Error('Copy command failed');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
  }

  function initMissionLibrary() {
    var root = document.querySelector('[data-mcp-library]');
    if (!root) return;

    var apply = document.getElementById('apply');
    var agentButtons = apply ? Array.prototype.slice.call(apply.querySelectorAll('button[data-agent]')) : [];
    var brandInput = root.querySelector('[data-scope-brand]');
    var marketInput = root.querySelector('[data-scope-market]');
    var defaultContainer = root.querySelector('[data-default-missions]') || root.querySelector('.starter-prompt-grid');
    var drawerToggle = root.querySelector('[data-library-toggle]');
    var drawerToggleLabel = root.querySelector('[data-library-toggle-label]') || (drawerToggle ? drawerToggle.querySelector('span') : null);
    var drawer = root.querySelector('[data-library-drawer]');
    var familyContainer = root.querySelector('[data-family-filters]');
    var moreContainer = root.querySelector('[data-more-missions]');
    var emptyState = root.querySelector('[data-library-empty]');
    var status = root.querySelector('[data-library-status]') || root.querySelector('#mcp-copy-status');
    var agentSetup = root.querySelector('[data-library-agent-setup]');
    var agentMode = root.querySelector('[data-library-agent-mode]');
    var agentLabel = root.querySelector('[data-library-agent-label]');

    if (!defaultContainer) return;

    var activeButton = agentButtons.find(function (button) {
      return button.classList.contains('is-active') || button.getAttribute('aria-pressed') === 'true';
    });
    var state = {
      agent: normalizeAgent(activeButton ? activeButton.getAttribute('data-agent') : root.getAttribute('data-active-agent')),
      brand: brandInput ? brandInput.value : '',
      market: marketInput ? marketInput.value : '',
      drawerOpen: drawer ? !drawer.hidden : false,
      family: 'all',
      expandedMission: null,
      copiedMission: null
    };
    var copyResetTimer = null;

    function getMission(missionId) {
      return MISSIONS.find(function (mission) { return mission.id === missionId; });
    }

    function getDefaultMissions() {
      return DEFAULT_MISSIONS[state.agent].map(getMission).filter(Boolean);
    }

    function getMoreMissions() {
      var defaults = DEFAULT_MISSIONS[state.agent];
      return MISSIONS.filter(function (mission) {
        return defaults.indexOf(mission.id) === -1;
      });
    }

    function buildCopyPayload(mission) {
      var brand = state.brand.trim();
      var market = state.market.trim();
      var toolPlan = MISSION_TOOL_PLANS[mission.id] || ['studio_get_brand'];
      return [
        AGENTS[state.agent].activation,
        '',
        'This is a bounded evidence task. ' + MCP_EXECUTION_RULES,
        '',
        'Brand / product: ' + brand,
        'Market / GEO: ' + market,
        '',
        'After resolving the brand, use the minimum relevant set from these Orcool read tools:',
        toolPlan.map(function (toolName) { return '- `' + toolName + '`'; }).join('\n'),
        MISSION_LIMITS[mission.id] ? '\nMission boundary: ' + MISSION_LIMITS[mission.id] : '',
        '',
        mission.prompts[state.agent],
        '',
        TRUTH_SUFFIX
      ].join('\n');
    }

    function announce(message) {
      if (status) status.textContent = message;
    }

    function makeAvailabilityBadge(mission) {
      var availability = AVAILABILITY[mission.availability];
      var badge = createElement(
        'span',
        'mission-availability mission-availability--' + mission.availability,
        availability.label
      );
      badge.title = availability.description;
      badge.setAttribute('aria-label', availability.label + '. ' + availability.description);
      return badge;
    }

    function makeCopyButton(mission) {
      var copyButton = createElement('button', 'mcp-copy prompt-copy mission-copy mission-copy-button', 'Copy working prompt');
      copyButton.type = 'button';
      copyButton.setAttribute('data-mission-copy', mission.id);
      copyButton.addEventListener('click', function (event) {
        event.stopPropagation();
        if (!state.brand.trim()) {
          if (brandInput) {
            brandInput.setAttribute('aria-invalid', 'true');
            brandInput.focus();
          }
          announce('Add a brand or product before copying the working prompt.');
          return;
        }
        if (!state.market.trim()) {
          if (marketInput) {
            marketInput.setAttribute('aria-invalid', 'true');
            marketInput.focus();
          }
          announce('Add a market or GEO before copying the working prompt.');
          return;
        }
        var originalLabel = copyButton.textContent;
        copyText(buildCopyPayload(mission)).then(function () {
          state.copiedMission = mission.id;
          copyButton.textContent = 'Working prompt copied';
          announce(AGENTS[state.agent].label + ' · ' + mission.title + ' working prompt copied.');
          track('mcp_prompt_copied', {
            agent: state.agent,
            mission_id: mission.id,
            family: mission.family,
            availability: mission.availability
          });
          window.clearTimeout(copyResetTimer);
          copyResetTimer = window.setTimeout(function () {
            state.copiedMission = null;
            if (copyButton.isConnected) copyButton.textContent = originalLabel;
          }, 1600);
        }).catch(function () {
          announce('Copy failed. Select the prompt and copy it manually.');
        });
      });
      return copyButton;
    }

    function makeDefaultCard(mission, index) {
      var card = createElement('article', 'starter-prompt-card mission-card mission-card--default');
      card.setAttribute('data-mission-card', mission.id);
      card.setAttribute('data-availability', mission.availability);

      var kicker = createElement(
        'span',
        'mission-kicker mission-card-kicker',
        String(index + 1).padStart(2, '0') + ' / ' + MISSION_FAMILIES[mission.family].label
      );
      var title = createElement('strong', 'mission-title mission-card-title', mission.title);
      var prompt = createElement('p', 'mission-prompt mission-card-prompt', mission.prompts[state.agent]);
      var meta = createElement('div', 'mission-card-meta');
      var output = createElement('span', 'mission-output', 'Returns: ' + mission.output);
      var sourceLine = createElement('b', 'mission-sources', 'Required evidence: ' + mission.sources.join(' · '));
      meta.appendChild(makeAvailabilityBadge(mission));
      meta.appendChild(output);
      meta.appendChild(sourceLine);
      if (mission.lens !== 'none') {
        meta.appendChild(createElement('span', 'mission-lens', 'Brand feedback / constraints: ' + mission.lens));
      }

      card.appendChild(kicker);
      card.appendChild(title);
      card.appendChild(prompt);
      card.appendChild(meta);
      card.appendChild(makeCopyButton(mission));
      return card;
    }

    function makeMoreCard(mission) {
      var expanded = state.expandedMission === mission.id;
      var card = createElement('article', 'mission-row');
      card.setAttribute('data-mission-card', mission.id);
      card.setAttribute('data-availability', mission.availability);

      var toggle = createElement('button', 'mission-expand mission-row-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      toggle.setAttribute('aria-controls', 'mission-card-body-' + mission.id);

      var heading = createElement('div', 'mission-expand-heading');
      heading.appendChild(createElement('strong', 'mission-title', mission.title));
      heading.appendChild(makeAvailabilityBadge(mission));
      toggle.appendChild(heading);
      toggle.appendChild(createElement('span', 'mission-output', 'Returns: ' + mission.output));
      toggle.appendChild(createElement('i', 'mission-expand-icon', expanded ? '−' : '+'));

      toggle.addEventListener('click', function () {
        state.expandedMission = expanded ? null : mission.id;
        renderMoreMissions();
      });

      card.appendChild(toggle);
      var detail = createElement('div', 'mission-row-detail');
      detail.id = 'mission-card-body-' + mission.id;
      detail.hidden = !expanded;
      var detailCopy = createElement('div', 'mission-row-copy');
      detailCopy.appendChild(createElement('p', 'mission-card-prompt', mission.prompts[state.agent]));
      detailCopy.appendChild(createElement('small', 'mission-sources', 'Required evidence: ' + mission.sources.join(' · ')));
      if (mission.lens !== 'none') {
        detailCopy.appendChild(createElement('small', 'mission-lens', 'Brand feedback / constraints: ' + mission.lens));
      }
      detail.appendChild(detailCopy);
      detail.appendChild(makeCopyButton(mission));
      card.appendChild(detail);
      return card;
    }

    function renderAgentContext() {
      root.setAttribute('data-active-agent', state.agent);
      if (agentLabel) agentLabel.textContent = AGENTS[state.agent].label;
      if (agentSetup) agentSetup.textContent = AGENTS[state.agent].setup;
      if (agentMode) agentMode.textContent = AGENTS[state.agent].mode;
      agentButtons.forEach(function (button) {
        var active = normalizeAgent(button.getAttribute('data-agent')) === state.agent;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function renderDefaultMissions() {
      var fragment = document.createDocumentFragment();
      getDefaultMissions().forEach(function (mission, index) {
        fragment.appendChild(makeDefaultCard(mission, index));
      });
      defaultContainer.replaceChildren(fragment);
      defaultContainer.setAttribute('aria-label', 'Recommended decisions for ' + AGENTS[state.agent].label);
    }

    function renderFamilyFilters() {
      if (!familyContainer) return;
      var fragment = document.createDocumentFragment();
      var families = [{ id: 'all', label: 'All' }].concat(
        Object.keys(MISSION_FAMILIES).map(function (familyId) {
          return { id: familyId, label: MISSION_FAMILIES[familyId].label };
        })
      );

      families.forEach(function (family) {
        var button = createElement('button', 'mission-family-filter mission-family-chip', family.label);
        var active = state.family === family.id;
        button.type = 'button';
        button.setAttribute('data-family-filter', family.id);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.classList.toggle('is-active', active);
        button.addEventListener('click', function () {
          state.family = family.id;
          state.expandedMission = null;
          renderFamilyFilters();
          renderMoreMissions();
          track('mcp_family_selected', { family: family.id, agent: state.agent });
        });
        fragment.appendChild(button);
      });

      familyContainer.replaceChildren(fragment);
    }

    function renderMoreMissions() {
      if (!moreContainer) return;
      var moreMissions = getMoreMissions().filter(function (mission) {
        return state.family === 'all' || mission.family === state.family;
      });
      var fragment = document.createDocumentFragment();
      moreMissions.forEach(function (mission) {
        fragment.appendChild(makeMoreCard(mission));
      });
      moreContainer.replaceChildren(fragment);

      if (emptyState) {
        emptyState.hidden = moreMissions.length > 0;
        if (!moreMissions.length) {
          emptyState.textContent = 'This decision is featured above for ' + AGENTS[state.agent].label + '.';
        }
      } else if (!moreMissions.length) {
        moreContainer.appendChild(createElement(
          'p',
          'mission-library-empty',
          'This decision is featured above for ' + AGENTS[state.agent].label + '.'
        ));
      }
    }

    function renderDrawer() {
      if (!drawer || !drawerToggle) return;
      drawer.hidden = !state.drawerOpen;
      drawerToggle.setAttribute('aria-expanded', state.drawerOpen ? 'true' : 'false');
      var label = state.drawerOpen ? 'Close more decisions' : 'Explore 8 more decisions';
      if (drawerToggleLabel) drawerToggleLabel.textContent = label;
      else drawerToggle.textContent = label;
    }

    function renderAll() {
      renderAgentContext();
      renderDefaultMissions();
      renderFamilyFilters();
      renderMoreMissions();
      renderDrawer();
    }

    agentButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var nextAgent = normalizeAgent(button.getAttribute('data-agent'));
        if (nextAgent === state.agent) return;
        state.agent = nextAgent;
        state.expandedMission = null;
        renderAll();
        announce(AGENTS[state.agent].label + ' mission library loaded.');
        track('mcp_agent_selected', { agent: state.agent });
      });
    });

    if (brandInput) {
      brandInput.addEventListener('input', function () {
        state.brand = brandInput.value;
        brandInput.removeAttribute('aria-invalid');
      });
    }

    if (marketInput) {
      marketInput.addEventListener('input', function () {
        state.market = marketInput.value;
        marketInput.removeAttribute('aria-invalid');
      });
    }

    if (drawerToggle && drawer) {
      drawerToggle.addEventListener('click', function () {
        state.drawerOpen = !state.drawerOpen;
        renderDrawer();
        if (state.drawerOpen) track('mcp_library_opened', { agent: state.agent });
      });
    }

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMissionLibrary, { once: true });
  } else {
    initMissionLibrary();
  }
})();
