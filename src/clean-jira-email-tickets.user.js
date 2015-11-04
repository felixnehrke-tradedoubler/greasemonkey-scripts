// ==UserScript==
// ==UserScript==
// @name        Clean jira email-tickets
// @namespace   jira
// @description Arange the done-column of the jira-board neatly.
// @version     1.4
// @updateURL   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/clean-jira-email-tickets.user.js
// @downloadURL https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/src/clean-jira-email-tickets.user.js
// @include     http://jira.*/secure/RapidBoard.jspa*
// @include     https://jira.*/secure/RapidBoard.jspa*
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
    + "    max-height:32px;"
    + "    overflow:hidden;"
    + "    padding:1px 16px 1px 3px;"
    + "}"
    + ".ghx-columns li:last-child .ghx-key,"
    + ".ghx-columns li:last-child .ghx-summary,"
    + ".ghx-columns li:last-child .ghx-summary .ghx-inner"
    + "{ display:inline; }"
    + ".ghx-columns li:last-child .ghx-summary .ghx-inner:before"
    + "{ content:' ';display:inline; }"
    + ".ghx-columns li:last-child .ghx-days"
    + "{ display:none; }"
    + ".ghx-columns li:last-child .ghx-flags"
    + "{"
    + "    left:20px;"
    + "    top:1px;"
    + "}"
    + ".ghx-columns li:last-child .ghx-type"
    + "{"
    + "    left:5px;"
    + "    top:1px;"
    + "}"
    + ".ghx-columns li:last-child .ghx-key"
    + "{"
    + "    padding-left:30px;"
    + "}"
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
    + ".ghx-columns li:last-child .ghx-end {"
    + "    background:transparent;"
    + "    box-shadow:none;"
    + "    bottom:auto;"
    + "    top:0;"
    + "    right:18px;"
    + "}"
    + ".ghx-columns li:last-child .ghx-end .ghx-corner {"
    + "    line-height:1;"
    + "    font-size:14px;"
    + "}"
    + ".ghx-columns li:last-child .ghx-end .ghx-corner .aui-badge {"
    + "    padding:2px;"
    + "    font-size:11px;"
    + "}"
);
