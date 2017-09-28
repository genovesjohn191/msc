if (window['ENV_CONFIG'].environment === 'production') {
  var script = document.createElement('script');
  script.src = 'assets/new.relic-prod.js';
  document.head.appendChild(script);
}