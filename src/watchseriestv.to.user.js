// ==UserScript==
// @name        Better watchseriestv.to
// @namespace   watchseriestv
// @description Use this extension to get a download-link to watch the episode in a player of your choice instead of the webplayer garnished by a few hundred popups. (Works only on gorillavid-links at the momen)
// @updateURL   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/watchseriestv.to.user.js
// @downloadURL https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/watchseriestv.to.user.js
// @include     /^https?://(www\.)?thewatchseries\.to/.*$/
// @include     /^https?://(www\.)?watchseriestv\.to/.*$/
// @include     /^https?://(www\.)?watch\-series\-tv\.to/.*$/
// @include     /^https?://([^/]*\.)?gorillavid.in/.*$/
// @version     2.5
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
DownloadManager.prototype.offerDownload = function(url, failure){
    if (!failure) {
        DownloadManager.iframe.src = url;
        console.log(url);
        this.link.href = url;
        this.link.innerHTML += ' →';
        this.link.onclick = function(){
            DownloadManager.iframe.src = this.href;
            return false;
        };
    } else {
        var dimensions = DownloadManager.getDimensions(this.link);
        var position = dimensions.page;
        position.x += dimensions.width + 4;
        DownloadManager.failureMessage.style.left = position.x + 'px';
        DownloadManager.failureMessage.style.top = position.y + 'px';
    }
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
DownloadManager.getDimensions = function(el){
    var elCpy = el;
    var x = 0;
    var y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {
        page: {x: x, y: y},
        top: elCpy.offsetTop - elCpy.scrollTop,
        left: elCpy.offsetLeft - elCpy.scrollLeft,
        width: elCpy.offsetWidth,
        height: elCpy.offsetHeight
    };
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
DownloadManager.iframe = document.createElement('iframe');
DownloadManager.failureMessage = document.createElement('span');
DownloadManager.initiateDownloadLinks = function(){
    var ad = document.querySelector('.a-el');
    if (ad) {
        ad.parentNode.removeChild(ad);
    }
    delete ad;
    document.body.appendChild(DownloadManager.iframe);
    document.body.appendChild(DownloadManager.failureMessage);
    DownloadManager.failureMessage.innerHTML = 'There occured a failure during loading this video';
    DownloadManager.failureMessage.style.background = '#faa';
    DownloadManager.failureMessage.style.border = '1px solid #900';
    DownloadManager.failureMessage.style.color = '#900';
    DownloadManager.failureMessage.style.position = 'absolute';
    DownloadManager.failureMessage.style.borderRadius = '3px';
    DownloadManager.failureMessage.style.padding = '0px 7px';
    DownloadManager.failureMessage.style.fontSize = '15px';
    DownloadManager.failureMessage.style.lineHeight = '22px';
    DownloadManager.failureMessage.style.marginTop = '-2px';
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
            } else if (!link.title || link.title == '' || link.title == 'Sponsored') {
                link.style.display = 'none';
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
            this.offerDownload(url);
        } else {
            console.log(url);
            if (this.counter < 3) {
                this.parseAndProcessVideoPage(this.response);
            } else {
                this.offerDownload(false, true);
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
                this.offerDownload(links[i].href);
                console.log(links[i].href);
                return;
            }
        }
        this.offerDownload(false, true);
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
            this.offerDownload(url);
        } else {
            console.log(url);
            if (this.counter < 3) {
                this.parseAndProcessVideoPage(this.response);
            } else {
                this.offerDownload(false, true);
                this.counter = 0;
                console.log('Not possible to follow this download link');
            }
        }
    }
});

DownloadManager.initiateDownloadLinks();
DownloadManager.showAllPossiblePages();
DownloadManager.showAllPossiblePages(true);
