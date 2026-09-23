(function () {
  function track(eventName, properties) {
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(eventName, properties);
    }
  }

  var study = document.querySelector('[data-mi-game-study]');
  if (study) {
    var gameFocuses = {
      difficulty: {
        hook: 'Can you beat the next puzzle?',
        status: 'FICTIONAL PAST ROUTE / DIFFICULTY',
        note: 'Earlier creative led with puzzle difficulty in this fictional history. No campaign result is shown.'
      },
      reward: {
        hook: 'Make a short session feel like progress.',
        status: 'PROPOSED HYPOTHESIS / PL-01',
        note: 'Show a complete, satisfying moment. Real gameplay proof and a paid comparator are still needed.'
      }
    };
    var focusButtons = study.querySelectorAll('[data-mi-game-focus]');
    var gameHook = study.querySelector('[data-mi-game-hook]');
    var gameStatus = study.querySelector('[data-mi-game-status]');
    var gameNote = study.querySelector('[data-mi-game-note]');
    var motion = study.querySelector('[data-mi-game-motion]');
    var motionLabel = motion.querySelector('span');
    var motionToggle = motion.querySelector('[data-mi-game-toggle]');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var playing = !reducedMotion.matches;
    var heroVisible = true;
    var cycleTimer = null;

    function selectFocus(focus, source) {
      var content = gameFocuses[focus];
      if (!content) return;
      if (study.getAttribute('data-focus') !== focus) {
        study.setAttribute('data-focus', focus);
        gameHook.textContent = content.hook;
        gameStatus.textContent = content.status;
        gameNote.textContent = content.note;
        focusButtons.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item.getAttribute('data-mi-game-focus') === focus));
        });
        if (source === 'manual') track('Market intelligence gaming hero: focus explored', { focus: focus });
      }
      scheduleCycle();
    }

    function scheduleCycle() {
      if (cycleTimer) window.clearTimeout(cycleTimer);
      cycleTimer = null;
      motion.classList.remove('is-running');
      var active = playing && heroVisible && !document.hidden && !reducedMotion.matches;
      study.classList.toggle('is-animating', active);
      motionToggle.setAttribute('aria-pressed', String(!playing));
      motionToggle.setAttribute('aria-label', playing ? 'Pause animated example' : 'Play animated example');
      motionToggle.innerHTML = playing ? 'Pause <span aria-hidden="true">Ⅱ</span>' : 'Play <span aria-hidden="true">▶</span>';
      motionLabel.innerHTML = reducedMotion.matches ? '<i aria-hidden="true"></i> MOTION OFF IN SYSTEM SETTINGS' : playing ? '<i aria-hidden="true"></i> THE EXAMPLE PLAYS ON ITS OWN' : '<i aria-hidden="true"></i> EXAMPLE PAUSED';
      motionToggle.hidden = reducedMotion.matches;
      if (!active) return;
      void motion.offsetWidth;
      motion.classList.add('is-running');
      cycleTimer = window.setTimeout(function () {
        selectFocus(study.getAttribute('data-focus') === 'reward' ? 'difficulty' : 'reward', 'auto');
      }, 6200);
    }

    focusButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectFocus(button.getAttribute('data-mi-game-focus'), 'manual');
      });
    });
    motionToggle.addEventListener('click', function () {
      playing = !playing;
      scheduleCycle();
    });
    document.addEventListener('visibilitychange', scheduleCycle);
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', function () {
        playing = !reducedMotion.matches;
        scheduleCycle();
      });
    }
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        scheduleCycle();
      }, { threshold: 0.15 });
      observer.observe(study);
    }
    scheduleCycle();
  }

  var demo = document.querySelector('[data-mi-demo]');
  if (demo) {
    demo.querySelectorAll('[data-decision]').forEach(function (button) {
      button.addEventListener('click', function () {
        demo.classList.add('is-tried');
        var invite = document.querySelector('[data-mi-demo-invite]');
        if (invite) invite.classList.add('is-tried');
      });
    });
  }

  var contact = document.querySelector('[data-mi-contact]');
  if (!contact) return;

  var form = contact.querySelector('[data-mi-contact-form]');
  var button = contact.querySelector('[data-mi-contact-submit]');
  var status = contact.querySelector('[data-mi-contact-status]');
  var originalButton = button.innerHTML;
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
      showStatus('Add the game or studio, market and a valid work email to send your note.', true);
      firstInvalid.focus();
      firstInvalid.reportValidity();
      return;
    }

    var payload = {
      _subject: 'Orcool game and market conversation',
      source: 'Market intelligence / gaming landing',
      game_or_studio: form.elements.game_or_studio.value,
      market: form.elements.market.value,
      email: form.elements.email.value,
      question: form.elements.question.value.trim()
    };
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    contact.setAttribute('aria-busy', 'true');
    showStatus('', false);
    track('Market intelligence gaming contact: send attempted');

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
      if (result && (result.success === false || result.success === 'false')) {
        throw new Error('Contact request rejected');
      }
      form.hidden = true;
      showStatus('Thanks — your note was sent. We’ll reply to your work email.', false);
      track('Market intelligence gaming contact: sent');
    }).catch(function () {
      showStatus('That didn’t go through. Please try again or use the email link below.', true);
      track('Market intelligence gaming contact: failed');
    }).finally(function () {
      window.clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.innerHTML = originalButton;
      contact.removeAttribute('aria-busy');
    });
  });
})();
