// OMA Traffic Tracker — sem cookies, sem PII, LGPD-safe
(function(){
  try {
    var p = window.location.pathname;
    var u = window.location.href;
    var ref = document.referrer || '';
    var sp = new URLSearchParams(window.location.search);
    var payload = {
      url: u, path: p, referrer: ref,
      utm_source: sp.get('utm_source')||'',
      utm_medium: sp.get('utm_medium')||'',
      utm_campaign: sp.get('utm_campaign')||''
    };
    // Evita contar bots óbvios
    if (/bot|crawl|spider|slurp|mediapartners/i.test(navigator.userAgent)) return;
    // Fire-and-forget
    fetch('https://api.onemanarmyproject.com.br/traffic/hit', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function(){});
  } catch(e){}
})();
