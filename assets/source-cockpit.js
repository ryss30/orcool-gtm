(function () {
  var cockpit = document.querySelector('[data-source-cockpit]');
  if (!cockpit) return;

  var buttons = Array.from(cockpit.querySelectorAll('[data-source-act]'));
  var panels = Array.from(cockpit.querySelectorAll('[data-source-panel]'));
  var announcement = cockpit.querySelector('[data-source-announcement]');
  var labels = {
    read: 'Read: five source families and the evidence packet are visible.',
    build: 'Build: three distinct creative hypotheses and the internal preflight are visible.',
    learn: 'Learn: the client-platform media gate and compounding boundary are visible.'
  };

  function selectAct(act, shouldFocus) {
    if (!labels[act]) return;

    buttons.forEach(function (button) {
      var active = button.getAttribute('data-source-act') === act;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (active && shouldFocus) button.focus();
    });

    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-source-panel') !== act;
    });

    cockpit.setAttribute('data-act', act);
    if (announcement) announcement.textContent = labels[act];

    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track('PC source system — act selected', { act: act });
    }
  }

  buttons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      selectAct(button.getAttribute('data-source-act'), false);
    });

    button.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var delta = event.key === 'ArrowRight' ? 1 : -1;
      var nextIndex = (index + delta + buttons.length) % buttons.length;
      selectAct(buttons[nextIndex].getAttribute('data-source-act'), true);
    });
  });
})();
