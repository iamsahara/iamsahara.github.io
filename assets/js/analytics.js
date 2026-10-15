// Keep the existing production analytics and opt-in consent configuration.
// Local previews must not create production visit activity.
if (['iamsahara.com', 'www.iamsahara.com', 'iamsahara.github.io'].includes(location.hostname)) {
  const analytics = document.createElement('script');
  analytics.src = 'https://api.prospix.ai/cdn/pxl-loader.js';
  analytics.dataset.siteKey = 'yYuN0G0u_gx5OeBScwyhcPvmJmnFnf27';
  analytics.dataset.api = 'https://ingest.prospix.ai';
  analytics.dataset.consentMode = 'opt-in';
  analytics.async = true;
  document.head.append(analytics);
}
