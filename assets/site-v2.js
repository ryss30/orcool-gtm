(function () {
  var pageContext = window.location.pathname.indexOf('/chatgpt/') === 0 ? 'chatgpt' :
    window.location.pathname.indexOf('/gtm-engineers/') === 0 ? 'mcp overview' :
    window.location.pathname.indexOf('/blog/') === 0 ? 'field notes' :
    'performance capital';

  var year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();

  function track(name) {
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(name);
    }
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(field);
      }
    });
  }

  function syncHashPosition() {
    if (!window.location.hash) return;
    var target = document.querySelector(window.location.hash);
    if (!target) return;
    window.requestAnimationFrame(function () {
      target.scrollIntoView({ block: 'start' });
    });
  }

  window.addEventListener('hashchange', syncHashPosition);
  window.addEventListener('load', syncHashPosition);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHashPosition);
  }

  var tabs = document.querySelectorAll('.mcp-tab');
  var guides = document.querySelectorAll('.mcp-guide');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var client = tab.getAttribute('data-client');
      tabs.forEach(function (item) {
        var active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      guides.forEach(function (guide) {
        var active = guide.getAttribute('data-guide') === client;
        guide.classList.toggle('is-active', active);
        guide.hidden = !active;
      });
      track('MCP client selected — ' + client);
    });
  });

  var magicForm = document.getElementById('magic-link-form');
  if (magicForm) {
    var magicEmail = document.getElementById('magic-email');
    var magicButton = magicForm.querySelector('.magic-submit');
    var magicMessage = document.getElementById('magic-message');

    magicEmail.addEventListener('input', function () {
      magicEmail.removeAttribute('aria-invalid');
      if (magicMessage.classList.contains('is-error')) {
        magicMessage.textContent = '';
        magicMessage.classList.remove('is-error');
      }
    });

    magicForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = magicEmail.value.trim();

      if (!email || !magicEmail.checkValidity()) {
        magicEmail.setAttribute('aria-invalid', 'true');
        magicMessage.textContent = 'Enter a valid email address.';
        magicMessage.classList.add('is-error');
        magicEmail.focus();
        return;
      }

      magicButton.disabled = true;
      magicButton.textContent = 'Sending…';
      magicEmail.removeAttribute('aria-invalid');
      magicMessage.textContent = '';
      magicMessage.classList.remove('is-error');
      track('Magic link requested — ' + pageContext);

      fetch('https://app.orcool.com/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          isBusiness: false,
          baseUrl: 'https://app.orcool.com'
        })
      }).then(function (response) {
        if (!response.ok) throw new Error('Magic link request failed');
        magicForm.classList.add('is-sent');
        magicEmail.readOnly = true;
        magicButton.textContent = 'Sent';
        magicMessage.textContent = 'Magic link sent to ' + email + '. Open it to sign in, then add the MCP URL below.';
        track('Magic link sent — ' + pageContext);
      }).catch(function () {
        magicButton.disabled = false;
        magicButton.textContent = 'Send magic link';
        magicMessage.textContent = 'Couldn’t send the link. Try again or copy the MCP URL below.';
        magicMessage.classList.add('is-error');
        track('Magic link failed — ' + pageContext);
      });
    });
  }

  var status = document.getElementById('mcp-copy-status');
  document.querySelectorAll('.mcp-copy').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy');
      var target = button.getAttribute('data-copy-target');
      if (!value && target) {
        var source = document.querySelector(target);
        value = source ? source.textContent.trim() : '';
      }
      if (!value) return;

      var original = button.textContent;
      copyText(value).then(function () {
        var isPrompt = button.classList.contains('prompt-copy');
        button.textContent = 'Copied';
        if (status) status.textContent = isPrompt ? 'First prompt copied.' : 'MCP URL copied. Add it in your client.';
        track(isPrompt ? 'First MCP prompt copied' : 'MCP URL copied');
        window.setTimeout(function () { button.textContent = original; }, 1600);
      }).catch(function () {
        if (status) status.textContent = 'Copy failed. Select the text and copy it manually.';
      });
    });
  });

  var partnerForm = document.getElementById('design-partner-form');
  if (partnerForm) {
    var partnerButton = partnerForm.querySelector('.fit-submit');
    var partnerMessage = document.getElementById('design-partner-message');
    var partnerFields = partnerForm.querySelectorAll('input[required]');

    partnerFields.forEach(function (field) {
      field.addEventListener('input', function () {
        field.removeAttribute('aria-invalid');
        if (partnerMessage.classList.contains('is-error')) {
          partnerMessage.textContent = '';
          partnerMessage.classList.remove('is-error');
        }
      });
    });

    partnerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var invalidField = null;

      partnerFields.forEach(function (field) {
        var isValid = field.checkValidity() && field.value.trim();
        if (isValid) {
          field.removeAttribute('aria-invalid');
        } else {
          field.setAttribute('aria-invalid', 'true');
        }
        if (!isValid && !invalidField) invalidField = field;
      });

      if (invalidField) {
        partnerMessage.textContent = 'Complete the required fields so we can assess the test.';
        partnerMessage.classList.add('is-error');
        invalidField.focus();
        return;
      }

      var payload = {};
      new FormData(partnerForm).forEach(function (value, key) {
        payload[key] = value;
      });

      partnerButton.disabled = true;
      partnerButton.innerHTML = 'Sending…';
      partnerMessage.textContent = '';
      partnerMessage.classList.remove('is-error');
      track('Design partner application submitted');

      fetch('https://formsubmit.co/ajax/team@orcool.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }).then(function (response) {
        if (!response.ok) throw new Error('Application request failed');
        return response.json();
      }).then(function () {
        var email = partnerForm.elements.email.value.trim();
        partnerForm.classList.add('is-sent');
        partnerForm.querySelector('.fit-form-head h3').textContent = 'Application received.';
        partnerMessage.textContent = 'Thanks — we’ll review the test conditions and reply to ' + email + '.';
        track('Design partner application sent');
      }).catch(function () {
        partnerButton.disabled = false;
        partnerButton.innerHTML = 'Request a fit review <span class="button-arrow" aria-hidden="true">→</span>';
        partnerMessage.textContent = 'We couldn’t send this yet. Please try again in a moment.';
        partnerMessage.classList.add('is-error');
        track('Design partner application failed');
      });
    });
  }
})();
