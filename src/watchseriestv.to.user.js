// ==UserScript==
// @name        Better watchseriestv.to
// @namespace   watchseriestv
// @description Use this extension to get a download-link to watch the episode in a player of your choice instead of the webplayer garnished by a few hundred popups. (Works only on gorillavid-links at the momen)
// @updateUR   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/watchseriestv.to.user.js
// @downloadUR https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/watchseriestv.to.user.js
// @include     /^https?://(www\.)?watchseriestv\.to/.*$/
// @include     /^https?://([^/]*\.)?gorillavid.in/.*$/
// @version     1.0
// @grant GM_xmlhttpRequest
// ==/UserScript==

(function(){
var DownloadManager = function(){
    this.link = '';
};
DownloadManager.prototype.startDownload = function(){
    var self = this;
    GM_xmlhttpRequest({
      method: 'GET',
      url: self.link.href,
      onload: self.parseAndProcessLinkPage.bind(self)
    });
    return false;
};
DownloadManager.prototype.parseAndProcessVideoPage = function(){
    console.log('Provider has to implement parseAndProcessVideoPage()!');
};
DownloadManager.prototype.checkTitle = function(title){
    return this.checkUrl(title);
};
DownloadManager.prototype.checkUrl = function(url){
    return false;
};
DownloadManager.supportedProviders = [];
DownloadManager.addSupportedProvider = function(constructor, methods){
    var i, l;
    if (!methods) {
        methods = constructor;
        constructor = function(){};
    }
    if (methods.length && methods instanceof Array) {
        for (i = methods.length; i--; ) {
            DownloadManager.addSupportedProvider(methods[i]);
        }
        return false;
    };
    constructor.prototype = new DownloadManager;
    for (i in methods) {
        if (methods.hasOwnProperty(i)) {
            constructor.prototype[i] = methods[i];
        }
    }
    l = DownloadManager.supportedProviders.push(constructor);
};
DownloadManager.initiateDownloadLinks = function(){
    var videoLinks, i, j, provider, link;
    videoLinks = document.getElementsByClassName('buttonlink');
    for (i = videoLinks.length; i--; ) {
        link = videoLinks[i];
        for (j = DownloadManager.supportedProviders.length; j--; ) {
            provider = new DownloadManager.supportedProviders[j];
            if (provider.checkTitle(link.title)) {
                console.log(provider.website);
                provider.link = link;
                link.style.background = '#6aa';
                link.onclick = provider.startDownload.bind(provider);
                break;
            }
        }
    }
};

DownloadManager.addSupportedProvider({
    website: 'gorillavid.in',
    checkUrl: function(url){
        return /gorillavid\.in/.test(url);
    }
});

DownloadManager.initiateDownloadLinks();



})()

(function(){
    return;
  var referer = ''; // ugly work around
  var findAllRelevantVideoLinks = function() {
    var ret = [];
    var videoLinks = document.getElementsByClassName('buttonlink');
    for (var i = videoLinks.length; i--; ) {
      switch (videoLinks[i].title) {
        case 'gorillavid.in':
          ret.push(videoLinks[i]);
          break;
      }
    }
    return ret;
  };
  var parseAndProcessLinkPage = function(response){
    var wrapper = document.createElement('div');
    wrapper.innerHTML = response.responseText;
    var url = wrapper.querySelector('.push_button').href
    referer = this.url;
    processVideoPage(url);
  }
  var processVideoPage = function(url) {
    var processor = processGorillavidInPage;
    if (/gorillavid\.in/.test(url)) {
      processor = processGorillavidInPage;
    }
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: processor
    });
  };
  var processGorillavidInPage = function(response) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = response.responseText;
    var form = wrapper.querySelector('[name=fname]').parentNode;
    var inputs = form.querySelectorAll('[name]');
    var data = [];
    for (var i = inputs.length; i--; ) {
      if (inputs[i].name == 'referer') {
        inputs[i].value = referer;
      }
      data.push(inputs[i].name + '=' + encodeURIComponent(inputs[i].value));
    }
    var url = this.url;
    GM_xmlhttpRequest({
      method: 'POST',
      data: data.join('&'),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      url: url,
      onload: processGorillavidInPagePost
    });
  };
  var processGorillavidInPagePost = function(response){
    responseText = response.responseText;
    search1 = 'file: "';
    search2 = '"';
    var url = responseText.substr(responseText.indexOf(search1) + search1.length);
    url = url.substr(0, url.indexOf(search2));
    location.href = url;
  };
  var openLinkPage = function(){
    var url = this.href;
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: parseAndProcessLinkPage
    });
    return false;
  };
  var cleanVideoLinks = function() {
    var videoLinks = findAllRelevantVideoLinks();
    for (var i = videoLinks.length; i--; ) {
      videoLinks[i].onclick = openLinkPage;
    }
  }
  cleanVideoLinks();
})()
