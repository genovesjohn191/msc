(function() {
  var unsupportedBrowser = /(msie|trident)/i.test(navigator.userAgent);
  if (unsupportedBrowser) {
    var body = document.body;
    body.className = "unsupported";
    body.innerHTML = '<div>Internet Explorer version 11 and earlier is unsupported. Please switch to a modern version or browser.</div>';
    
    // Temporarily disable GA when browser is not supported.
    // var path = (location.pathname+location.search).substr(1);

    // dataLayer.push({
    //   'userID': 'unkown',
    //   'companyGroup': 'unknown',
    //   'event': 'userIdentityUpdate'
    // });

    // dataLayer.push({
    //   'event': 'virtualPageView',
    //   'virtualPageURL': path
    // });
  }
})();