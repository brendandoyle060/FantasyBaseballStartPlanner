document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('firstStarter');
    checkPageButton.addEventListener('click', function() {
  
      chrome.tabs.getSelected(function(tab) {
        d = document;
  
        var f = d.createElement('form');
        f.action = 'https://fantasy.espn.com/';
        f.method = 'get';
        var i = d.createElement('input');
        // i.type = 'hidden';
        i.name = 'url';
        i.value = tab.url;
        f.appendChild(i);
        d.body.appendChild(f);
        f.submit();
      });
    }, false);
  }, false);