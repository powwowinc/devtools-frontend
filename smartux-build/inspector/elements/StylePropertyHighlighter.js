import*as SDK from'../sdk/sdk.js';import{StylesSidebarPane}from'./StylesSidebarPane.js';export class StylePropertyHighlighter{constructor(ssp,cssProperty){this._styleSidebarPane=ssp;this._cssProperty=cssProperty;}
perform(){for(const section of this._styleSidebarPane.allSections()){for(let treeElement=section.propertiesTreeOutline.firstChild();treeElement;treeElement=treeElement.nextSibling){treeElement.onpopulate();}}
let highlightTreeElement=null;for(const section of this._styleSidebarPane.allSections()){let treeElement=section.propertiesTreeOutline.firstChild();while(treeElement&&!highlightTreeElement){if(treeElement.property===this._cssProperty){highlightTreeElement=treeElement;break;}
treeElement=treeElement.traverseNextTreeElement(false,null,true);}
if(highlightTreeElement){break;}}
if(!highlightTreeElement){return;}
highlightTreeElement.parent.expand();highlightTreeElement.listItemElement.scrollIntoViewIfNeeded();highlightTreeElement.listItemElement.animate([{offset:0,backgroundColor:'rgba(255, 255, 0, 0.2)'},{offset:0.1,backgroundColor:'rgba(255, 255, 0, 0.7)'},{offset:1,backgroundColor:'transparent'}],{duration:2000,easing:'cubic-bezier(0, 0, 0.2, 1)'});}}