(() => {
  'use strict';
  const status = document.getElementById('copy-status');
  document.querySelectorAll('[data-copy-target]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const content = document.getElementById(button.dataset.copyTarget);
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(content.innerText.trim());
        const originalLabel = button.textContent;
        button.textContent = 'Copied';
        button.disabled = true;
        setTimeout(() => {
          button.textContent = originalLabel;
          button.disabled = false;
        }, 2000);
        status.textContent = button.dataset.copyName + ' copied. Paste it into your working document.';
      } catch {
        status.textContent = 'Copy was unavailable. Select the text or use Download .txt.';
      }
    });
  });
})();
