(function () {
  'use strict';

  var videos = Array.prototype.slice.call(document.querySelectorAll('[data-lineage-video]'));
  var toggle = document.querySelector('[data-lineage-video-toggle]');
  var room = document.querySelector('.pc5-lineage-real');
  if (!videos.length || !toggle || !room) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var manuallyPaused = reducedMotion.matches;
  var inView = false;

  function syncButton() {
    var playing = videos.some(function (video) { return !video.paused; });
    toggle.textContent = playing ? 'Pause all' : 'Play all';
    toggle.setAttribute('aria-label', playing ? 'Pause all lineage videos' : 'Play all lineage videos');
  }

  function pauseAll() {
    videos.forEach(function (video) { video.pause(); });
    syncButton();
  }

  function playAll(userRequested) {
    if ((!inView || document.hidden || reducedMotion.matches) && !userRequested) return;
    videos.forEach(function (video) {
      video.muted = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') result.catch(function () {});
    });
    window.setTimeout(syncButton, 120);
  }

  toggle.addEventListener('click', function () {
    if (videos.some(function (video) { return !video.paused; })) {
      manuallyPaused = true;
      pauseAll();
    } else {
      manuallyPaused = false;
      playAll(true);
    }
  });

  videos.forEach(function (video) {
    video.addEventListener('play', syncButton);
    video.addEventListener('pause', syncButton);
    video.addEventListener('error', syncButton);
  });

  var observer = new IntersectionObserver(function (entries) {
    inView = Boolean(entries[0] && entries[0].isIntersecting);
    if (!inView) pauseAll();
    else if (!manuallyPaused) playAll(false);
  }, { threshold: 0.2 });
  observer.observe(room);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseAll();
    else if (inView && !manuallyPaused) playAll(false);
  });

  if (reducedMotion.matches) pauseAll();
  else syncButton();
}());

(function () {
  'use strict';

  var cast = document.querySelector('[data-chat-cast]');
  if (!cast) return;

  var replay = cast.querySelector('[data-chat-replay]');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hasPlayed = false;

  function play() {
    if (reducedMotion.matches) return;
    var windowNode = cast.querySelector('.pc5-conversation-window');
    var track = cast.querySelector('.pc5-conversation-track');
    if (windowNode && track) {
      var shift = Math.max(0, track.scrollHeight - windowNode.clientHeight);
      track.style.setProperty('--pc5-chat-shift', '-' + shift + 'px');
    }
    cast.classList.remove('is-playing');
    void cast.offsetWidth;
    cast.classList.add('is-playing');
    hasPlayed = true;
  }

  if (replay) replay.addEventListener('click', play);

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (!hasPlayed && entries[0] && entries[0].isIntersecting) {
        play();
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(cast);
  } else {
    play();
  }
}());
