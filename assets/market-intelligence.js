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
      reason: 'The short-session promise is worth testing once the game team confirms product proof.',
      reply: 'Yes. This speaks to a real use moment. Confirm the level-completion proof, then test it against our current opening.',
      next: 'Decision saved in this illustration. The team would now brief its own production and run the agreed comparison. No result is available yet.'
    },
    refine: {
      label: 'Revision requested',
      card: 'Needs revision',
      reason: 'The moment is promising, but the product proof and local wording need work.',
      reply: 'Refine. Keep the short-session angle, but show the actual game loop and check the wording with someone in-market.',
      next: 'Decision saved in this illustration. A revised version would return with product proof and local review before any test.'
    },
    pass: {
      label: 'Rejected with a reason',
      card: 'Not selected',
      reason: 'This audience tension does not match the team’s current priority for this market.',
      reply: 'No. We are focused on a different player motivation in this market. Keep this reason so the next proposal does not repeat it.',
      next: 'Decision saved in this illustration. A later market signal may invite a fresh review; the original reason remains, and the new signal is not a performance result.'
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
      if (window.umami && typeof window.umami.track === 'function') {
        window.umami.track('Market intelligence demo: decision explored', { decision: key });
      }
    });
  });
})();
