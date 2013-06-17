chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', { 
    'bounds': {
      'width': 1500,
      'height': 750
    }
  });
});
