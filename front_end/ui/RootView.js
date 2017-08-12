// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @unrestricted
 */
UI.RootView = class extends UI.VBox {
  constructor() {
    super();
    this.markAsRoot();
    this.element.classList.add('root-view');
    this.registerRequiredCSS('ui/rootView.css');
    this.element.setAttribute('spellcheck', false);
  }

  /**
   * @param {!Document} document
   */
  attachToDocument(document) {
    if (document.defaultView) {
      document.defaultView.addEventListener('resize', this.doResize.bind(this), false);
      this._window = document.defaultView;
    } else {
      document.addEventListener('resize', this.doResize.bind(this), false);
      this._window = document;
    }

    this.doResize();

    if (document.body) {
      var shadowRoot = document.body.querySelector('#domInspector').shadowRoot;
      var rootDiv = shadowRoot.querySelector('div');
      this.show(/** @type {!Element} */ rootDiv);
    } else {
      this.show(/** @type {!Element} */ document);
    }
  }

  /**
   * @override
   */
  doResize() {
    if (this._window) {
      var size = this.constraints().minimum;
      var zoom = UI.zoomManager.zoomFactor();
      var right = Math.min(0, this._window.innerWidth - size.width / zoom);
      this.element.style.marginRight = right + 'px';
      var bottom = Math.min(0, this._window.innerHeight - size.height / zoom);
      this.element.style.marginBottom = bottom + 'px';
    }
    super.doResize();
  }
};
