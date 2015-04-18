// ==UserScript==
// @name        Translater-menu
// @namespace   dictmenu
// @description This Script offers a special context-menu to translate words by using dict.cc
// @version     1.3
// @updateURL   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/translation-menu.user.js
// @downloadURL https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/translation-menu.user.js
// @include     http://*
// @include     https://*
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// ==/UserScript==

(function(d, w){
    var ctrlKeyPressed = false;
    var ctrlKeyCode = 17;
    var menuIsPresent = false;
    var menuWidth = 400;
    var container = d.createElement('div');
    var containerId = 'translation-popup-id';
    var finalContainerId = false;
    var mouseTop = 0;
    var mouseLeft = 0;
    var containerCss = {
        'position': 'absolute',
        'top': '-900%',
        'left': '-900%',
        'z-index': '100000',
        'width': menuWidth + 'px',
        'background': '#e9e9e9',
        'border': '1px solid #ccc',
        'color': '#000'
    };
    var containerTableCss = {'border-collapse': 'collapse'};
    var containerTableRowCss = {'border-top': '1px solid #ccc'};
    var containerTableCellCss = {'border-left': '1px solid #ccc'};
    var containerText = {
        'margin': '0',
        'padding': '0',
        'border': 'none',
        'background': 'none',
        'color': 'inherit',
        'font-size': '13px'
    };
    var leftColumnCss = {
        'width': Math.floor((menuWidth-2)/2)  + 'px',
        'text-align': 'left'
    };
    var rightColumnCss = {
        'width': Math.ceil((menuWidth-2)/2)  + 'px',
        'text-align': 'right'
    };
    var headRowCss = {
        'width': (menuWidth - 2) + 'px',
        'padding-top': '.2em',
        'padding-top': '.1em',
        'font-size': '16px',
        'background': '#00f',
        'color': '#fff',
        'text-align': 'center'
    };
    var containerLinkHover = {'text-decoration': 'underline'};
    var calculateFinalContainerId = function(containerId, finalContainerId) {
        if (!finalContainerId) {
            var suffix = '';
            var counter = 0;
            for (; d.getElementById(containerId + suffix); ++counter) {
                suffix = '-' + counter;
            }
            finalContainerId = containerId + suffix;
        }
        return finalContainerId;
    };
    var createCssRule = function(selector, declaration) {
        var rule = selector + ' { ';
        for (var property in declaration) {
            if (declaration.hasOwnProperty(property)) {
                rule += property + ':' + declaration[property] + '; ';
            }
        }
        rule += '}\n';
        return rule;
    };
    var cleanupResponse = function(response) {
        return response.replace(/\n\r|\n|\r/g,' ') // clean linebreaks
            .replace(/.*id=(["']?)tr1\1[^>]*?>/, '<table class="mist"><tr class="abc">') // find start of main-table and clean it
            .replace(/<\/table><script.*/,'</table>') // remove all after main-table
            .replace(/<td class=(["']?)td7cm[rl]\1.*?\/td>/g, '') // remove unnecessary columns
            .replace(/<([^ai]\w*)[^>]*>/g, '<$1>') // cleanup tags
            .replace(/<script.*?\/script>/g, '') // remove scripts if any
            .replace(/<div[^>]*>\d*<\/div>/g, '') // remove counter if any
            .replace(/href="/g, 'href="http://www.dict.cc') // fix links
            .replace(/(<tr><td)(><b>[^<]*<\/b><\/td><\/tr>)/g, '$1 colspan="2"$2') // add colspans
            .replace(/border\s*:\s*2px outset/g, '') // remove border from special markers
            .replace(/></g, '>\n<'); // make prettier
    };
    var setCss = function(elem, declaration) {
        for (var property in declaration) {
            if (declaration.hasOwnProperty(property)) {
                elem.style[property] = declaration[property];
                console.log(property + ' => ' + declaration[property]);
            }
        }
    };
    var addContainerToPage = function() {
        var oldFinalContainerId = finalContainerId;
        finalContainerId = calculateFinalContainerId(containerId, finalContainerId);
        d.body.appendChild(container);
        container.id = finalContainerId;
        if (oldFinalContainerId != finalContainerId) {
            GM_addStyle(
                createCssRule('#' + finalContainerId, containerCss)
                + createCssRule('#' + finalContainerId + ' table', containerTableCss)
                + createCssRule('#' + finalContainerId + ' table tr + tr', containerTableRowCss)
                + createCssRule('#' + finalContainerId + ' table td', leftColumnCss)
                + createCssRule('#' + finalContainerId + ' table td[colspan]', headRowCss)
                + createCssRule('#' + finalContainerId + ' table td + td', rightColumnCss)
                + createCssRule('#' + finalContainerId + ' table td + td', containerTableCellCss)
                + createCssRule('#' + finalContainerId + ' *', containerText)
                + createCssRule('#' + finalContainerId + ' a:hover', containerLinkHover)
            );
        }
    };
    var renderResponse = function(response) {
        console.log('Here we go');
        container.innerHTML = cleanupResponse(response.responseText);
        addContainerToPage();
        var body = document.body;
        var html = body.parentNode;
        var bodyPos = body.getBoundingClientRect();
        setCss(container, {
            'top': (mouseTop - bodyPos.y - html.scrollTop) + 'px',
            'left': (mouseLeft - bodyPos.x - html.scrollLeft) + 'px'
        });
        menuIsPresent = true;
    };
    w.addEventListener('click', function() {
        if (menuIsPresent) {
            setCss(container, {
                'top': '',
                'left': ''
            });
            menuIsPresent = false;
        }
    }, false);
    w.addEventListener('keydown', function(e) {
        if (e.keyCode == ctrlKeyCode) {
            ctrlKeyPressed = true;
        }
    }, false);
    w.addEventListener('keyup', function(e) {
        if (e.keyCode == ctrlKeyCode) {
            ctrlKeyPressed = false;
        }
    }, false);
    w.addEventListener('contextmenu', function(e) {
        if (ctrlKeyPressed) {
            var selection = w.getSelection();
            if (selection.rangeCount < 1) {
                return;
            }
            var text = selection.getRangeAt(0);
            if (text == '') {
                return;
            }
            mouseTop = e.pageY;
            mouseLeft = e.pageX;
            e.stopPropagation();
            e.preventDefault();
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'http://dict.cc?s='+text,
                onload: renderResponse
            });
            return false;
        }
    }, true);
})(document, window);
