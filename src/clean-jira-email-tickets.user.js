// ==UserScript==
// @name        Clean jira email-tickets
// @namespace   jira
// @description This Script resizes the inside images in gmail if they exceed the possible page width
// @version     1.0
// @updateURL   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/clean-jira-email-tickets.user.js
// @downloadURL https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/clean-jira-email-tickets.user.js
// @include     http://192.168.168.11:8081/browse/*
// @include     https://192.168.168.11:8081/browse/*
// @grant       GM_addStyle
// ==/UserScript==


var cleanUp = function(){
    var ticketContent = document.querySelectorAll('#description-val .user-content-block p');
    for (var i = ticketContent.length; i--; ) {
        var node = ticketContent[i];
        var br = node.getElementsByTagName('br');
        for (var j = br.length; j--; ) {
            node.removeChild(br[j]);
        }
    }
}

cleanUp();
window.setInterval(cleanUp, 9e3);
