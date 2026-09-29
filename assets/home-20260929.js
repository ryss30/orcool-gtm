(() => {
  'use strict';
  const page = document.querySelector('.home-page');
  if (!page) return;
  const track = (name, props = {}) => {
    if (location.hostname === 'get.orcool.com' && window.umami?.track) {
      window.umami.track(name, { route: '/', ...props });
    }
  };
  const text = (selector, value) => { page.querySelector(selector).textContent = value; };
  text('[data-current-year]', String(new Date().getFullYear()));
  page.querySelectorAll('[data-home-event]').forEach(link => {
    link.addEventListener('click', () => track(link.dataset.homeEvent, { placement: link.dataset.placement || 'body' }));
  });

  const stageTabs = [...page.querySelectorAll('[data-stage]')];
  function selectStage(name, focus = false) {
    stageTabs.forEach(tab => {
      const selected = tab.dataset.stage === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focus) tab.focus();
    });
    track('home_demo_stage', { stage: name });
  }
  stageTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStage(tab.dataset.stage));
    tab.addEventListener('keydown', event => {
      const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % stageTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + stageTabs.length) % stageTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = stageTabs.length - 1;
      selectStage(stageTabs[next].dataset.stage, true);
    });
  });
  page.querySelectorAll('[data-go-stage]').forEach(button => button.addEventListener('click', () => selectStage(button.dataset.goStage, true)));
  page.querySelector('[data-explore]').addEventListener('click', () => {
    selectStage('ideas');
    stageTabs[0].focus({ preventScroll: true });
  });
  const ideas = {
    ritual: ['Make the everyday feel like yours.', 'A personal ritual, not another product claim.'],
    pause: ['Take a moment back from the rush.', 'A small pause, not another productivity promise.']
  };
  page.querySelectorAll('[data-idea]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.idea;
    text('[data-idea-title]', ideas[key][0]);
    text('[data-idea-description]', ideas[key][1]);
    page.querySelectorAll('[data-idea]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    track('home_demo_hypothesis', { hypothesis: key });
  }));
  page.querySelector('[data-hero-rewrite]').addEventListener('click', () => {
    const result = page.querySelector('[data-hero-result]');
    result.querySelector('.micro').textContent = 'Illustrative rewrite / English paraphrase';
    result.querySelector('p').textContent = '“A little moment that’s yours.” A possible softer opening for a local to challenge, not verified local phrasing.';
    track('home_demo_rewrite');
  });

  const expressions = {
    film: ['Brand film / atmosphere', 'A familiar ritual becomes the story. Camera, light and pace carry the idea without changing its promise.'],
    creator: ['Creator story / a lived moment', 'The same ritual told in someone’s own setting and words. Local phrasing and any product claim still need review.'],
    motion: ['Motion & static / visual rhythm', 'The same personal-ritual idea expressed through typography, pacing and the product. A different format, not a different hypothesis.']
  };
  page.querySelectorAll('[data-expression]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.expression;
    page.querySelectorAll('[data-expression]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    text('[data-expression-label]', expressions[key][0]);
    text('[data-expression-copy]', expressions[key][1]);
    track('home_demo_expression', { expression: key });
  }));
  const reviews = {
    rewrite: ['Illustrative rewrite / English paraphrase', '“A little moment that’s yours.”', 'Less of a command. More of an everyday feeling. A market contributor would supply and check the actual local phrasing.'],
    keep: ['Illustrative decision / keep with a condition', 'Keep the line. Check the delivery.', 'The words could fit an assertive brand. Ask a local to review how they sound in the full scene before approving an execution.'],
    context: ['Illustrative decision / missing context', 'Who is this moment for?', 'Ask for the audience, intended tone and surrounding scene. Local judgment needs a specific brief, not a country label.']
  };
  page.querySelectorAll('[data-review]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.review;
    page.querySelectorAll('[data-review]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    text('[data-review-label]', reviews[key][0]);
    text('[data-review-line]', reviews[key][1]);
    text('[data-review-reason]', reviews[key][2]);
    track('home_demo_local_decision', { decision: key });
  }));

  const video = page.querySelector('#work-video');
  const versions = {
    25: ['Title treatment', 'An earlier title treatment in this production sequence. Use the player to inspect the exact version.'],
    26: ['Titles over UI', 'A revised title treatment over the product interface. The production version remains separately inspectable.'],
    27: ['Source timing matched', 'Timing aligned to the source in this revision. This is a production change, not evidence of a performance improvement.'],
    28: ['Roaming beat extended', 'The roaming beat is given more time. A new version preserves the earlier files rather than overwriting them.']
  };
  let userPlaybackChoice = false;
  let changingVideo = false;
  let shouldAutoPlay = true;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  page.querySelectorAll('[data-version]').forEach(button => button.addEventListener('click', () => {
    const version = button.dataset.version;
    if (button.getAttribute('aria-pressed') === 'true') return;
    changingVideo = true;
    page.querySelectorAll('[data-version]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    video.src = '/assets/cases/yesim-lineage/c01-thailand-v' + version + '-web.mp4';
    video.setAttribute('aria-label', 'Yesim C01 Thailand, version ' + version);
    text('[data-work-version]', 'v' + version);
    text('[data-version-title]', versions[version][0]);
    text('[data-version-description]', versions[version][1]);
    video.load();
    video.play().catch(() => {});
    track('home_work_version', { version });
  }));
  video.addEventListener('loadeddata', () => { changingVideo = false; });
  video.addEventListener('pointerdown', () => { userPlaybackChoice = true; });
  video.addEventListener('keydown', () => { userPlaybackChoice = true; });
  video.addEventListener('play', () => track('home_work_play'));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      shouldAutoPlay = visible;
      if (userPlaybackChoice || changingVideo) return;
      if (visible && !reducedMotion.matches) video.play().catch(() => {});
      else video.pause();
    }, { threshold: .35 }).observe(video);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (shouldAutoPlay && !userPlaybackChoice && !reducedMotion.matches) video.play().catch(() => {});
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches && !userPlaybackChoice) video.pause(); });
})();
