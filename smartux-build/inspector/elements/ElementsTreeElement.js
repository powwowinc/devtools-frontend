import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as Host from'../host/host.js';import*as Platform from'../platform/platform.js';import*as ProtocolModule from'../protocol/protocol.js';import*as SDK from'../sdk/sdk.js';import*as TextUtils from'../text_utils/text_utils.js';import*as UI from'../ui/ui.js';import{canGetJSPath,cssPath,jsPath,xPath}from'./DOMPath.js';import{MappedCharToEntity,UpdateRecord}from'./ElementsTreeOutline.js';import{MarkerDecorator}from'./MarkerDecorator.js';export class ElementsTreeElement extends UI.TreeOutline.TreeElement{constructor(node,elementCloseTag){super();this._node=node;this._gutterContainer=this.listItemElement.createChild('div','gutter-container');this._gutterContainer.addEventListener('click',this._showContextMenu.bind(this));const gutterMenuIcon=UI.Icon.Icon.create('largeicon-menu','gutter-menu-icon');this._gutterContainer.appendChild(gutterMenuIcon);this._decorationsElement=this._gutterContainer.createChild('div','hidden');this._elementCloseTag=elementCloseTag;if(this._node.nodeType()===Node.ELEMENT_NODE&&!elementCloseTag){this._canAddAttributes=true;}
this._searchQuery=null;this._expandedChildrenLimit=InitialChildrenLimit;this._decorationsThrottler=new Common.Throttler.Throttler(100);this._htmlEditElement;}
static animateOnDOMUpdate(treeElement){const tagName=treeElement.listItemElement.querySelector('.webkit-html-tag-name');UI.UIUtils.runCSSAnimationOnce(tagName||treeElement.listItemElement,'dom-update-highlight');}
static visibleShadowRoots(node){let roots=node.shadowRoots();if(roots.length&&!self.Common.settings.moduleSetting('showUAShadowDOM').get()){roots=roots.filter(filter);}
function filter(root){return root.shadowRootType()!==SDK.DOMModel.DOMNode.ShadowRootTypes.UserAgent;}
return roots;}
static canShowInlineText(node){if(node.contentDocument()||node.importedDocument()||node.templateContent()||ElementsTreeElement.visibleShadowRoots(node).length||node.hasPseudoElements()){return false;}
if(node.nodeType()!==Node.ELEMENT_NODE){return false;}
if(!node.firstChild||node.firstChild!==node.lastChild||node.firstChild.nodeType()!==Node.TEXT_NODE){return false;}
const textChild=node.firstChild;const maxInlineTextChildLength=80;if(textChild.nodeValue().length<maxInlineTextChildLength){return true;}
return false;}
static populateForcedPseudoStateItems(contextMenu,node){const pseudoClasses=['active','hover','focus','visited','focus-within'];try{document.querySelector(':focus-visible');pseudoClasses.push('focus-visible');}catch(e){}
const forcedPseudoState=node.domModel().cssModel().pseudoState(node);const stateMenu=contextMenu.debugSection().appendSubMenuItem(Common.UIString.UIString('Force state'));for(let i=0;i<pseudoClasses.length;++i){const pseudoClassForced=forcedPseudoState.indexOf(pseudoClasses[i])>=0;stateMenu.defaultSection().appendCheckboxItem(':'+pseudoClasses[i],setPseudoStateCallback.bind(null,pseudoClasses[i],!pseudoClassForced),pseudoClassForced,false);}
function setPseudoStateCallback(pseudoState,enabled){node.domModel().cssModel().forcePseudoState(node,pseudoState,enabled);}}
isClosingTag(){return!!this._elementCloseTag;}
node(){return this._node;}
isEditing(){return!!this._editing;}
highlightSearchResults(searchQuery){if(this._searchQuery!==searchQuery){this._hideSearchHighlight();}
this._searchQuery=searchQuery;this._searchHighlightsVisible=true;this.updateTitle(null,true);}
hideSearchHighlights(){delete this._searchHighlightsVisible;this._hideSearchHighlight();}
_hideSearchHighlight(){if(!this._highlightResult){return;}
function updateEntryHide(entry){switch(entry.type){case'added':entry.node.remove();break;case'changed':entry.node.textContent=entry.oldText;break;}}
for(let i=(this._highlightResult.length-1);i>=0;--i){updateEntryHide(this._highlightResult[i]);}
delete this._highlightResult;}
setInClipboard(inClipboard){if(this._inClipboard===inClipboard){return;}
this._inClipboard=inClipboard;this.listItemElement.classList.toggle('in-clipboard',inClipboard);}
get hovered(){return this._hovered;}
set hovered(x){if(this._hovered===x){return;}
this._hovered=x;if(this.listItemElement){if(x){this._createSelection();this.listItemElement.classList.add('hovered');}else{this.listItemElement.classList.remove('hovered');}}}
expandedChildrenLimit(){return this._expandedChildrenLimit;}
setExpandedChildrenLimit(expandedChildrenLimit){this._expandedChildrenLimit=expandedChildrenLimit;}
_createSelection(){const listItemElement=this.listItemElement;if(!listItemElement){return;}
if(!this.selectionElement){this.selectionElement=createElement('div');this.selectionElement.className='selection fill';this.selectionElement.style.setProperty('margin-left',(-this._computeLeftIndent())+'px');listItemElement.insertBefore(this.selectionElement,listItemElement.firstChild);}}
_createHint(){if(this.listItemElement&&!this._hintElement){this._hintElement=this.listItemElement.createChild('span','selected-hint');const selectedElementCommand='$0';this._hintElement.title=ls`Use ${selectedElementCommand} in the console to refer to this element.`;UI.ARIAUtils.markAsHidden(this._hintElement);}}
onbind(){if(!this._elementCloseTag){this._node[this.treeOutline.treeElementSymbol()]=this;}}
onunbind(){if(this._node[this.treeOutline.treeElementSymbol()]===this){this._node[this.treeOutline.treeElementSymbol()]=null;}}
onattach(){if(this._hovered){this._createSelection();this.listItemElement.classList.add('hovered');}
this.updateTitle();this.listItemElement.draggable=true;}
async onpopulate(){return this.treeOutline.populateTreeElement(this);}
async expandRecursively(){await this._node.getSubtree(-1,true);await super.expandRecursively(Number.MAX_VALUE);}
onexpand(){if(this._elementCloseTag){return;}
this.updateTitle();}
oncollapse(){if(this._elementCloseTag){return;}
this.updateTitle();}
select(omitFocus,selectedByUser){if(this._editing){return false;}
return super.select(omitFocus,selectedByUser);}
onselect(selectedByUser){this.treeOutline.suppressRevealAndSelect=true;this.treeOutline.selectDOMNode(this._node,selectedByUser);if(selectedByUser){this._node.highlight();Host.userMetrics.actionTaken(Host.UserMetrics.Action.ChangeInspectedNodeInElementsPanel);}
this._createSelection();this._createHint();this.treeOutline.suppressRevealAndSelect=false;return true;}
ondelete(){const startTagTreeElement=this.treeOutline.findTreeElement(this._node);startTagTreeElement?startTagTreeElement.remove():this.remove();return true;}
onenter(){if(this._editing){return false;}
this._startEditing();return true;}
selectOnMouseDown(event){super.selectOnMouseDown(event);if(this._editing){return;}
if(event.detail>=2){event.preventDefault();}}
ondblclick(event){if(this._editing||this._elementCloseTag){return false;}
if(this._startEditingTarget((event.target))){return false;}
if(this.isExpandable()&&!this.expanded){this.expand();}
return false;}
hasEditableNode(){return!this._node.isShadowRoot()&&!this._node.ancestorUserAgentShadowRoot();}
_insertInLastAttributePosition(tag,node){if(tag.getElementsByClassName('webkit-html-attribute').length>0){tag.insertBefore(node,tag.lastChild);}else{const nodeName=tag.textContent.match(/^<(.*?)>$/)[1];tag.textContent='';tag.createTextChild('<'+nodeName);tag.appendChild(node);tag.createTextChild('>');}}
_startEditingTarget(eventTarget){if(this.treeOutline.selectedDOMNode()!==this._node){return false;}
if(this._node.nodeType()!==Node.ELEMENT_NODE&&this._node.nodeType()!==Node.TEXT_NODE){return false;}
const textNode=eventTarget.enclosingNodeOrSelfWithClass('webkit-html-text-node');if(textNode){return this._startEditingTextNode(textNode);}
const attribute=eventTarget.enclosingNodeOrSelfWithClass('webkit-html-attribute');if(attribute){return this._startEditingAttribute(attribute,eventTarget);}
const tagName=eventTarget.enclosingNodeOrSelfWithClass('webkit-html-tag-name');if(tagName){return this._startEditingTagName(tagName);}
const newAttribute=eventTarget.enclosingNodeOrSelfWithClass('add-attribute');if(newAttribute){return this._addNewAttribute();}
return false;}
_showContextMenu(event){this.treeOutline.showContextMenu(this,event);}
populateTagContextMenu(contextMenu,event){const treeElement=this._elementCloseTag?this.treeOutline.findTreeElement(this._node):this;contextMenu.editSection().appendItem(Common.UIString.UIString('Add attribute'),treeElement._addNewAttribute.bind(treeElement));const attribute=event.target.enclosingNodeOrSelfWithClass('webkit-html-attribute');const newAttribute=event.target.enclosingNodeOrSelfWithClass('add-attribute');if(attribute&&!newAttribute){contextMenu.editSection().appendItem(Common.UIString.UIString('Edit attribute'),this._startEditingAttribute.bind(this,attribute,event.target));}
this.populateNodeContextMenu(contextMenu);ElementsTreeElement.populateForcedPseudoStateItems(contextMenu,treeElement.node());this.populateScrollIntoView(contextMenu);contextMenu.viewSection().appendItem(Common.UIString.UIString('Focus'),async()=>{await this._node.focus();});}
populateScrollIntoView(contextMenu){contextMenu.viewSection().appendItem(Common.UIString.UIString('Scroll into view'),()=>this._node.scrollIntoView());}
populateTextContextMenu(contextMenu,textNode){if(!this._editing){contextMenu.editSection().appendItem(Common.UIString.UIString('Edit text'),this._startEditingTextNode.bind(this,textNode));}
this.populateNodeContextMenu(contextMenu);}
populateNodeContextMenu(contextMenu){const isEditable=this.hasEditableNode();if(isEditable&&!this._editing){contextMenu.editSection().appendItem(Common.UIString.UIString('Edit as HTML'),this._editAsHTML.bind(this));}
const isShadowRoot=this._node.isShadowRoot();const copyMenu=contextMenu.clipboardSection().appendSubMenuItem(Common.UIString.UIString('Copy'));const createShortcut=UI.KeyboardShortcut.KeyboardShortcut.shortcutToString.bind(null);const modifier=UI.KeyboardShortcut.Modifiers.CtrlOrMeta;const treeOutline=this.treeOutline;let menuItem;let section;if(!isShadowRoot){section=copyMenu.section();menuItem=section.appendItem(Common.UIString.UIString('Copy outerHTML'),treeOutline.performCopyOrCut.bind(treeOutline,false,this._node));menuItem.setShortcut(createShortcut('V',modifier));}
if(this._node.nodeType()===Node.ELEMENT_NODE){section.appendItem(Common.UIString.UIString('Copy selector'),this._copyCSSPath.bind(this));section.appendItem(Common.UIString.UIString('Copy JS path'),this._copyJSPath.bind(this),!canGetJSPath(this._node));section.appendItem(ls`Copy styles`,this._copyStyles.bind(this));}
if(!isShadowRoot){section.appendItem(Common.UIString.UIString('Copy XPath'),this._copyXPath.bind(this));section.appendItem(ls`Copy full XPath`,this._copyFullXPath.bind(this));}
if(!isShadowRoot){menuItem=copyMenu.clipboardSection().appendItem(Common.UIString.UIString('Cut element'),treeOutline.performCopyOrCut.bind(treeOutline,true,this._node),!this.hasEditableNode());menuItem.setShortcut(createShortcut('X',modifier));menuItem=copyMenu.clipboardSection().appendItem(Common.UIString.UIString('Copy element'),treeOutline.performCopyOrCut.bind(treeOutline,false,this._node));menuItem.setShortcut(createShortcut('C',modifier));menuItem=copyMenu.clipboardSection().appendItem(Common.UIString.UIString('Paste element'),treeOutline.pasteNode.bind(treeOutline,this._node),!treeOutline.canPaste(this._node));menuItem.setShortcut(createShortcut('V',modifier));}
menuItem=contextMenu.debugSection().appendCheckboxItem(Common.UIString.UIString('Hide element'),treeOutline.toggleHideElement.bind(treeOutline,this._node),treeOutline.isToggledToHidden(this._node));menuItem.setShortcut(self.UI.shortcutRegistry.shortcutTitleForAction('elements.hide-element'));if(isEditable){contextMenu.editSection().appendItem(Common.UIString.UIString('Delete element'),this.remove.bind(this));}
contextMenu.viewSection().appendItem(ls`Expand recursively`,this.expandRecursively.bind(this));contextMenu.viewSection().appendItem(ls`Collapse children`,this.collapseChildren.bind(this));}
_startEditing(){if(this.treeOutline.selectedDOMNode()!==this._node){return;}
const listItem=this.listItemElement;if(this._canAddAttributes){const attribute=listItem.getElementsByClassName('webkit-html-attribute')[0];if(attribute){return this._startEditingAttribute(attribute,attribute.getElementsByClassName('webkit-html-attribute-value')[0]);}
return this._addNewAttribute();}
if(this._node.nodeType()===Node.TEXT_NODE){const textNode=listItem.getElementsByClassName('webkit-html-text-node')[0];if(textNode){return this._startEditingTextNode(textNode);}
return;}}
_addNewAttribute(){const container=createElement('span');this._buildAttributeDOM(container,' ','',null);const attr=container.firstElementChild;attr.style.marginLeft='2px';attr.style.marginRight='2px';const tag=this.listItemElement.getElementsByClassName('webkit-html-tag')[0];this._insertInLastAttributePosition(tag,attr);attr.scrollIntoViewIfNeeded(true);return this._startEditingAttribute(attr,attr);}
_triggerEditAttribute(attributeName){const attributeElements=this.listItemElement.getElementsByClassName('webkit-html-attribute-name');for(let i=0,len=attributeElements.length;i<len;++i){if(attributeElements[i].textContent===attributeName){for(let elem=attributeElements[i].nextSibling;elem;elem=elem.nextSibling){if(elem.nodeType!==Node.ELEMENT_NODE){continue;}
if(elem.classList.contains('webkit-html-attribute-value')){return this._startEditingAttribute(elem.parentNode,elem);}}}}}
_startEditingAttribute(attribute,elementForSelection){console.assert(this.listItemElement.isAncestor(attribute));if(UI.UIUtils.isBeingEdited(attribute)){return true;}
const attributeNameElement=attribute.getElementsByClassName('webkit-html-attribute-name')[0];if(!attributeNameElement){return false;}
const attributeName=attributeNameElement.textContent;const attributeValueElement=attribute.getElementsByClassName('webkit-html-attribute-value')[0];elementForSelection=attributeValueElement.isAncestor(elementForSelection)?attributeValueElement:elementForSelection;function removeZeroWidthSpaceRecursive(node){if(node.nodeType===Node.TEXT_NODE){node.nodeValue=node.nodeValue.replace(/\u200B/g,'');return;}
if(node.nodeType!==Node.ELEMENT_NODE){return;}
for(let child=node.firstChild;child;child=child.nextSibling){removeZeroWidthSpaceRecursive(child);}}
const attributeValue=attributeName&&attributeValueElement?this._node.getAttribute(attributeName):undefined;if(attributeValue!==undefined){attributeValueElement.setTextContentTruncatedIfNeeded(attributeValue,Common.UIString.UIString('<value is too large to edit>'));}
removeZeroWidthSpaceRecursive(attribute);const config=new UI.InplaceEditor.Config(this._attributeEditingCommitted.bind(this),this._editingCancelled.bind(this),attributeName);function postKeyDownFinishHandler(event){UI.UIUtils.handleElementValueModifications(event,attribute);return'';}
if(!Common.ParsedURL.ParsedURL.fromString(attributeValueElement.textContent)){config.setPostKeydownFinishHandler(postKeyDownFinishHandler);}
this._editing=UI.InplaceEditor.InplaceEditor.startEditing(attribute,config);this.listItemElement.getComponentSelection().selectAllChildren(elementForSelection);return true;}
_startEditingTextNode(textNodeElement){if(UI.UIUtils.isBeingEdited(textNodeElement)){return true;}
let textNode=this._node;if(textNode.nodeType()===Node.ELEMENT_NODE&&textNode.firstChild){textNode=textNode.firstChild;}
const container=textNodeElement.enclosingNodeOrSelfWithClass('webkit-html-text-node');if(container){container.textContent=textNode.nodeValue();}
const config=new UI.InplaceEditor.Config(this._textNodeEditingCommitted.bind(this,textNode),this._editingCancelled.bind(this));this._editing=UI.InplaceEditor.InplaceEditor.startEditing(textNodeElement,config);this.listItemElement.getComponentSelection().selectAllChildren(textNodeElement);return true;}
_startEditingTagName(tagNameElement){if(!tagNameElement){tagNameElement=this.listItemElement.getElementsByClassName('webkit-html-tag-name')[0];if(!tagNameElement){return false;}}
const tagName=tagNameElement.textContent;if(EditTagBlacklist.has(tagName.toLowerCase())){return false;}
if(UI.UIUtils.isBeingEdited(tagNameElement)){return true;}
const closingTagElement=this._distinctClosingTagElement();function keyupListener(event){if(closingTagElement){closingTagElement.textContent='</'+tagNameElement.textContent+'>';}}
const keydownListener=event=>{if(event.key!==' '){return;}
this._editing.commit();event.consume(true);};function editingComitted(element,newTagName){tagNameElement.removeEventListener('keyup',keyupListener,false);tagNameElement.removeEventListener('keydown',keydownListener,false);this._tagNameEditingCommitted.apply(this,arguments);}
function editingCancelled(){tagNameElement.removeEventListener('keyup',keyupListener,false);tagNameElement.removeEventListener('keydown',keydownListener,false);this._editingCancelled.apply(this,arguments);}
tagNameElement.addEventListener('keyup',keyupListener,false);tagNameElement.addEventListener('keydown',keydownListener,false);const config=new UI.InplaceEditor.Config(editingComitted.bind(this),editingCancelled.bind(this),tagName);this._editing=UI.InplaceEditor.InplaceEditor.startEditing(tagNameElement,config);this.listItemElement.getComponentSelection().selectAllChildren(tagNameElement);return true;}
_startEditingAsHTML(commitCallback,disposeCallback,maybeInitialValue){if(maybeInitialValue===null){return;}
let initialValue=maybeInitialValue;if(this._editing){return;}
initialValue=this._convertWhitespaceToEntities(initialValue).text;this._htmlEditElement=createElement('div');this._htmlEditElement.className='source-code elements-tree-editor';let child=this.listItemElement.firstChild;while(child){child.style.display='none';child=child.nextSibling;}
if(this.childrenListElement){this.childrenListElement.style.display='none';}
this.listItemElement.appendChild(this._htmlEditElement);self.runtime.extension(UI.TextEditor.TextEditorFactory).instance().then(gotFactory.bind(this));function gotFactory(factory){const editor=factory.createEditor({lineNumbers:false,lineWrapping:self.Common.settings.moduleSetting('domWordWrap').get(),mimeType:'text/html',autoHeight:false,padBottom:false});this._editing={commit:commit.bind(this),cancel:dispose.bind(this),editor:editor,resize:resize.bind(this)};resize.call(this);editor.widget().show((this._htmlEditElement));editor.setText(initialValue);editor.widget().focus();editor.widget().element.addEventListener('focusout',event=>{if(event.relatedTarget&&!event.relatedTarget.isSelfOrDescendant(editor.widget().element)){this._editing.commit();}},false);editor.widget().element.addEventListener('keydown',keydown.bind(this),true);this.treeOutline.setMultilineEditing(this._editing);}
function resize(){if(this._htmlEditElement){this._htmlEditElement.style.width=this.treeOutline.visibleWidth()-this._computeLeftIndent()-30+'px';}
this._editing.editor.onResize();}
function commit(){commitCallback(initialValue,this._editing.editor.text());dispose.call(this);}
function dispose(){if(!this._editing||!this._editing.editor){return;}
this._editing.editor.widget().element.removeEventListener('blur',this._editing.commit,true);this._editing.editor.widget().detach();delete this._editing;this.listItemElement.removeChild(this._htmlEditElement);delete this._htmlEditElement;if(this.childrenListElement){this.childrenListElement.style.removeProperty('display');}
let child=this.listItemElement.firstChild;while(child){child.style.removeProperty('display');child=child.nextSibling;}
if(this.treeOutline){this.treeOutline.setMultilineEditing(null);this.treeOutline.focus();}
disposeCallback();}
function keydown(event){const isMetaOrCtrl=UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta((event))&&!event.altKey&&!event.shiftKey;if(isEnterKey(event)&&(isMetaOrCtrl||event.isMetaOrCtrlForTest)){event.consume(true);this._editing.commit();}else if(event.keyCode===UI.KeyboardShortcut.Keys.Esc.code||event.key==='Escape'){event.consume(true);this._editing.cancel();}}}
_attributeEditingCommitted(element,newText,oldText,attributeName,moveDirection){delete this._editing;const treeOutline=this.treeOutline;function moveToNextAttributeIfNeeded(error){if(error){this._editingCancelled(element,attributeName);}
if(!moveDirection){return;}
treeOutline.runPendingUpdates();treeOutline.focus();const attributes=this._node.attributes();for(let i=0;i<attributes.length;++i){if(attributes[i].name!==attributeName){continue;}
if(moveDirection==='backward'){if(i===0){this._startEditingTagName();}else{this._triggerEditAttribute(attributes[i-1].name);}}else{if(i===attributes.length-1){this._addNewAttribute();}else{this._triggerEditAttribute(attributes[i+1].name);}}
return;}
if(moveDirection==='backward'){if(newText===' '){if(attributes.length>0){this._triggerEditAttribute(attributes[attributes.length-1].name);}}else{if(attributes.length>1){this._triggerEditAttribute(attributes[attributes.length-2].name);}}}else if(moveDirection==='forward'){if(!Platform.StringUtilities.isWhitespace(newText)){this._addNewAttribute();}else{this._startEditingTagName();}}}
if((attributeName.trim()||newText.trim())&&oldText!==newText){this._node.setAttribute(attributeName,newText,moveToNextAttributeIfNeeded.bind(this));return;}
this.updateTitle();moveToNextAttributeIfNeeded.call(this);}
_tagNameEditingCommitted(element,newText,oldText,tagName,moveDirection){delete this._editing;const self=this;function cancel(){const closingTagElement=self._distinctClosingTagElement();if(closingTagElement){closingTagElement.textContent='</'+tagName+'>';}
self._editingCancelled(element,tagName);moveToNextAttributeIfNeeded.call(self);}
function moveToNextAttributeIfNeeded(){if(moveDirection!=='forward'){this._addNewAttribute();return;}
const attributes=this._node.attributes();if(attributes.length>0){this._triggerEditAttribute(attributes[0].name);}else{this._addNewAttribute();}}
newText=newText.trim();if(newText===oldText){cancel();return;}
const treeOutline=this.treeOutline;const wasExpanded=this.expanded;this._node.setNodeName(newText,(error,newNode)=>{if(error||!newNode){cancel();return;}
const newTreeItem=treeOutline.selectNodeAfterEdit(wasExpanded,error,newNode);moveToNextAttributeIfNeeded.call(newTreeItem);});}
_textNodeEditingCommitted(textNode,element,newText){delete this._editing;function callback(){this.updateTitle();}
textNode.setNodeValue(newText,callback.bind(this));}
_editingCancelled(element,context){delete this._editing;this.updateTitle();}
_distinctClosingTagElement(){if(this.expanded){const closers=this.childrenListElement.querySelectorAll('.close');return closers[closers.length-1];}
const tags=this.listItemElement.getElementsByClassName('webkit-html-tag');return(tags.length===1?null:tags[tags.length-1]);}
updateTitle(updateRecord,onlySearchQueryChanged){if(this._editing){return;}
if(onlySearchQueryChanged){this._hideSearchHighlight();}else{const nodeInfo=this._nodeTitleInfo(updateRecord||null);if(this._node.nodeType()===Node.DOCUMENT_FRAGMENT_NODE&&this._node.isInShadowTree()&&this._node.shadowRootType()){this.childrenListElement.classList.add('shadow-root');let depth=4;for(let node=this._node;depth&&node;node=node.parentNode){if(node.nodeType()===Node.DOCUMENT_FRAGMENT_NODE){depth--;}}
if(!depth){this.childrenListElement.classList.add('shadow-root-deep');}else{this.childrenListElement.classList.add('shadow-root-depth-'+depth);}}
const highlightElement=createElement('span');highlightElement.className='highlight';highlightElement.appendChild(nodeInfo);this.title=highlightElement;this.updateDecorations();this.listItemElement.insertBefore(this._gutterContainer,this.listItemElement.firstChild);delete this._highlightResult;delete this.selectionElement;delete this._hintElement;if(this.selected){this._createSelection();this._createHint();}}
this._highlightSearchResults();}
_computeLeftIndent(){let treeElement=this.parent;let depth=0;while(treeElement!==null){depth++;treeElement=treeElement.parent;}
return 12*(depth-2)+(this.isExpandable()?1:12);}
updateDecorations(){this._gutterContainer.style.left=(-this._computeLeftIndent())+'px';if(this.isClosingTag()){return;}
if(this._node.nodeType()!==Node.ELEMENT_NODE){return;}
this._decorationsThrottler.schedule(this._updateDecorationsInternal.bind(this));}
_updateDecorationsInternal(){if(!this.treeOutline){return Promise.resolve();}
const node=this._node;if(!this.treeOutline._decoratorExtensions){this.treeOutline._decoratorExtensions=self.runtime.extensions(MarkerDecorator);}
const markerToExtension=new Map();for(let i=0;i<this.treeOutline._decoratorExtensions.length;++i){markerToExtension.set(this.treeOutline._decoratorExtensions[i].descriptor()['marker'],this.treeOutline._decoratorExtensions[i]);}
const promises=[];const decorations=[];const descendantDecorations=[];node.traverseMarkers(visitor);function visitor(n,marker){const extension=markerToExtension.get(marker);if(!extension){return;}
promises.push(extension.instance().then(collectDecoration.bind(null,n)));}
function collectDecoration(n,decorator){const decoration=decorator.decorate(n);if(!decoration){return;}
(n===node?decorations:descendantDecorations).push(decoration);}
return Promise.all(promises).then(updateDecorationsUI.bind(this));function updateDecorationsUI(){this._decorationsElement.removeChildren();this._decorationsElement.classList.add('hidden');this._gutterContainer.classList.toggle('has-decorations',decorations.length||descendantDecorations.length);if(!decorations.length&&!descendantDecorations.length){return;}
const colors=new Set();const titles=createElement('div');for(const decoration of decorations){const titleElement=titles.createChild('div');titleElement.textContent=decoration.title;colors.add(decoration.color);}
if(this.expanded&&!decorations.length){return;}
const descendantColors=new Set();if(descendantDecorations.length){let element=titles.createChild('div');element.textContent=Common.UIString.UIString('Children:');for(const decoration of descendantDecorations){element=titles.createChild('div');element.style.marginLeft='15px';element.textContent=decoration.title;descendantColors.add(decoration.color);}}
let offset=0;processColors.call(this,colors,'elements-gutter-decoration');if(!this.expanded){processColors.call(this,descendantColors,'elements-gutter-decoration elements-has-decorated-children');}
UI.Tooltip.Tooltip.install(this._decorationsElement,titles);function processColors(colors,className){for(const color of colors){const child=this._decorationsElement.createChild('div',className);this._decorationsElement.classList.remove('hidden');child.style.backgroundColor=color;child.style.borderColor=color;if(offset){child.style.marginLeft=offset+'px';}
offset+=3;}}}}
_buildAttributeDOM(parentElement,name,value,updateRecord,forceValue,node){const closingPunctuationRegex=/[\/;:\)\]\}]/g;let highlightIndex=0;let highlightCount;let additionalHighlightOffset=0;let result;function replacer(match,replaceOffset){while(highlightIndex<highlightCount&&result.entityRanges[highlightIndex].offset<replaceOffset){result.entityRanges[highlightIndex].offset+=additionalHighlightOffset;++highlightIndex;}
additionalHighlightOffset+=1;return match+'\u200B';}
function setValueWithEntities(element,value){result=this._convertWhitespaceToEntities(value);highlightCount=result.entityRanges.length;value=result.text.replace(closingPunctuationRegex,replacer);while(highlightIndex<highlightCount){result.entityRanges[highlightIndex].offset+=additionalHighlightOffset;++highlightIndex;}
element.setTextContentTruncatedIfNeeded(value);UI.UIUtils.highlightRangesWithStyleClass(element,result.entityRanges,'webkit-html-entity-value');}
const hasText=(forceValue||value.length>0);const attrSpanElement=parentElement.createChild('span','webkit-html-attribute');const attrNameElement=attrSpanElement.createChild('span','webkit-html-attribute-name');attrNameElement.textContent=name;if(hasText){attrSpanElement.createTextChild('=\u200B"');}
const attrValueElement=attrSpanElement.createChild('span','webkit-html-attribute-value');if(updateRecord&&updateRecord.isAttributeModified(name)){UI.UIUtils.runCSSAnimationOnce(hasText?attrValueElement:attrNameElement,'dom-update-highlight');}
function linkifyValue(value){const rewrittenHref=node.resolveURL(value);if(rewrittenHref===null){const span=createElement('span');setValueWithEntities.call(this,span,value);return span;}
value=value.replace(closingPunctuationRegex,'$&\u200B');if(value.startsWith('data:')){value=value.trimMiddle(60);}
const link=node.nodeName().toLowerCase()==='a'?UI.XLink.XLink.create(rewrittenHref,value,'',true):Components.Linkifier.Linkifier.linkifyURL(rewrittenHref,{text:value,preventClick:true});link[HrefSymbol]=rewrittenHref;return link;}
const nodeName=node?node.nodeName().toLowerCase():'';if(nodeName&&(name==='src'||name==='href')){attrValueElement.appendChild(linkifyValue.call(this,value));}else if((nodeName==='img'||nodeName==='source')&&name==='srcset'){attrValueElement.appendChild(linkifySrcset.call(this,value));}else if(nodeName==='image'&&(name==='xlink:href'||name==='href')){attrValueElement.appendChild(linkifySrcset.call(this,value));}else{setValueWithEntities.call(this,attrValueElement,value);}
if(hasText){attrSpanElement.createTextChild('"');}
function linkifySrcset(value){const fragment=createDocumentFragment();let i=0;while(value.length){if(i++>0){fragment.createTextChild(' ');}
value=value.trim();let url='';let descriptor='';const indexOfSpace=value.search(/\s/);if(indexOfSpace===-1){url=value;}else if(indexOfSpace>0&&value[indexOfSpace-1]===','){url=value.substring(0,indexOfSpace);}else{url=value.substring(0,indexOfSpace);const indexOfComma=value.indexOf(',',indexOfSpace);if(indexOfComma!==-1){descriptor=value.substring(indexOfSpace,indexOfComma+1);}else{descriptor=value.substring(indexOfSpace);}}
if(url){if(url.endsWith(',')){fragment.appendChild(linkifyValue.call(this,url.substring(0,url.length-1)));fragment.createTextChild(',');}else{fragment.appendChild(linkifyValue.call(this,url));}}
if(descriptor){fragment.createTextChild(descriptor);}
value=value.substring(url.length+descriptor.length);}
return fragment;}}
_buildPseudoElementDOM(parentElement,pseudoElementName){const pseudoElement=parentElement.createChild('span','webkit-html-pseudo-element');pseudoElement.textContent='::'+pseudoElementName;parentElement.createTextChild('\u200B');}
_buildTagDOM(parentElement,tagName,isClosingTag,isDistinctTreeElement,updateRecord){const node=this._node;const classes=['webkit-html-tag'];if(isClosingTag&&isDistinctTreeElement){classes.push('close');}
const tagElement=parentElement.createChild('span',classes.join(' '));tagElement.createTextChild('<');const tagNameElement=tagElement.createChild('span',isClosingTag?'webkit-html-close-tag-name':'webkit-html-tag-name');tagNameElement.textContent=(isClosingTag?'/':'')+tagName;if(!isClosingTag){if(node.hasAttributes()){const attributes=node.attributes();for(let i=0;i<attributes.length;++i){const attr=attributes[i];tagElement.createTextChild(' ');this._buildAttributeDOM(tagElement,attr.name,attr.value,updateRecord,false,node);}}
if(updateRecord){let hasUpdates=updateRecord.hasRemovedAttributes()||updateRecord.hasRemovedChildren();hasUpdates|=!this.expanded&&updateRecord.hasChangedChildren();if(hasUpdates){UI.UIUtils.runCSSAnimationOnce(tagNameElement,'dom-update-highlight');}}}
tagElement.createTextChild('>');parentElement.createTextChild('\u200B');}
_convertWhitespaceToEntities(text){let result='';let lastIndexAfterEntity=0;const entityRanges=[];const charToEntity=MappedCharToEntity;for(let i=0,size=text.length;i<size;++i){const char=text.charAt(i);if(charToEntity[char]){result+=text.substring(lastIndexAfterEntity,i);const entityValue='&'+charToEntity[char]+';';entityRanges.push({offset:result.length,length:entityValue.length});result+=entityValue;lastIndexAfterEntity=i+1;}}
if(result){result+=text.substring(lastIndexAfterEntity);}
return{text:result||text,entityRanges:entityRanges};}
_nodeTitleInfo(updateRecord){const node=this._node;const titleDOM=createDocumentFragment();switch(node.nodeType()){case Node.ATTRIBUTE_NODE:this._buildAttributeDOM(titleDOM,(node.name),(node.value),updateRecord,true);break;case Node.ELEMENT_NODE:const pseudoType=node.pseudoType();if(pseudoType){this._buildPseudoElementDOM(titleDOM,pseudoType);break;}
const tagName=node.nodeNameInCorrectCase();if(this._elementCloseTag){this._buildTagDOM(titleDOM,tagName,true,true,updateRecord);break;}
this._buildTagDOM(titleDOM,tagName,false,false,updateRecord);if(this.isExpandable()){if(!this.expanded){const textNodeElement=titleDOM.createChild('span','webkit-html-text-node bogus');textNodeElement.textContent='…';titleDOM.createTextChild('\u200B');this._buildTagDOM(titleDOM,tagName,true,false,updateRecord);}
break;}
if(ElementsTreeElement.canShowInlineText(node)){const textNodeElement=titleDOM.createChild('span','webkit-html-text-node');const result=this._convertWhitespaceToEntities(node.firstChild.nodeValue());textNodeElement.textContent=result.text;UI.UIUtils.highlightRangesWithStyleClass(textNodeElement,result.entityRanges,'webkit-html-entity-value');titleDOM.createTextChild('\u200B');this._buildTagDOM(titleDOM,tagName,true,false,updateRecord);if(updateRecord&&updateRecord.hasChangedChildren()){UI.UIUtils.runCSSAnimationOnce(textNodeElement,'dom-update-highlight');}
if(updateRecord&&updateRecord.isCharDataModified()){UI.UIUtils.runCSSAnimationOnce(textNodeElement,'dom-update-highlight');}
break;}
if(this.treeOutline.isXMLMimeType||!ForbiddenClosingTagElements.has(tagName)){this._buildTagDOM(titleDOM,tagName,true,false,updateRecord);}
break;case Node.TEXT_NODE:if(node.parentNode&&node.parentNode.nodeName().toLowerCase()==='script'){const newNode=titleDOM.createChild('span','webkit-html-text-node webkit-html-js-node');const text=node.nodeValue();newNode.textContent=text.startsWith('\n')?text.substring(1):text;const javascriptSyntaxHighlighter=new UI.SyntaxHighlighter.SyntaxHighlighter('text/javascript',true);javascriptSyntaxHighlighter.syntaxHighlightNode(newNode).then(updateSearchHighlight.bind(this));}else if(node.parentNode&&node.parentNode.nodeName().toLowerCase()==='style'){const newNode=titleDOM.createChild('span','webkit-html-text-node webkit-html-css-node');const text=node.nodeValue();newNode.textContent=text.startsWith('\n')?text.substring(1):text;const cssSyntaxHighlighter=new UI.SyntaxHighlighter.SyntaxHighlighter('text/css',true);cssSyntaxHighlighter.syntaxHighlightNode(newNode).then(updateSearchHighlight.bind(this));}else{titleDOM.createTextChild('"');const textNodeElement=titleDOM.createChild('span','webkit-html-text-node');const result=this._convertWhitespaceToEntities(node.nodeValue());textNodeElement.textContent=result.text;UI.UIUtils.highlightRangesWithStyleClass(textNodeElement,result.entityRanges,'webkit-html-entity-value');titleDOM.createTextChild('"');if(updateRecord&&updateRecord.isCharDataModified()){UI.UIUtils.runCSSAnimationOnce(textNodeElement,'dom-update-highlight');}}
break;case Node.COMMENT_NODE:const commentElement=titleDOM.createChild('span','webkit-html-comment');commentElement.createTextChild('<!--'+node.nodeValue()+'-->');break;case Node.DOCUMENT_TYPE_NODE:const docTypeElement=titleDOM.createChild('span','webkit-html-doctype');docTypeElement.createTextChild('<!doctype '+node.nodeName());if(node.publicId){docTypeElement.createTextChild(' PUBLIC "'+node.publicId+'"');if(node.systemId){docTypeElement.createTextChild(' "'+node.systemId+'"');}}else if(node.systemId){docTypeElement.createTextChild(' SYSTEM "'+node.systemId+'"');}
if(node.internalSubset){docTypeElement.createTextChild(' ['+node.internalSubset+']');}
docTypeElement.createTextChild('>');break;case Node.CDATA_SECTION_NODE:const cdataElement=titleDOM.createChild('span','webkit-html-text-node');cdataElement.createTextChild('<![CDATA['+node.nodeValue()+']]>');break;case Node.DOCUMENT_FRAGMENT_NODE:const fragmentElement=titleDOM.createChild('span','webkit-html-fragment');fragmentElement.textContent=Platform.StringUtilities.collapseWhitespace(node.nodeNameInCorrectCase());break;default:const nameWithSpaceCollapsed=Platform.StringUtilities.collapseWhitespace(node.nodeNameInCorrectCase());titleDOM.createTextChild(nameWithSpaceCollapsed);}
function updateSearchHighlight(){delete this._highlightResult;this._highlightSearchResults();}
return titleDOM;}
remove(){if(this._node.pseudoType()){return;}
const parentElement=this.parent;if(!parentElement){return;}
if(!this._node.parentNode||this._node.parentNode.nodeType()===Node.DOCUMENT_NODE){return;}
this._node.removeNode();}
toggleEditAsHTML(callback,startEditing){if(this._editing&&this._htmlEditElement){this._editing.commit();return;}
if(startEditing===false){return;}
function selectNode(error){if(callback){callback(!error);}}
function commitChange(initialValue,value){if(initialValue!==value){node.setOuterHTML(value,selectNode);}}
function disposeCallback(){if(callback){callback(false);}}
const node=this._node;node.getOuterHTML().then(this._startEditingAsHTML.bind(this,commitChange,disposeCallback));}
_copyCSSPath(){Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(cssPath(this._node,true));}
_copyJSPath(){Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(jsPath(this._node,true));}
_copyXPath(){Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(xPath(this._node,true));}
_copyFullXPath(){Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(xPath(this._node,false));}
async _copyStyles(){const node=this._node;const cssModel=node.domModel().cssModel();const cascade=await cssModel.cachedMatchedCascadeForNode(node);if(!cascade){return;}
const lines=[];for(const style of cascade.nodeStyles().reverse()){for(const property of style.leadingProperties()){if(!property.parsedOk||property.disabled||!property.activeInStyle()||property.implicit){continue;}
if(cascade.isInherited(style)&&!SDK.CSSMetadata.cssMetadata().isPropertyInherited(property.name)){continue;}
if(style.parentRule&&style.parentRule.isUserAgent()){continue;}
if(cascade.propertyState(property)!==SDK.CSSMatchedStyles.PropertyState.Active){continue;}
lines.push(`${property.name}: ${property.value};`);}}
Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(lines.join('\n'));}
_highlightSearchResults(){if(!this._searchQuery||!this._searchHighlightsVisible){return;}
this._hideSearchHighlight();const text=this.listItemElement.textContent;const regexObject=createPlainTextSearchRegex(this._searchQuery,'gi');let match=regexObject.exec(text);const matchRanges=[];while(match){matchRanges.push(new TextUtils.TextRange.SourceRange(match.index,match[0].length));match=regexObject.exec(text);}
if(!matchRanges.length){matchRanges.push(new TextUtils.TextRange.SourceRange(0,text.length));}
this._highlightResult=[];UI.UIUtils.highlightSearchResults(this.listItemElement,matchRanges,this._highlightResult);}
_editAsHTML(){const promise=Common.Revealer.reveal(this.node());promise.then(()=>self.UI.actionRegistry.action('elements.edit-as-html').execute());}}
export const HrefSymbol=Symbol('ElementsTreeElement.Href');export const InitialChildrenLimit=500;export const ForbiddenClosingTagElements=new Set(['area','base','basefont','br','canvas','col','command','embed','frame','hr','img','input','keygen','link','menuitem','meta','param','source','track','wbr']);export const EditTagBlacklist=new Set(['html','head','body']);