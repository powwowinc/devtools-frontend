// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {assert} from 'chai';
import {describe, it} from 'mocha';

import {debuggerStatement, getBrowserAndPages, getElementPosition, resetPages, resourcesPath} from '../helper.js';

describe('The Console Tab', async () => {
  beforeEach(async () => {
    await resetPages();
  });

  it('shows BigInts formatted', async () => {
    const {target, frontend} = getBrowserAndPages();

    // Have the target load the page.
    await target.goto(`${resourcesPath}/console/big-int.html`);

    // Locate the button for switching to the console tab.
    const consoleTabButtonLocation = await getElementPosition('#tab-console');
    if (!consoleTabButtonLocation) {
      assert.fail('Unable to locate console tab button.');
    }

    // Click on the button and wait for the console to load. The reason we use this method
    // rather than elementHandle.click() is because the frontend attaches the behavior to
    // a 'mousedown' event (not the 'click' event). To avoid attaching the test behavior
    // to a specific event we instead locate the button in question and ask Puppeteer to
    // click on it instead.
    await frontend.mouse.click(consoleTabButtonLocation.x, consoleTabButtonLocation.y);
    await frontend.waitForSelector('.console-group-messages');

    // Get the first message from the console.
    const messages = await frontend.evaluate(() => {
      return Array.from(document.querySelectorAll('.console-group-messages .source-code .console-message-text'))
          .map(message => message.textContent);
    });

    assert.deepEqual(messages, [
      '1n',
      'BigInt\xA0{2n}',
      '[1n]',
      '[BigInt]',
      'null 1n BigInt\xA0{2n}',
    ])
  });

  it('shows uncaught promises', async () => {
    const {target, frontend} = getBrowserAndPages();

    // Have the target load the page.
    await target.goto(`${resourcesPath}/console/uncaught-promise.html`);

    // Locate the button for switching to the console tab.
    const consoleTabButtonLocation = await getElementPosition('#tab-console');
    if (!consoleTabButtonLocation) {
      assert.fail('Unable to locate console tab button.');
    }

    // Click on the button and wait for the console to load. The reason we use this method
    // rather than elementHandle.click() is because the frontend attaches the behavior to
    // a 'mousedown' event (not the 'click' event). To avoid attaching the test behavior
    // to a specific event we instead locate the button in question and ask Puppeteer to
    // click on it instead.
    await frontend.mouse.click(consoleTabButtonLocation.x, consoleTabButtonLocation.y);
    await frontend.waitForSelector('.console-group-messages');

    // Get the first message from the console.
    const messages = await frontend.evaluate(() => {
      return Array.from(document.querySelectorAll('.console-group-messages .source-code .console-message-text'))
          .map(message => message.textContent);
    });

    assert.deepEqual(messages, [
      `Uncaught (in promise) Error: err1
    at uncaught-promise.html:10`,
      `Uncaught (in promise) Error: err2
    at uncaught-promise.html:28`,
      `Uncaught (in promise) DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
    at throwDOMException (http://localhost:8090/test/e2e/resources/console/uncaught-promise.html:43:11)
    at catcher (http://localhost:8090/test/e2e/resources/console/uncaught-promise.html:36:9)`
    ]);
  });
});