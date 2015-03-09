// ==UserScript==
// @name        Better watchseriestv.to
// @namespace   watchseriestv
// @description Use this extension to get a download-link to watch the episode in a player of your choice instead of the webplayer garnished by a few hundred popups. (Works only on gorillavid-links at the momen)
// @updateURL   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/watchseriestv.to.user.js
// @downloadURL https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/watchseriestv.to.user.js
// @include     /^https?://(www\.)?watchseriestv\.to/.*$/
// @include     /^https?://([^/]*\.)?gorillavid.in/.*$/
// @version     2.0
// @grant GM_xmlhttpRequest
// ==/UserScript==

var DownloadManager = function(){
    this.link = '';
    this.videoPageUrl = '';
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
DownloadManager.prototype.parseAndProcessLinkPage = function(response){
    var wrapper = document.createElement('div');
    wrapper.innerHTML = response.responseText;
    var url = wrapper.querySelector('.push_button').href;
    this.videoPageUrl = url;
    var self = this;
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: self.parseAndProcessVideoPage.bind(self)
    });
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
                provider.link = link;
                link.style.background = '#6aa';
                link.onclick = provider.startDownload.bind(provider);
                break;
            }
        }
    }
};

DownloadManager.showAllPossiblePages = function(inDev) {
    console.log('Currently ' + (inDev ? 'in development' : 'supported'));
    for (var i = DownloadManager.supportedProviders.length; i--; ) {
        provider = new DownloadManager.supportedProviders[i];
        if (inDev) {
            if (provider.todo) {
                for (var j = provider.websites.length; j--; ) {
                    console.log('- ' + provider.websites[j]);
                }
            }
        } else {
            if (!provider.todo) {
                for (var j = provider.websites.length; j--; ) {
                    console.log('- ' + provider.websites[j]);
                }
            }
        }
    }
};

/**
 * Videoprovider specific codes
 */
DownloadManager.addSupportedProvider({
    name: 'Gorillavid and others',
    description: 'gorillavid.in, daclips.in, movpod.in, vodlocker.com',
    websites: ['gorillavid.in', 'daclips.in', 'movpod.in', 'vodlocker.com'],
    checkUrl: function(url){
        return /(gorillavid|daclips|movpod)\.in|(vodlocker)\.com/.test(url);
    },
    parseAndProcessVideoPage: function(response){
        this.response = response;
        this.counter = this.counter || 0;
        ++this.counter;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = response.responseText;
        var form = wrapper.querySelector('[name=fname]').parentNode;
        var inputs = form.querySelectorAll('[name]');
        var data = [];
        for (var i = inputs.length; i--; ) {
            var input = inputs[i];
            data.push(input.name + '=' + encodeURIComponent(input.value));
        }
        var url = this.videoPageUrl;
        var self = this;
        var timeout = 100;
        setTimeout(function(){
            GM_xmlhttpRequest({
                method: 'POST',
                data: data.join('&'),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                url: url,
                onload: self.parseAndProcessVideoPagePost.bind(self)
            });
        }, timeout);
    },
    parseAndProcessVideoPagePost: function(response){
        responseText = response.responseText;
        var s1 = 'file: "';
        var s2 = 'file: "http://';
        var s3 = '"';
        var url = responseText.substr(responseText.indexOf(s2) + s1.length);
        url = url.substr(0, url.indexOf(s3));
        if (/^http:\/\//.test(url)) {
            location.href = url;
        } else {
            console.log(url);
            if (this.counter < 3) {
                this.parseAndProcessVideoPage(this.response);
            } else {
                this.counter = 0;
                console.log('Not possible to follow this download link');
            }
        }
    }
});
DownloadManager.addSupportedProvider({
    todo: 'Find out how it really works!',
    name: 'movreel',
    description: 'movreel.com',
    websites: ['movreel.com'],
    checkUrl: function(url){
        return false;
        // return /(movreel)\.com/.test(url);
    },
    parseAndProcessVideoPage: function(response){
        this.response = response;
        this.counter = this.counter || 0;
        ++this.counter;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = response.responseText;
        var form = wrapper.querySelector('[name=F1]');
        console.log(form);
        var inputs = form.querySelectorAll('[name]');
        var data = [];
        wrapper.querySelector('#btn_download').value = 'Sending File...';
        for (var i = inputs.length; i--; ) {
            var input = inputs[i];
            data.push(input.name + '=' + encodeURIComponent(input.value));
        }
        var url = this.videoPageUrl;
        var self = this;
        var timeout = 0;
        console.log(data);
        setTimeout(function(){
            GM_xmlhttpRequest({
                method: 'POST',
                data: data.join('&'),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                url: url,
                onload: self.parseAndProcessVideoPagePost.bind(self)
            });
        }, timeout);
    },
    parseAndProcessVideoPagePost: function(response){
        responseText = response.responseText;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = responseText;
        var links = wrapper.querySelectorAll('a');
        for (var i = links.length; i--; ) {
            if (links[i].innerHTML == 'Download Link') {
                console.log(links[i].href);
                location.href = links[i].href;
                return;
            }
        }
        console.log('Not possible to follow this download link');
    }
});
DownloadManager.addSupportedProvider({
    todo: 'Find out how it really works!',
    name: 'ALL MY VIDEOS',
    description: 'allmyvideos.net and vidspot.net',
    websites: ['allmyvideos.net', 'vidspot.net'],
    checkUrl: function(url){
        return false;
        // return /(allmyvideos|vidspot)\.net/.test(url);
    },
    parseAndProcessVideoPage: function(response){
        this.response = response;
        this.counter = this.counter || 0;
        ++this.counter;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = response.responseText;
        var form = wrapper.querySelector('[name=fname]').parentNode;
        var inputs = form.querySelectorAll('[name]');
        var data = [];
        for (var i = inputs.length; i--; ) {
            var input = inputs[i];
            data.push(input.name + '=' + encodeURIComponent(input.value));
        }
        data.push('x=75');
        data.push('y=22');
        var url = this.videoPageUrl;
        var self = this;
        var timeout = 1000;
        console.log(data);
        setTimeout(function(){
            GM_xmlhttpRequest({
                method: 'POST',
                data: data.join('&'),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                url: url,
                onload: self.parseAndProcessVideoPagePost.bind(self)
            });
        }, timeout);
    },
    parseAndProcessVideoPagePost: function(response){
        responseText = response.responseText;
        var s1 = 'file : "';
        var s2 = 'file : "http://';
        var s3 = '"';
        var url = responseText.substr(responseText.indexOf(s2) + s1.length);
        url = url.substr(0, url.indexOf(s3));
        if (/^http:\/\//.test(url)) {
            location.href = url;
        } else {
            console.log(url);
            if (this.counter < 3) {
                this.parseAndProcessVideoPage(this.response);
            } else {
                this.counter = 0;
                console.log('Not possible to follow this download link');
            }
        }
    }
});

DownloadManager.initiateDownloadLinks();
DownloadManager.showAllPossiblePages();
DownloadManager.showAllPossiblePages(true);
