// ==UserScript==
// @name        Clean jira email-tickets
// @namespace   jira
// @description This Script resizes the inside images in gmail if they exceed the possible page width
// @version     1.1
// @updateURL   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/clean-jira-email-tickets.user.js
// @downloadURL https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/clean-jira-email-tickets.user.js
// @include     http://192.168.168.11:8081/browse/*
// @include     https://192.168.168.11:8081/browse/*
// @include     http://192.168.168.11:8081/secure/RapidBoard.jspa*
// @include     https://192.168.168.11:8081/secure/RapidBoard.jspa*
// @grant       GM_addStyle
// ==/UserScript==

GM_addStyle(
    ".ghx-columns li:last-child .ghx-issue-fields,"
    + ".ghx-columns li:last-child .ghx-issue-content,"
    + ".ghx-columns li:last-child .ghx-issue-content"
    + "{"
    + "    font-size:11px;"
    + "    height:auto;"
    + "    margin:0;"
    + "    min-height:0;"
    + "    max-height:16px;"
    + "    overflow:hidden;"
    + "    padding:1px 8px 1px 3px;"
    + "}"
    + ".ghx-columns li:last-child .ghx-key,"
    + ".ghx-columns li:last-child .ghx-summary,"
    + ".ghx-columns li:last-child .ghx-summary .ghx-inner"
    + "{ display:inline; }"
    + ".ghx-columns li:last-child .ghx-summary .ghx-inner:before"
    + "{ content:' ';display:inline; }"
    + ".ghx-columns li:last-child .ghx-flags,"
    + ".ghx-columns li:last-child .ghx-days,"
    + ".ghx-columns li:last-child .ghx-flags,"
    + ".ghx-columns li:last-child .ghx-type"
    + "{ display:none; }"
    + ".ghx-columns li:last-child .ghx-avatar {"
    + "    height:16px;"
    + "    line-height:16px;"
    + "    padding:0 1px;"
    + "    right:0;"
    + "    top:0;"
    + "}"
    + ".ghx-columns li:last-child .ghx-avatar-img {"
    + "    height:16px;"
    + "    line-height:16px;"
    + "    width:16px;"
    + "}"
);

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
