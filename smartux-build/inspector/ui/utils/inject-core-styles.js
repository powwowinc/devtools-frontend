import{appendStyle}from'./append-style.js';export function injectCoreStyles(root){appendStyle(root,'ui/inspectorCommon.css');appendStyle(root,'ui/textButton.css');self.UI.themeSupport.injectHighlightStyleSheets(root);self.UI.themeSupport.injectCustomStyleSheets(root);}