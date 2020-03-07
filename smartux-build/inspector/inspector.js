Root.allDescriptors.push(...[{"dependencies":["components","emulation"],"extensions":[{"className":"Screencast.ScreencastAppProvider","type":"@Common.AppProvider","order":1},{"className":"Screencast.ScreencastApp.ToolbarButtonProvider","type":"@UI.ToolbarItem.Provider","order":1,"location":"main-toolbar-left"},{"actionId":"components.request-app-banner","type":"context-menu-item","location":"mainMenu","order":10}],"name":"screencast","modules":["screencast.js","screencast-legacy.js","InputModel.js","ScreencastApp.js","ScreencastView.js"]}]);Root.applicationDescriptor.modules.push(...[{"type":"autostart","name":"screencast"}]);self['Screencast']=self['Screencast']||{};;Root.Runtime.cachedResources["screencast/screencastView.css"]="/*\n * Copyright (C) 2013 Google Inc. All rights reserved.\n *\n * Redistribution and use in source and binary forms, with or without\n * modification, are permitted provided that the following conditions are\n * met:\n *\n *     * Redistributions of source code must retain the above copyright\n * notice, this list of conditions and the following disclaimer.\n *     * Redistributions in binary form must reproduce the above\n * copyright notice, this list of conditions and the following disclaimer\n * in the documentation and/or other materials provided with the\n * distribution.\n *     * Neither the name of Google Inc. nor the names of its\n * contributors may be used to endorse or promote products derived from\n * this software without specific prior written permission.\n *\n * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n * \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n */\n\n.screencast {\n    overflow: hidden;\n}\n\n.screencast-navigation {\n    flex-direction: row;\n    display: flex;\n    /**************** POWWOW ADDED ****************/\n    background-color: rgb(90%, 90%, 90%);\n    z-index: 5;\n    flex: 40px 0 0;\n    border-right: 1px solid rgb(64%, 64%, 64%);\n    /**************** POWWOW ADDED ****************/\n    /**************** POWWOW REMOVED ****************/\n    /* flex: 24px 0 0; */\n    /**************** POWWOW REMOVED ****************/\n    position: relative;\n    padding-left: 1px;\n    border-bottom: 1px solid rgb(64%, 64%, 64%);\n    background-origin: padding-box;\n    background-clip: padding-box;\n}\n\n.screencast-navigation button {\n    border-radius: 2px;\n    background-color: transparent;\n    background-image: -webkit-image-set(\n        url(Images/navigationControls.png) 1x,\n        url(Images/navigationControls_2x.png) 2x);\n    background-clip: content-box;\n    background-origin: content-box;\n    background-repeat: no-repeat;\n    border: 1px solid transparent;\n    height: 23px;\n    padding: 2px;\n    /**************** POWWOW REMOVED ****************/\n    /* width: 23px; */\n    /**************** POWWOW REMOVED ****************/\n    /**************** POWWOW ADDED ****************/\n    height: 24px;\n    width: 24px;\n    margin-top: 6px;\n    /**************** POWWOW ADDED ****************/\n}\n\n/**************** POWWOW ADDED ****************/\n.screencast-navigation button.fa.fa-code {\n    background-image: url(Images/devtools.png);\n    width: 32px;\n    height: 32px;\n    margin-top: 3px;\n    background-size: 97%;\n}\n/**************** POWWOW ADDED ****************/\n\n.screencast-navigation button:hover {\n    border-color: #ccc;\n}\n\n.screencast-navigation button:active {\n    border-color: #aaa;\n}\n\n.screencast-navigation button[disabled] {\n    opacity: 0.5;\n}\n\n.screencast-navigation button.back {\n    background-position-x: -1px;\n}\n\n.screencast-navigation button.forward {\n    background-position-x: -18px;\n}\n\n.screencast-navigation button.reload {\n    background-position-x: -37px;\n}\n\n.screencast-navigation input {\n    -webkit-flex: 1;\n    margin: 2px;\n    /**************** POWWOW REMOVED ****************/\n    /* max-height: 19px; */\n    /**************** POWWOW REMOVED ****************/\n    /**************** POWWOW ADDED ****************/\n    max-height: 40px;\n    height: 32px !important;\n    border-radius: 3px;\n    font-size: 15px;\n    /**************** POWWOW ADDED ****************/\n}\n\n.screencast-navigation .progress {\n    background-color: rgb(66, 129, 235);\n    height: 3px;\n    left: 0;\n    position: absolute;\n    top: 100%;  /* Align with the bottom edge of the parent. */\n    width: 0;\n    z-index: 2;  /* Above .screencast-glasspane. */\n}\n\n.screencast-viewport {\n    display: flex;\n    /**************** POWWOW REMOVED ****************/\n    /* border: 1px solid #999;\n    border-radius: 20px; */\n    /**************** POWWOW REMOVED ****************/\n    flex: none;\n    /**************** POWWOW REMOVED ****************/\n    /* padding: 20px;\n    margin: 10px;\n    background-color: #eee; */\n    /**************** POWWOW REMOVED ****************/\n}\n\n.screencast-canvas-container {\n    flex: auto;\n    display: flex;\n    border: 1px solid #999;\n    position: relative;\n    /**************** POWWOW REMOVED ****************/\n    /* cursor: -webkit-image-set(url(Images/touchCursor.png) 1x, url(Images/touchCursor_2x.png) 2x), default; */\n    /**************** POWWOW REMOVED ****************/\n    /**************** POWWOW ADDED ****************/\n    cursor: default;\n    /**************** POWWOW ADDED ****************/\n}\n\n.screencast canvas {\n    flex: auto;\n    position: relative;\n}\n\n.screencast-px {\n    color: rgb(128, 128, 128);\n}\n\n.screencast-element-title {\n    position: absolute;\n    z-index: 10;\n}\n\n.screencast-tag-name {\n    /* Keep this in sync with view-source.css (.webkit-html-tag) */\n    color: rgb(136, 18, 128);\n}\n\n.screencast-node-id {\n    /* Keep this in sync with view-source.css (.webkit-html-attribute-value) */\n    color: rgb(26, 26, 166);\n}\n\n.screencast-class-name {\n    /* Keep this in sync with view-source.css (.webkit-html-attribute-name) */\n    color: rgb(153, 69, 0);\n}\n\n.screencast-glasspane {\n    background-color: rgba(255, 255, 255, 0.8);\n    font-size: 30px;\n    z-index: 100;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n/*# sourceURL=screencast/screencastView.css */";