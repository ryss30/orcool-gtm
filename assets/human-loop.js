(function () {
  var root = document.querySelector('[data-human-loop]');
  if (!root) return;

  var buttons = Array.from(root.querySelectorAll('[data-human-step]'));
  var panels = Array.from(root.querySelectorAll('[data-human-panel]'));
  var announcement = root.querySelector('[data-human-announcement]');
  var labels = {
    voices: 'Local voices: available market evidence is visible.',
    lens: 'Brand Lens: observed, inferred, unsupported and missing evidence are separated.',
    jury: 'Local Jury: native review questions and the uncommissioned status are visible.',
    production: 'Production: the route is held until local review is resolved.',
    delivery: 'Delivery: no result is claimed until client-platform data crosses the agreed gate.'
  };

  function selectStage(stage, focusButton) {
    if (!labels[stage]) return;

    buttons.forEach(function (button) {
      var active = button.getAttribute('data-human-step') === stage;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (active && focusButton) button.focus();
    });

    panels.forEach(function (panel) {
      var active = panel.getAttribute('data-human-panel') === stage;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    root.querySelector('[data-human-stage]').setAttribute('data-human-stage', stage);
    if (announcement) announcement.textContent = labels[stage];

    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track('PC local judgment — stage selected', { stage: stage });
    }
  }

  buttons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      selectStage(button.getAttribute('data-human-step'), false);
    });

    button.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      var forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      var next = (index + (forward ? 1 : -1) + buttons.length) % buttons.length;
      selectStage(buttons[next].getAttribute('data-human-step'), true);
    });
  });
})();
