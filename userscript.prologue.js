// ==UserScript==
// @name         HotShot
// @namespace    https://rhbrbp.github.io/hotshot/
// @version      0.1
// @description  SmugMug Macros
// @author       rhbrbp
// @match        https://*.smugmug.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=smugmug.com
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    var modifierstate = 0;
    var popup = null;

    var css = document.createElement("style");
    document.body.appendChild(css);
    css.innerHTML = \`
    div.shade {
        background-color: rgba(0.5, 0.5, 0.5, 0.5);
        border-radius: 1em;
    }
    div.tile {
        float: left;
        margin: 1em;
        width: 8em;
        height: 8em;
        padding-top: 1em;
        -display: flex;
        -flex-direction: column;
        -align-items: center;
        -justify-content: center;
    }
    div.tile h1 {
        text-align: center;
        color: white;
        padding: 0 0.5em 0 0.5em;
        font-size: 200%;
    }
    div.tile p {
        text-align: center;
        color: white;
        padding: 0.5em;
    }
    div.popup {
        position: fixed;
        top: 20%;
        min-width: 50em;
        max-width: 50em;
        display: flex;
        flex-wrap: wrap;
        padding: 1em;
        border: 1px solid #a0a0a0;
    }
\`;

    function popupopen () {
        if (popup)
            popup.remove();
        popup = document.createElement("div");
        popup.className = "popup shade";
        var flex = document.createElement("div");
        popup.appendChild(flex);
        for (var i = 0; i < bookmarklets.length; i++) {
            var tile = document.createElement("div");
            tile.className = "tile shade";
            flex.appendChild(tile);
            var h = document.createElement("h1");
            if ("hotkey" in bookmarklets[i] && bookmarklets[i].hotkey)
                h.innerHTML = bookmarklets[i].hotkey;
            else
                h.innerHTML = "" + (i+1);
            tile.appendChild(h);
            var p = document.createElement("p");
            p.innerHTML = bookmarklets[i].name;
            tile.appendChild(p);
        }
        document.body.appendChild(popup);
        popup.style.left = "" + (window.innerWidth - popup.offsetWidth) / 2 + "px";
    }

    document.addEventListener("keydown", ev => {
        modifierstate |= (ev.key == "Control" ? 1 : ev.key == "Meta" ? 2 : 0);
        if (modifierstate == 3) {
            modifierstate = 0;
            return popupopen();
        }
        if ((ev.altKey + ev.shiftKey == 0) &&
            (ev.metaKey + ev.ctrlKey == 2)) {
            // ctrl-meta-something
            var key = String.fromCharCode(ev.keyCode);
            for (var i = 0; i < bookmarklets.length; i++) {
                if (bookmarklets[i].hotkey == key) {
                    eval("("+bookmarklets[i].code+")()");
                    return;
                }
            }
            if (ev.keyCode >= 48 && ev.keyCode < 58) {
                var i = ev.keyCode - 48;
                eval("("+bookmarklets[i-1].code+")()");
                return;
            }
        }
    });
    document.addEventListener("keyup", ev => {
        modifierstate &= ~(ev.key == "Control" ? 1 : ev.key == "Meta" ? 2 : 0);
        if (popup) {
            popup.remove();
            popup = null;
        }
    });

    // wire meta-right to copy image url for all image tiles
    (function () {
        var mouseX = 0, mouseY = 0;
        var meta = false;
        var copyText = async (text) => { await navigator.clipboard.writeText(text); };

        document.addEventListener('mousemove', (ev) => {
            mouseX = ev.pageX;
            mouseY = ev.pageY;
        });
        document.addEventListener("keydown", ev => {
            if (ev.key == "Meta") {
                meta = true;
            }
        });
        document.addEventListener("keyup", ev => {
            if (ev.key == "Meta") {
                meta = false;
            }
        });
        document.addEventListener('contextmenu', (ev) => {
            if (!meta)
                return;
            var node = document.elementFromPoint(
                mouseX-window.pageXOffset,
                mouseY-window.pageYOffset
            );
            for (; node; node = node.parentNode) {
                if (node.tagName == 'A' && node.className.includes('sm-tile-content')) {
                    break;
                }
            }
            if (node && node.href) {
                console.log(node);
                copyText(node.href);
                ev.preventDefault();
                return false;
            }
            return true;
        });
        document.addEventListener('auxclick', (ev) => {
            if (!meta)
                return;
            if (ev.button != 1)  // middle mouse mutton
                return;
            copyText(window.location.href);
            ev.preventDefault();
            return;
        });
    })();
