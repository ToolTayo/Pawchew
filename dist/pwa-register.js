if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {
      // The site remains fully usable if installation or offline storage is unavailable.
    });
  }, { once: true });
}
