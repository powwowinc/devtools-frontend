// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as puppeteer from 'puppeteer';

import {$, click, resourcesPath, waitFor} from '../../shared/helper.js';

export async function doubleClickSourceTreeItem(selector: string) {
  await waitFor(selector);
  await click(selector, {clickOptions: {clickCount: 2}});
}

export async function openFileInSourcesPanel(target: puppeteer.Page, testInput: string) {
  await target.goto(`${resourcesPath}/sources/${testInput}`);

  // Locate the button for switching to the sources tab.
  await click('#tab-sources');

  // Wait for the navigation panel to show up
  await waitFor('.navigator-file-tree-item');
}

export async function openSourceCodeEditorForFile(target: puppeteer.Page, sourceFile: string, testInput: string) {
  await openFileInSourcesPanel(target, testInput);

  // Open a particular file in the editor
  await doubleClickSourceTreeItem(`[aria-label="${sourceFile}, file"]`);

  // Wait for the file to be formattable, this process is async after opening a file
  await waitFor(`[aria-label="Pretty print ${sourceFile}"]`);
}

// We can't use the click helper, as it is not possible to select a particular
// line number element in CodeMirror.
export async function addBreakpointForLine(frontend: puppeteer.Page, index: number) {
  const breakpointLineNumber = await frontend.evaluate(index => {
    const element = document.querySelectorAll('.CodeMirror-linenumber')[index];

    const {left, top, width, height} = element.getBoundingClientRect();
    return {
      x: left + width * 0.5,
      y: top + height * 0.5,
    };
  }, index);

  await frontend.mouse.click(breakpointLineNumber.x, breakpointLineNumber.y);

  await frontend.waitForFunction(() => {
    return document.querySelectorAll('.cm-breakpoint').length !== 0;
  });
}

export async function retrieveTopCallFrameScriptLocation(script: string, target: puppeteer.Page) {
  // The script will run into a breakpoint, which means that it will not actually
  // finish the evaluation, until we continue executing.
  // Thus, we have to await it at a later point, while stepping through the code.
  const scriptEvaluation = target.evaluate(script);

  // Wait for the evaluation to be paused and shown in the UI
  await waitFor('.paused-status');

  // Retrieve the top level call frame script location name
  const scriptLocation =
      await (await $('.call-frame-location')).evaluate((location: HTMLElement) => location.textContent);

  // Resume the evaluation
  await click('[aria-label="Pause script execution"]');

  // Make sure to await the context evaluate before asserting
  // Otherwise the Puppeteer process might crash on a failure assertion,
  // as its execution context is destroyed
  await scriptEvaluation;

  return scriptLocation;
}

export function listenForSourceFilesAdded(frontend: puppeteer.Page) {
  return frontend.evaluate(() => {
    window.__sourceFilesAddedEvents = [];
    window.addEventListener('source-tree-file-added', (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== '/__puppeteer_evaluation_script__') {
        window.__sourceFilesAddedEvents.push(customEvent.detail);
      }
    });
  });
}

export function waitForAdditionalSourceFiles(frontend: puppeteer.Page) {
  return frontend.waitForFunction(() => {
    return window.__sourceFilesAddedEvents.length > 0;
  });
}

export function retrieveSourceFilesAdded(frontend: puppeteer.Page) {
  // Strip hostname, to make it agnostic of which server port we use
  return frontend.evaluate(() => window.__sourceFilesAddedEvents.map(file => new URL(`http://${file}`).pathname));
}
