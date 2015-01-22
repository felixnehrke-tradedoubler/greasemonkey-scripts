// ==UserScript==
// @name        Gmail Image Correction
// @namespace   gmail-image
// @description This Script resizes the inside images in gmail if they exceed the possible page width
// @version     1.0
// @updateURL   https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/gmail-image-correction.user.js
// @downloadURL https://raw.githubusercontent.com/nemoinho/greasemonkey-scripts/master/gmail-image-correction.user.js
// @include     https://mail.google.com/*
// @grant       GM_addStyle
// ==/UserScript==

GM_addStyle(
    ".a3s, .a3s img { max-width:100%; }"
    + "table.Bs.nH.iY { table-layout:fixed; }"
);
