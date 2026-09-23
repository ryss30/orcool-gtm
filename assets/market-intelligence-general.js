(function () {
  var demo = document.querySelector('[data-mi-demo]');
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
  var hero = document.querySelector('[data-mi-hero]');
  if (hero) {
    var heroStages = [
      { key: 'signal', label: '01 / LOCAL SIGNAL', title: 'Start with what this market is saying.', copy: 'Source context, dates and gaps sit beside the team\'s own creative history.', art: 'REVIEW THE EVIDENCE' },
      { key: 'hypothesis', label: '02 / MOTHER HYPOTHESIS', title: 'Turn the signal into one testable idea.', copy: 'Audience tension, product proof and a distinct creative mechanism travel together.', art: 'READY FOR REVIEW' },
      { key: 'decision', label: '03 / TEAM DECISION', title: 'Keep the reason behind the answer.', copy: 'Yes, refine or no updates the Brand Lens. A live KPI result stays separate until tested.', art: 'REASON CAPTURED · TEST PENDING' }
    ];
    var heroButtons = Array.prototype.slice.call(hero.querySelectorAll('[data-mi-hero-step]'));
    var heroToggle = hero.querySelector('[data-mi-hero-toggle]');
    var heroScreen = hero.querySelector('[data-mi-hero-screen]');
    var heroLabel = hero.querySelector('[data-mi-step-label]');
    var heroTitle = hero.querySelector('[data-mi-step-title]');
    var heroCopy = hero.querySelector('[data-mi-step-copy]');
    var heroArt = hero.querySelector('.mi-console-art-label');
    var heroMobileStage = document.querySelector('[data-mi-mobile-stage]');
    var heroMobileNext = document.querySelector('[data-mi-hero-next]');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var heroIndex = 0;
    var heroPlaying = !reducedMotion.matches;
    var heroVisible = false;
    var heroTimer = 0;

    function syncHeroToggle() {
      heroToggle.innerHTML = heroPlaying ? 'Pause <span aria-hidden="true">Ⅱ</span>' : 'Play <span aria-hidden="true">▶</span>';
      heroToggle.setAttribute('aria-label', heroPlaying ? 'Pause illustrative workflow' : 'Play illustrative workflow');
      hero.classList.toggle('is-playing', heroPlaying && heroVisible);
    }
    function stopHeroTimer() {
      window.clearTimeout(heroTimer);
      heroTimer = 0;
    }
    function scheduleHero() {
      stopHeroTimer();
      syncHeroToggle();
      if (!heroPlaying || !heroVisible || document.hidden) return;
      heroTimer = window.setTimeout(function () {
        selectHero((heroIndex + 1) % heroStages.length);
        scheduleHero();
      }, 4800);
    }
    function selectHero(index) {
      heroIndex = index;
      var stage = heroStages[index];
      heroScreen.setAttribute('data-stage', stage.key);
      heroLabel.textContent = stage.label;
      heroTitle.textContent = stage.title;
      heroCopy.textContent = stage.copy;
      heroArt.textContent = stage.art;
      if (heroMobileStage) heroMobileStage.textContent = stage.label;
      heroButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-mi-hero-step') === stage.key));
      });
      if (!reducedMotion.matches) {
        heroScreen.classList.remove('is-entering');
        void heroScreen.offsetWidth;
        heroScreen.classList.add('is-entering');
      }
    }
    heroButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        heroPlaying = false;
        selectHero(index);
        scheduleHero();
        if (window.umami && typeof window.umami.track === 'function') {
          window.umami.track('Market intelligence hero: stage explored', { stage: heroStages[index].key });
        }
      });
    });
    heroToggle.addEventListener('click', function () {
      heroPlaying = !heroPlaying;
      scheduleHero();
    });
    if (heroMobileNext) heroMobileNext.addEventListener('click', function () {
      heroPlaying = false;
      selectHero((heroIndex + 1) % heroStages.length);
      scheduleHero();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = Boolean(entries[0] && entries[0].isIntersecting);
        hero.classList.toggle('is-in-view', heroVisible);
        scheduleHero();
      }, { threshold: 0.2 }).observe(hero);
    } else {
      heroVisible = true;
      hero.classList.add('is-in-view');
      scheduleHero();
    }
    document.addEventListener('visibilitychange', scheduleHero);
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', function () {
        if (reducedMotion.matches) heroPlaying = false;
        scheduleHero();
      });
    }
    syncHeroToggle();
  }
  if (!demo) return;

  var choices = {
    yes: {
      label: 'Accepted for a test',
      card: 'Accepted for test',
      reason: 'The delivery-first opening is worth testing after the retailer verifies its market-specific promise.',
      reply: 'Yes. Check our actual delivery terms for this market, then test this opening against our product-first creative.',
      next: 'Decision saved in this illustration. The team would approve the factual claim, brief production and run the agreed comparison. No result is available yet.'
    },
    refine: {
      label: 'Revision requested',
      card: 'Needs revision',
      reason: 'The idea may be useful, but the delivery claim and local wording need review.',
      reply: 'Refine. Keep the clarity angle, but use our verified delivery terms and ask someone in-market to check the wording.',
      next: 'Decision saved in this illustration. A revised version would return with approved terms and local review before any test.'
    },
    pass: {
      label: 'Rejected with a reason',
      card: 'Not selected',
      reason: 'Delivery confidence is not the team’s current priority for this market.',
      reply: 'No. Our current barrier is elsewhere. Keep the reason so the next proposal does not repeat this route.',
      next: 'Decision saved in this illustration. A later signal may invite another review; the original reason remains, and the new signal is not a performance result.'
    }
  };

  var buttons = demo.querySelectorAll('[data-decision]');
  var teamReply = demo.querySelector('[data-team-reply]');
  var replyTime = demo.querySelector('[data-reply-time]');
  var systemReply = demo.querySelector('[data-system-reply]');
  var systemMessage = demo.querySelector('.mi-system-reply');
  var memoryDecision = demo.querySelector('[data-memory-decision]');
  var memoryReason = demo.querySelector('[data-memory-reason]');
  var cardPill = demo.querySelector('.mi-card-pill');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-decision');
      var choice = choices[key];
      if (!choice) return;
      buttons.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      teamReply.textContent = choice.reply;
      replyTime.textContent = 'Illustrative response';
      systemReply.textContent = choice.next;
      systemMessage.hidden = false;
      memoryDecision.textContent = choice.label;
      memoryReason.textContent = choice.reason;
      cardPill.textContent = choice.card;
      cardPill.setAttribute('data-state', key);
      demo.classList.add('is-tried');
      var invite = document.querySelector('[data-mi-demo-invite]');
      if (invite) invite.classList.add('is-tried');
      if (window.umami && typeof window.umami.track === 'function') {
        window.umami.track('Market intelligence demo: decision explored', { decision: key });
      }
    });
  });

  var contact = document.querySelector('[data-mi-contact]');
  if (!contact) return;
  var form = contact.querySelector('[data-mi-contact-form]');
  var submitButton = contact.querySelector('[data-mi-contact-submit]');
  var status = contact.querySelector('[data-mi-contact-status]');
  var originalButton = submitButton.innerHTML;
  var sending = false;

  function showStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }
  form.querySelectorAll('input[required]').forEach(function (field) {
    field.addEventListener('input', function () {
      field.removeAttribute('aria-invalid');
      if (status.classList.contains('is-error')) showStatus('', false);
    });
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (sending) return;
    var firstInvalid = null;
    form.querySelectorAll('input[required]').forEach(function (field) {
      field.value = field.value.trim();
      var valid = field.checkValidity();
      field.setAttribute('aria-invalid', String(!valid));
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      showStatus('Add the product or company, market and a valid work email to send your note.', true);
      firstInvalid.focus();
      firstInvalid.reportValidity();
      return;
    }
    var payload = {
      _subject: 'Orcool market coverage conversation',
      source: 'Market intelligence / general landing',
      product_or_company: form.elements.product_or_company.value,
      market: form.elements.market.value,
      email: form.elements.email.value,
      question: form.elements.question.value.trim()
    };
    sending = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    contact.setAttribute('aria-busy', 'true');
    showStatus('', false);
    if (window.umami && typeof window.umami.track === 'function') window.umami.track('Market intelligence contact: send attempted');
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 15000);
    fetch('https://formsubmit.co/ajax/team@orcool.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).then(function (response) {
      if (!response.ok) throw new Error('Contact request failed');
      return response.json();
    }).then(function (result) {
      if (result && (result.success === false || result.success === 'false')) throw new Error('Contact request rejected');
      form.hidden = true;
      showStatus('Thanks — your note was sent. We’ll reply to your work email.', false);
      if (window.umami && typeof window.umami.track === 'function') window.umami.track('Market intelligence contact: sent');
    }).catch(function () {
      showStatus('That didn’t go through. Please try again or use the email link below.', true);
      if (window.umami && typeof window.umami.track === 'function') window.umami.track('Market intelligence contact: failed');
    }).finally(function () {
      window.clearTimeout(timeout);
      sending = false;
      submitButton.disabled = false;
      submitButton.innerHTML = originalButton;
      contact.removeAttribute('aria-busy');
    });
  });
})();
