import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as Host from'../host/host.js';import*as InlineEditor from'../inline_editor/inline_editor.js';import*as SDK from'../sdk/sdk.js';import*as TextUtils from'../text_utils/text_utils.js';import*as UI from'../ui/ui.js';import{ColorSwatchPopoverIcon,ShadowSwatchPopoverHelper}from'./ColorSwatchPopoverIcon.js';import{linkifyDeferredNodeReference}from'./DOMLinkifier.js';import{ElementsSidebarPane}from'./ElementsSidebarPane.js';import{StylePropertyHighlighter}from'./StylePropertyHighlighter.js';import{StylePropertyTreeElement}from'./StylePropertyTreeElement.js';export class StylesSidebarPane extends ElementsSidebarPane{constructor(){super(true);this.setMinimumSize(96,26);this.registerRequiredCSS('elements/stylesSidebarPane.css');self.Common.settings.moduleSetting('colorFormat').addChangeListener(this.update.bind(this));self.Common.settings.moduleSetting('textEditorIndent').addChangeListener(this.update.bind(this));this._currentToolbarPane=null;this._animatedToolbarPane=null;this._pendingWidget=null;this._pendingWidgetToggle=null;this._toolbarPaneElement=this._createStylesSidebarToolbar();this._noMatchesElement=this.contentElement.createChild('div','gray-info-message hidden');this._noMatchesElement.textContent=ls`No matching selector or style`;this._sectionsContainer=this.contentElement.createChild('div');UI.ARIAUtils.markAsTree(this._sectionsContainer);this._sectionsContainer.addEventListener('keydown',this._sectionsContainerKeyDown.bind(this),false);this._sectionsContainer.addEventListener('focusin',this._sectionsContainerFocusChanged.bind(this),false);this._sectionsContainer.addEventListener('focusout',this._sectionsContainerFocusChanged.bind(this),false);this._swatchPopoverHelper=new InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper();this._linkifier=new Components.Linkifier.Linkifier(_maxLinkLength,true);this._decorator=null;this._userOperation=false;this._isEditingStyle=false;this._filterRegex=null;this._isActivePropertyHighlighted=false;this.contentElement.classList.add('styles-pane');this._sectionBlocks=[];this._needsForceUpdate=false;StylesSidebarPane._instance=this;self.UI.context.addFlavorChangeListener(SDK.DOMModel.DOMNode,this.forceUpdate,this);this.contentElement.addEventListener('copy',this._clipboardCopy.bind(this));this._resizeThrottler=new Common.Throttler.Throttler(100);}
swatchPopoverHelper(){return this._swatchPopoverHelper;}
setUserOperation(userOperation){this._userOperation=userOperation;}
static createExclamationMark(property){const exclamationElement=createElement('span','dt-icon-label');exclamationElement.className='exclamation-mark';if(!StylesSidebarPane.ignoreErrorsForProperty(property)){exclamationElement.type='smallicon-warning';}
exclamationElement.title=SDK.CSSMetadata.cssMetadata().isCSSPropertyName(property.name)?Common.UIString.UIString('Invalid property value'):Common.UIString.UIString('Unknown property name');return exclamationElement;}
static ignoreErrorsForProperty(property){function hasUnknownVendorPrefix(string){return!string.startsWith('-webkit-')&&/^[-_][\w\d]+-\w/.test(string);}
const name=property.name.toLowerCase();if(name.charAt(0)==='_'){return true;}
if(name==='filter'){return true;}
if(name.startsWith('scrollbar-')){return true;}
if(hasUnknownVendorPrefix(name)){return true;}
const value=property.value.toLowerCase();if(value.endsWith('\\9')){return true;}
if(hasUnknownVendorPrefix(value)){return true;}
return false;}
static createPropertyFilterElement(placeholder,container,filterCallback){const input=createElementWithClass('input');input.placeholder=placeholder;function searchHandler(){const regex=input.value?new RegExp(input.value.escapeForRegExp(),'i'):null;filterCallback(regex);}
input.addEventListener('input',searchHandler,false);function keydownHandler(event){if(event.key!=='Escape'||!input.value){return;}
event.consume(true);input.value='';searchHandler();}
input.addEventListener('keydown',keydownHandler,false);input.setFilterValue=setFilterValue;function setFilterValue(value){input.value=value;input.focus();searchHandler();}
return input;}
revealProperty(cssProperty){this._decorator=new StylePropertyHighlighter(this,cssProperty);this._decorator.perform();this.update();}
forceUpdate(){this._needsForceUpdate=true;this._swatchPopoverHelper.hide();this._resetCache();this.update();}
_sectionsContainerKeyDown(event){const activeElement=this._sectionsContainer.ownerDocument.deepActiveElement();if(!activeElement){return;}
const section=activeElement._section;if(!section){return;}
switch(event.key){case'ArrowUp':case'ArrowLeft':const sectionToFocus=section.previousSibling()||section.lastSibling();sectionToFocus.element.focus();event.consume(true);break;case'ArrowDown':case'ArrowRight':{const sectionToFocus=section.nextSibling()||section.firstSibling();sectionToFocus.element.focus();event.consume(true);break;}
case'Home':section.firstSibling().element.focus();event.consume(true);break;case'End':section.lastSibling().element.focus();event.consume(true);break;}}
_sectionsContainerFocusChanged(){this.resetFocus();}
resetFocus(){if(this._sectionBlocks[0]&&this._sectionBlocks[0].sections[0]){this._sectionBlocks[0].sections[0].element.tabIndex=this._sectionsContainer.hasFocus()?-1:0;}}
_onAddButtonLongClick(event){const cssModel=this.cssModel();if(!cssModel){return;}
const headers=cssModel.styleSheetHeaders().filter(styleSheetResourceHeader);const contextMenuDescriptors=[];for(let i=0;i<headers.length;++i){const header=headers[i];const handler=this._createNewRuleInStyleSheet.bind(this,header);contextMenuDescriptors.push({text:Bindings.ResourceUtils.displayNameForURL(header.resourceURL()),handler:handler});}
contextMenuDescriptors.sort(compareDescriptors);const contextMenu=new UI.ContextMenu.ContextMenu(event);for(let i=0;i<contextMenuDescriptors.length;++i){const descriptor=contextMenuDescriptors[i];contextMenu.defaultSection().appendItem(descriptor.text,descriptor.handler);}
contextMenu.footerSection().appendItem('inspector-stylesheet',this._createNewRuleInViaInspectorStyleSheet.bind(this));contextMenu.show();function compareDescriptors(descriptor1,descriptor2){return String.naturalOrderComparator(descriptor1.text,descriptor2.text);}
function styleSheetResourceHeader(header){return!header.isViaInspector()&&!header.isInline&&!!header.resourceURL();}}
_onFilterChanged(regex){this._filterRegex=regex;this._updateFilter();}
_refreshUpdate(editedSection,editedTreeElement){if(editedTreeElement){for(const section of this.allSections()){if(section.isBlank){continue;}
section._updateVarFunctions(editedTreeElement);}}
if(this._isEditingStyle){return;}
const node=this.node();if(!node){return;}
for(const section of this.allSections()){if(section.isBlank){continue;}
section.update(section===editedSection);}
if(this._filterRegex){this._updateFilter();}
this._nodeStylesUpdatedForTest(node,false);}
doUpdate(){return this._fetchMatchedCascade().then(this._innerRebuildUpdate.bind(this));}
onResize(){this._resizeThrottler.schedule(this._innerResize.bind(this));}
_innerResize(){const width=this.contentElement.getBoundingClientRect().width+'px';this.allSections().forEach(section=>section.propertiesTreeOutline.element.style.width=width);return Promise.resolve();}
_resetCache(){if(this.cssModel()){this.cssModel().discardCachedMatchedCascade();}}
_fetchMatchedCascade(){const node=this.node();if(!node||!this.cssModel()){return Promise.resolve((null));}
return this.cssModel().cachedMatchedCascadeForNode(node).then(validateStyles.bind(this));function validateStyles(matchedStyles){return matchedStyles&&matchedStyles.node()===this.node()?matchedStyles:null;}}
setEditingStyle(editing,treeElement){if(this._isEditingStyle===editing){return;}
this.contentElement.classList.toggle('is-editing-style',editing);this._isEditingStyle=editing;this._setActiveProperty(null);}
_setActiveProperty(treeElement){if(this._isActivePropertyHighlighted){SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();}
this._isActivePropertyHighlighted=false;if(!this.node()){return;}
if(!treeElement||treeElement.overloaded()||treeElement.inherited()){return;}
const rule=treeElement.property.ownerStyle.parentRule;const selectorList=(rule instanceof SDK.CSSRule.CSSStyleRule)?rule.selectorText():undefined;for(const mode of['padding','border','margin']){if(!treeElement.name.startsWith(mode)){continue;}
this.node().domModel().overlayModel().highlightInOverlay({node:(this.node()),selectorList},mode);this._isActivePropertyHighlighted=true;break;}}
onCSSModelChanged(event){const edit=event&&event.data?(event.data.edit):null;if(edit){for(const section of this.allSections()){section._styleSheetEdited(edit);}
return;}
if(this._userOperation||this._isEditingStyle){return;}
this._resetCache();this.update();}
focusedSectionIndex(){let index=0;for(const block of this._sectionBlocks){for(const section of block.sections){if(section.element.hasFocus()){return index;}
index++;}}
return-1;}
continueEditingElement(sectionIndex,propertyIndex){const section=this.allSections()[sectionIndex];if(section){section.propertiesTreeOutline.rootElement().childAt(propertyIndex).startEditing();}}
async _innerRebuildUpdate(matchedStyles){if(this._needsForceUpdate){this._needsForceUpdate=false;}else if(this._isEditingStyle||this._userOperation){return;}
const focusedIndex=this.focusedSectionIndex();this._linkifier.reset();this._sectionsContainer.removeChildren();this._sectionBlocks=[];const node=this.node();if(!matchedStyles||!node){this._noMatchesElement.classList.remove('hidden');return;}
this._sectionBlocks=await this._rebuildSectionsForMatchedStyleRules((matchedStyles));let pseudoTypes=[];const keys=matchedStyles.pseudoTypes();if(keys.delete(Protocol.DOM.PseudoType.Before)){pseudoTypes.push(Protocol.DOM.PseudoType.Before);}
pseudoTypes=pseudoTypes.concat([...keys].sort());for(const pseudoType of pseudoTypes){const block=SectionBlock.createPseudoTypeBlock(pseudoType);for(const style of matchedStyles.pseudoStyles(pseudoType)){const section=new StylePropertiesSection(this,matchedStyles,style);block.sections.push(section);}
this._sectionBlocks.push(block);}
for(const keyframesRule of matchedStyles.keyframes()){const block=SectionBlock.createKeyframesBlock(keyframesRule.name().text);for(const keyframe of keyframesRule.keyframes()){block.sections.push(new KeyframePropertiesSection(this,matchedStyles,keyframe.style));}
this._sectionBlocks.push(block);}
let index=0;for(const block of this._sectionBlocks){const titleElement=block.titleElement();if(titleElement){this._sectionsContainer.appendChild(titleElement);}
for(const section of block.sections){this._sectionsContainer.appendChild(section.element);if(index===focusedIndex){section.element.focus();}
index++;}}
if(focusedIndex>=index){this._sectionBlocks[0].sections[0].element.focus();}
this._sectionsContainerFocusChanged();if(this._filterRegex){this._updateFilter();}else{this._noMatchesElement.classList.toggle('hidden',this._sectionBlocks.length>0);}
this._nodeStylesUpdatedForTest((node),true);if(this._decorator){this._decorator.perform();this._decorator=null;}}
_nodeStylesUpdatedForTest(node,rebuild){}
async _rebuildSectionsForMatchedStyleRules(matchedStyles){const blocks=[new SectionBlock(null)];let lastParentNode=null;for(const style of matchedStyles.nodeStyles()){const parentNode=matchedStyles.isInherited(style)?matchedStyles.nodeForStyle(style):null;if(parentNode&&parentNode!==lastParentNode){lastParentNode=parentNode;const block=await SectionBlock._createInheritedNodeBlock(lastParentNode);blocks.push(block);}
const section=new StylePropertiesSection(this,matchedStyles,style);blocks.peekLast().sections.push(section);}
return blocks;}
async _createNewRuleInViaInspectorStyleSheet(){const cssModel=this.cssModel();const node=this.node();if(!cssModel||!node){return;}
this.setUserOperation(true);const styleSheetHeader=await cssModel.requestViaInspectorStylesheet((node));this.setUserOperation(false);await this._createNewRuleInStyleSheet(styleSheetHeader);}
async _createNewRuleInStyleSheet(styleSheetHeader){if(!styleSheetHeader){return;}
const text=(await styleSheetHeader.requestContent()).content||'';const lines=text.split('\n');const range=TextUtils.TextRange.TextRange.createFromLocation(lines.length-1,lines[lines.length-1].length);this._addBlankSection(this._sectionBlocks[0].sections[0],styleSheetHeader.id,range);}
_addBlankSection(insertAfterSection,styleSheetId,ruleLocation){const node=this.node();const blankSection=new BlankStylePropertiesSection(this,insertAfterSection._matchedStyles,node?node.simpleSelector():'',styleSheetId,ruleLocation,insertAfterSection._style);this._sectionsContainer.insertBefore(blankSection.element,insertAfterSection.element.nextSibling);for(const block of this._sectionBlocks){const index=block.sections.indexOf(insertAfterSection);if(index===-1){continue;}
block.sections.splice(index+1,0,blankSection);blankSection.startEditingSelector();}}
removeSection(section){for(const block of this._sectionBlocks){const index=block.sections.indexOf(section);if(index===-1){continue;}
block.sections.splice(index,1);section.element.remove();}}
filterRegex(){return this._filterRegex;}
_updateFilter(){let hasAnyVisibleBlock=false;for(const block of this._sectionBlocks){hasAnyVisibleBlock|=block.updateFilter();}
this._noMatchesElement.classList.toggle('hidden',!!hasAnyVisibleBlock);}
willHide(){this._swatchPopoverHelper.hide();super.willHide();}
allSections(){let sections=[];for(const block of this._sectionBlocks){sections=sections.concat(block.sections);}
return sections;}
_clipboardCopy(event){Host.userMetrics.actionTaken(Host.UserMetrics.Action.StyleRuleCopied);}
_createStylesSidebarToolbar(){const container=this.contentElement.createChild('div','styles-sidebar-pane-toolbar-container');const hbox=container.createChild('div','hbox styles-sidebar-pane-toolbar');const filterContainerElement=hbox.createChild('div','styles-sidebar-pane-filter-box');const filterInput=StylesSidebarPane.createPropertyFilterElement(ls`Filter`,hbox,this._onFilterChanged.bind(this));UI.ARIAUtils.setAccessibleName(filterInput,Common.UIString.UIString('Filter Styles'));filterContainerElement.appendChild(filterInput);const toolbar=new UI.Toolbar.Toolbar('styles-pane-toolbar',hbox);toolbar.makeToggledGray();toolbar.appendItemsAtLocation('styles-sidebarpane-toolbar');const toolbarPaneContainer=container.createChild('div','styles-sidebar-toolbar-pane-container');const toolbarPaneContent=toolbarPaneContainer.createChild('div','styles-sidebar-toolbar-pane');return toolbarPaneContent;}
showToolbarPane(widget,toggle){if(this._pendingWidgetToggle){this._pendingWidgetToggle.setToggled(false);}
this._pendingWidgetToggle=toggle;if(this._animatedToolbarPane){this._pendingWidget=widget;}else{this._startToolbarPaneAnimation(widget);}
if(widget&&toggle){toggle.setToggled(true);}}
_startToolbarPaneAnimation(widget){if(widget===this._currentToolbarPane){return;}
if(widget&&this._currentToolbarPane){this._currentToolbarPane.detach();widget.show(this._toolbarPaneElement);this._currentToolbarPane=widget;this._currentToolbarPane.focus();return;}
this._animatedToolbarPane=widget;if(this._currentToolbarPane){this._toolbarPaneElement.style.animationName='styles-element-state-pane-slideout';}else if(widget){this._toolbarPaneElement.style.animationName='styles-element-state-pane-slidein';}
if(widget){widget.show(this._toolbarPaneElement);}
const listener=onAnimationEnd.bind(this);this._toolbarPaneElement.addEventListener('animationend',listener,false);function onAnimationEnd(){this._toolbarPaneElement.style.removeProperty('animation-name');this._toolbarPaneElement.removeEventListener('animationend',listener,false);if(this._currentToolbarPane){this._currentToolbarPane.detach();}
this._currentToolbarPane=this._animatedToolbarPane;if(this._currentToolbarPane){this._currentToolbarPane.focus();}
this._animatedToolbarPane=null;if(this._pendingWidget){this._startToolbarPaneAnimation(this._pendingWidget);this._pendingWidget=null;}}}}
export const _maxLinkLength=23;export class SectionBlock{constructor(titleElement){this._titleElement=titleElement;this.sections=[];}
static createPseudoTypeBlock(pseudoType){const separatorElement=createElement('div');separatorElement.className='sidebar-separator';separatorElement.textContent=Common.UIString.UIString('Pseudo ::%s element',pseudoType);return new SectionBlock(separatorElement);}
static createKeyframesBlock(keyframesName){const separatorElement=createElement('div');separatorElement.className='sidebar-separator';separatorElement.textContent=`@keyframes ${keyframesName}`;return new SectionBlock(separatorElement);}
static async _createInheritedNodeBlock(node){const separatorElement=createElement('div');separatorElement.className='sidebar-separator';separatorElement.createTextChild(ls`Inherited from${' '}`);const link=await Common.Linkifier.Linkifier.linkify(node,{preventKeyboardFocus:true});separatorElement.appendChild(link);return new SectionBlock(separatorElement);}
updateFilter(){let hasAnyVisibleSection=false;for(const section of this.sections){hasAnyVisibleSection|=section._updateFilter();}
if(this._titleElement){this._titleElement.classList.toggle('hidden',!hasAnyVisibleSection);}
return!!hasAnyVisibleSection;}
titleElement(){return this._titleElement;}}
export class StylePropertiesSection{constructor(parentPane,matchedStyles,style){this._parentPane=parentPane;this._style=style;this._matchedStyles=matchedStyles;this.editable=!!(style.styleSheetId&&style.range);this._hoverTimer=null;this._willCauseCancelEditing=false;this._forceShowAll=false;this._originalPropertiesCount=style.leadingProperties().length;const rule=style.parentRule;this.element=createElementWithClass('div','styles-section matched-styles monospace');this.element.tabIndex=-1;UI.ARIAUtils.markAsTreeitem(this.element);this.element.addEventListener('keydown',this._onKeyDown.bind(this),false);this.element._section=this;this._innerElement=this.element.createChild('div');this._titleElement=this._innerElement.createChild('div','styles-section-title '+(rule?'styles-selector':''));this.propertiesTreeOutline=new UI.TreeOutline.TreeOutlineInShadow();this.propertiesTreeOutline.setFocusable(false);this.propertiesTreeOutline.registerRequiredCSS('elements/stylesSectionTree.css');this.propertiesTreeOutline.element.classList.add('style-properties','matched-styles','monospace');this.propertiesTreeOutline.section=this;this._innerElement.appendChild(this.propertiesTreeOutline.element);this._showAllButton=UI.UIUtils.createTextButton('',this._showAllItems.bind(this),'styles-show-all');this._innerElement.appendChild(this._showAllButton);const selectorContainer=createElement('div');this._selectorElement=createElementWithClass('span','selector');this._selectorElement.textContent=this._headerText();selectorContainer.appendChild(this._selectorElement);this._selectorElement.addEventListener('mouseenter',this._onMouseEnterSelector.bind(this),false);this._selectorElement.addEventListener('mousemove',event=>event.consume(),false);this._selectorElement.addEventListener('mouseleave',this._onMouseOutSelector.bind(this),false);const openBrace=selectorContainer.createChild('span','sidebar-pane-open-brace');openBrace.textContent=' {';selectorContainer.addEventListener('mousedown',this._handleEmptySpaceMouseDown.bind(this),false);selectorContainer.addEventListener('click',this._handleSelectorContainerClick.bind(this),false);const closeBrace=this._innerElement.createChild('div','sidebar-pane-closing-brace');closeBrace.textContent='}';this._createHoverMenuToolbar(closeBrace);this._selectorElement.addEventListener('click',this._handleSelectorClick.bind(this),false);this.element.addEventListener('mousedown',this._handleEmptySpaceMouseDown.bind(this),false);this.element.addEventListener('click',this._handleEmptySpaceClick.bind(this),false);this.element.addEventListener('mousemove',this._onMouseMove.bind(this),false);this.element.addEventListener('mouseleave',this._onMouseLeave.bind(this),false);this._selectedSinceMouseDown=false;if(rule){if(rule.isUserAgent()||rule.isInjected()){this.editable=false;}else{if(rule.styleSheetId){const header=rule.cssModel().styleSheetHeaderForId(rule.styleSheetId);this.navigable=!header.isAnonymousInlineStyleSheet();}}}
this._mediaListElement=this._titleElement.createChild('div','media-list media-matches');this._selectorRefElement=this._titleElement.createChild('div','styles-section-subtitle');this._updateMediaList();this._updateRuleOrigin();this._titleElement.appendChild(selectorContainer);this._selectorContainer=selectorContainer;if(this.navigable){this.element.classList.add('navigable');}
if(!this.editable){this.element.classList.add('read-only');this.propertiesTreeOutline.element.classList.add('read-only');}
this._hoverableSelectorsMode=false;this._markSelectorMatches();this.onpopulate();}
static createRuleOriginNode(matchedStyles,linkifier,rule){if(!rule){return createTextNode('');}
const ruleLocation=this._getRuleLocationFromCSSRule(rule);const header=rule.styleSheetId?matchedStyles.cssModel().styleSheetHeaderForId(rule.styleSheetId):null;if(ruleLocation&&rule.styleSheetId&&header&&!header.isAnonymousInlineStyleSheet()){return StylePropertiesSection._linkifyRuleLocation(matchedStyles.cssModel(),linkifier,rule.styleSheetId,ruleLocation);}
if(rule.isUserAgent()){return createTextNode(Common.UIString.UIString('user agent stylesheet'));}
if(rule.isInjected()){return createTextNode(Common.UIString.UIString('injected stylesheet'));}
if(rule.isViaInspector()){return createTextNode(Common.UIString.UIString('via inspector'));}
if(header&&header.ownerNode){const link=linkifyDeferredNodeReference(header.ownerNode,{preventKeyboardFocus:true});link.textContent='<style>';return link;}
return createTextNode('');}
static _getRuleLocationFromCSSRule(rule){let ruleLocation=null;if(rule instanceof SDK.CSSRule.CSSStyleRule){ruleLocation=rule.style.range;}else if(rule instanceof SDK.CSSRule.CSSKeyframeRule){ruleLocation=rule.key().range;}
return ruleLocation;}
static tryNavigateToRuleLocation(matchedStyles,rule){if(!rule){return;}
const ruleLocation=this._getRuleLocationFromCSSRule(rule);const header=rule.styleSheetId?matchedStyles.cssModel().styleSheetHeaderForId(rule.styleSheetId):null;if(ruleLocation&&rule.styleSheetId&&header&&!header.isAnonymousInlineStyleSheet()){const matchingSelectorLocation=this._getCSSSelectorLocation(matchedStyles.cssModel(),rule.styleSheetId,ruleLocation);this._revealSelectorSource(matchingSelectorLocation,true);}}
static _linkifyRuleLocation(cssModel,linkifier,styleSheetId,ruleLocation){const matchingSelectorLocation=this._getCSSSelectorLocation(cssModel,styleSheetId,ruleLocation);return linkifier.linkifyCSSLocation(matchingSelectorLocation);}
static _getCSSSelectorLocation(cssModel,styleSheetId,ruleLocation){const styleSheetHeader=cssModel.styleSheetHeaderForId(styleSheetId);const lineNumber=styleSheetHeader.lineNumberInSource(ruleLocation.startLine);const columnNumber=styleSheetHeader.columnNumberInSource(ruleLocation.startLine,ruleLocation.startColumn);return new SDK.CSSModel.CSSLocation(styleSheetHeader,lineNumber,columnNumber);}
_onKeyDown(event){if(UI.UIUtils.isEditing()||!this.editable||event.altKey||event.ctrlKey||event.metaKey){return;}
switch(event.key){case'Enter':case' ':this._startEditingAtFirstPosition();event.consume(true);break;default:if(event.key.length===1){this.addNewBlankProperty(0).startEditing();}
break;}}
_setSectionHovered(isHovered){this.element.classList.toggle('styles-panel-hovered',isHovered);this.propertiesTreeOutline.element.classList.toggle('styles-panel-hovered',isHovered);if(this._hoverableSelectorsMode!==isHovered){this._hoverableSelectorsMode=isHovered;this._markSelectorMatches();}}
_onMouseLeave(event){this._setSectionHovered(false);this._parentPane._setActiveProperty(null);}
_onMouseMove(event){const hasCtrlOrMeta=UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta((event));this._setSectionHovered(hasCtrlOrMeta);const treeElement=this.propertiesTreeOutline.treeElementFromEvent(event);if(treeElement instanceof StylePropertyTreeElement){this._parentPane._setActiveProperty((treeElement));}else{this._parentPane._setActiveProperty(null);}
if(!this._selectedSinceMouseDown&&this.element.getComponentSelection().toString()){this._selectedSinceMouseDown=true;}}
_createHoverMenuToolbar(container){if(!this.editable){return;}
const items=[];const textShadowButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Add text-shadow'),'largeicon-text-shadow');textShadowButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._onInsertShadowPropertyClick.bind(this,'text-shadow'));textShadowButton.element.tabIndex=-1;items.push(textShadowButton);const boxShadowButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Add box-shadow'),'largeicon-box-shadow');boxShadowButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._onInsertShadowPropertyClick.bind(this,'box-shadow'));boxShadowButton.element.tabIndex=-1;items.push(boxShadowButton);const colorButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Add color'),'largeicon-foreground-color');colorButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._onInsertColorPropertyClick,this);colorButton.element.tabIndex=-1;items.push(colorButton);const backgroundButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Add background-color'),'largeicon-background-color');backgroundButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._onInsertBackgroundColorPropertyClick,this);backgroundButton.element.tabIndex=-1;items.push(backgroundButton);let newRuleButton=null;if(this._style.parentRule){newRuleButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Insert Style Rule Below'),'largeicon-add');newRuleButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._onNewRuleClick,this);newRuleButton.element.tabIndex=-1;items.push(newRuleButton);}
const sectionToolbar=new UI.Toolbar.Toolbar('sidebar-pane-section-toolbar',container);for(let i=0;i<items.length;++i){sectionToolbar.appendToolbarItem(items[i]);}
const menuButton=new UI.Toolbar.ToolbarButton('','largeicon-menu');menuButton.element.tabIndex=-1;sectionToolbar.appendToolbarItem(menuButton);setItemsVisibility(items,false);sectionToolbar.element.addEventListener('mouseenter',setItemsVisibility.bind(null,items,true));sectionToolbar.element.addEventListener('mouseleave',setItemsVisibility.bind(null,items,false));UI.ARIAUtils.markAsHidden(sectionToolbar.element);function setItemsVisibility(items,value){for(let i=0;i<items.length;++i){items[i].setVisible(value);}
menuButton.setVisible(!value);}}
style(){return this._style;}
_headerText(){const node=this._matchedStyles.nodeForStyle(this._style);if(this._style.type===SDK.CSSStyleDeclaration.Type.Inline){return this._matchedStyles.isInherited(this._style)?Common.UIString.UIString('Style Attribute'):'element.style';}
if(this._style.type===SDK.CSSStyleDeclaration.Type.Attributes){return ls`${node.nodeNameInCorrectCase()}[Attributes Style]`;}
return this._style.parentRule.selectorText();}
_onMouseOutSelector(){if(this._hoverTimer){clearTimeout(this._hoverTimer);}
SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();}
_onMouseEnterSelector(){if(this._hoverTimer){clearTimeout(this._hoverTimer);}
this._hoverTimer=setTimeout(this._highlight.bind(this),300);}
_highlight(mode='all'){SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();const node=this._parentPane.node();if(!node){return;}
const selectorList=this._style.parentRule?this._style.parentRule.selectorText():undefined;node.domModel().overlayModel().highlightInOverlay({node,selectorList},mode);}
firstSibling(){const parent=this.element.parentElement;if(!parent){return null;}
let childElement=parent.firstChild;while(childElement){if(childElement._section){return childElement._section;}
childElement=childElement.nextSibling;}
return null;}
lastSibling(){const parent=this.element.parentElement;if(!parent){return null;}
let childElement=parent.lastChild;while(childElement){if(childElement._section){return childElement._section;}
childElement=childElement.previousSibling;}
return null;}
nextSibling(){let curElement=this.element;do{curElement=curElement.nextSibling;}while(curElement&&!curElement._section);return curElement?curElement._section:null;}
previousSibling(){let curElement=this.element;do{curElement=curElement.previousSibling;}while(curElement&&!curElement._section);return curElement?curElement._section:null;}
_onNewRuleClick(event){event.data.consume();const rule=this._style.parentRule;const range=TextUtils.TextRange.TextRange.createFromLocation(rule.style.range.endLine,rule.style.range.endColumn+1);this._parentPane._addBlankSection(this,(rule.styleSheetId),range);}
_onInsertShadowPropertyClick(propertyName,event){event.data.consume(true);const treeElement=this.addNewBlankProperty();treeElement.property.name=propertyName;treeElement.property.value='0 0 black';treeElement.updateTitle();const shadowSwatchPopoverHelper=ShadowSwatchPopoverHelper.forTreeElement(treeElement);if(shadowSwatchPopoverHelper){shadowSwatchPopoverHelper.showPopover();}}
_onInsertColorPropertyClick(event){event.data.consume(true);const treeElement=this.addNewBlankProperty();treeElement.property.name='color';treeElement.property.value='black';treeElement.updateTitle();const colorSwatch=ColorSwatchPopoverIcon.forTreeElement(treeElement);if(colorSwatch){colorSwatch.showPopover();}}
_onInsertBackgroundColorPropertyClick(event){event.data.consume(true);const treeElement=this.addNewBlankProperty();treeElement.property.name='background-color';treeElement.property.value='white';treeElement.updateTitle();const colorSwatch=ColorSwatchPopoverIcon.forTreeElement(treeElement);if(colorSwatch){colorSwatch.showPopover();}}
_styleSheetEdited(edit){const rule=this._style.parentRule;if(rule){rule.rebase(edit);}else{this._style.rebase(edit);}
this._updateMediaList();this._updateRuleOrigin();}
_createMediaList(mediaRules){for(let i=mediaRules.length-1;i>=0;--i){const media=mediaRules[i];if(!media.text.includes('(')&&media.text!=='print'){continue;}
const mediaDataElement=this._mediaListElement.createChild('div','media');const mediaContainerElement=mediaDataElement.createChild('span');const mediaTextElement=mediaContainerElement.createChild('span','media-text');switch(media.source){case SDK.CSSMedia.Source.LINKED_SHEET:case SDK.CSSMedia.Source.INLINE_SHEET:mediaTextElement.textContent='media="'+media.text+'"';break;case SDK.CSSMedia.Source.MEDIA_RULE:const decoration=mediaContainerElement.createChild('span');mediaContainerElement.insertBefore(decoration,mediaTextElement);decoration.textContent='@media ';mediaTextElement.textContent=media.text;if(media.styleSheetId){mediaDataElement.classList.add('editable-media');mediaTextElement.addEventListener('click',this._handleMediaRuleClick.bind(this,media,mediaTextElement),false);}
break;case SDK.CSSMedia.Source.IMPORT_RULE:mediaTextElement.textContent='@import '+media.text;break;}}}
_updateMediaList(){this._mediaListElement.removeChildren();if(this._style.parentRule&&this._style.parentRule instanceof SDK.CSSRule.CSSStyleRule){this._createMediaList(this._style.parentRule.media);}}
isPropertyInherited(propertyName){if(this._matchedStyles.isInherited(this._style)){return!SDK.CSSMetadata.cssMetadata().isPropertyInherited(propertyName);}
return false;}
nextEditableSibling(){let curSection=this;do{curSection=curSection.nextSibling();}while(curSection&&!curSection.editable);if(!curSection){curSection=this.firstSibling();while(curSection&&!curSection.editable){curSection=curSection.nextSibling();}}
return(curSection&&curSection.editable)?curSection:null;}
previousEditableSibling(){let curSection=this;do{curSection=curSection.previousSibling();}while(curSection&&!curSection.editable);if(!curSection){curSection=this.lastSibling();while(curSection&&!curSection.editable){curSection=curSection.previousSibling();}}
return(curSection&&curSection.editable)?curSection:null;}
refreshUpdate(editedTreeElement){this._parentPane._refreshUpdate(this,editedTreeElement);}
_updateVarFunctions(editedTreeElement){let child=this.propertiesTreeOutline.firstChild();while(child){if(child!==editedTreeElement){child.updateTitleIfComputedValueChanged();}
child=child.traverseNextTreeElement(false,null,true);}}
update(full){this._selectorElement.textContent=this._headerText();this._markSelectorMatches();if(full){this.onpopulate();}else{let child=this.propertiesTreeOutline.firstChild();while(child){child.setOverloaded(this._isPropertyOverloaded(child.property));child=child.traverseNextTreeElement(false,null,true);}}}
_showAllItems(event){if(event){event.consume();}
if(this._forceShowAll){return;}
this._forceShowAll=true;this.onpopulate();}
onpopulate(){this._parentPane._setActiveProperty(null);this.propertiesTreeOutline.removeChildren();const style=this._style;let count=0;const properties=style.leadingProperties();const maxProperties=StylePropertiesSection.MaxProperties+properties.length-this._originalPropertiesCount;for(const property of properties){if(!this._forceShowAll&&count>=maxProperties){break;}
count++;const isShorthand=!!style.longhandProperties(property.name).length;const inherited=this.isPropertyInherited(property.name);const overloaded=this._isPropertyOverloaded(property);if(style.parentRule&&style.parentRule.isUserAgent()&&inherited){continue;}
const item=new StylePropertyTreeElement(this._parentPane,this._matchedStyles,property,isShorthand,inherited,overloaded,false);this.propertiesTreeOutline.appendChild(item);}
if(count<properties.length){this._showAllButton.classList.remove('hidden');this._showAllButton.textContent=ls`Show All Properties (${properties.length - count} more)`;}else{this._showAllButton.classList.add('hidden');}}
_isPropertyOverloaded(property){return this._matchedStyles.propertyState(property)===SDK.CSSMatchedStyles.PropertyState.Overloaded;}
_updateFilter(){let hasMatchingChild=false;this._showAllItems();for(const child of this.propertiesTreeOutline.rootElement().children()){hasMatchingChild|=child._updateFilter();}
const regex=this._parentPane.filterRegex();const hideRule=!hasMatchingChild&&!!regex&&!regex.test(this.element.deepTextContent());this.element.classList.toggle('hidden',hideRule);if(!hideRule&&this._style.parentRule){this._markSelectorHighlights();}
return!hideRule;}
_markSelectorMatches(){const rule=this._style.parentRule;if(!rule){return;}
this._mediaListElement.classList.toggle('media-matches',this._matchedStyles.mediaMatches(this._style));const selectorTexts=rule.selectors.map(selector=>selector.text);const matchingSelectorIndexes=this._matchedStyles.matchingSelectors((rule));const matchingSelectors=(new Array(selectorTexts.length).fill(false));for(const matchingIndex of matchingSelectorIndexes){matchingSelectors[matchingIndex]=true;}
if(this._parentPane._isEditingStyle){return;}
const fragment=this._hoverableSelectorsMode?this._renderHoverableSelectors(selectorTexts,matchingSelectors):this._renderSimplifiedSelectors(selectorTexts,matchingSelectors);this._selectorElement.removeChildren();this._selectorElement.appendChild(fragment);this._markSelectorHighlights();}
_renderHoverableSelectors(selectors,matchingSelectors){const fragment=createDocumentFragment();for(let i=0;i<selectors.length;++i){if(i){fragment.createTextChild(', ');}
fragment.appendChild(this._createSelectorElement(selectors[i],matchingSelectors[i],i));}
return fragment;}
_createSelectorElement(text,isMatching,navigationIndex){const element=createElementWithClass('span','simple-selector');element.classList.toggle('selector-matches',isMatching);if(typeof navigationIndex==='number'){element._selectorIndex=navigationIndex;}
element.textContent=text;return element;}
_renderSimplifiedSelectors(selectors,matchingSelectors){const fragment=createDocumentFragment();let currentMatching=false;let text='';for(let i=0;i<selectors.length;++i){if(currentMatching!==matchingSelectors[i]&&text){fragment.appendChild(this._createSelectorElement(text,currentMatching));text='';}
currentMatching=matchingSelectors[i];text+=selectors[i]+(i===selectors.length-1?'':', ');}
if(text){fragment.appendChild(this._createSelectorElement(text,currentMatching));}
return fragment;}
_markSelectorHighlights(){const selectors=this._selectorElement.getElementsByClassName('simple-selector');const regex=this._parentPane.filterRegex();for(let i=0;i<selectors.length;++i){const selectorMatchesFilter=!!regex&&regex.test(selectors[i].textContent);selectors[i].classList.toggle('filter-match',selectorMatchesFilter);}}
_checkWillCancelEditing(){const willCauseCancelEditing=this._willCauseCancelEditing;this._willCauseCancelEditing=false;return willCauseCancelEditing;}
_handleSelectorContainerClick(event){if(this._checkWillCancelEditing()||!this.editable){return;}
if(event.target===this._selectorContainer){this.addNewBlankProperty(0).startEditing();event.consume(true);}}
addNewBlankProperty(index=this.propertiesTreeOutline.rootElement().childCount()){const property=this._style.newBlankProperty(index);const item=new StylePropertyTreeElement(this._parentPane,this._matchedStyles,property,false,false,false,true);this.propertiesTreeOutline.insertChild(item,property.index);return item;}
_handleEmptySpaceMouseDown(){this._willCauseCancelEditing=this._parentPane._isEditingStyle;this._selectedSinceMouseDown=false;}
_handleEmptySpaceClick(event){if(!this.editable||this.element.hasSelection()||this._checkWillCancelEditing()||this._selectedSinceMouseDown){return;}
if(event.target.classList.contains('header')||this.element.classList.contains('read-only')||event.target.enclosingNodeOrSelfWithClass('media')){event.consume();return;}
const deepTarget=event.deepElementFromPoint();if(deepTarget.treeElement){this.addNewBlankProperty(deepTarget.treeElement.property.index+1).startEditing();}else{this.addNewBlankProperty().startEditing();}
event.consume(true);}
_handleMediaRuleClick(media,element,event){if(UI.UIUtils.isBeingEdited(element)){return;}
if(UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta((event))&&this.navigable){const location=media.rawLocation();if(!location){event.consume(true);return;}
const uiLocation=self.Bindings.cssWorkspaceBinding.rawLocationToUILocation(location);if(uiLocation){Common.Revealer.reveal(uiLocation);}
event.consume(true);return;}
if(!this.editable){return;}
const config=new UI.InplaceEditor.Config(this._editingMediaCommitted.bind(this,media),this._editingMediaCancelled.bind(this,element),undefined,this._editingMediaBlurHandler.bind(this));UI.InplaceEditor.InplaceEditor.startEditing(element,config);element.getComponentSelection().selectAllChildren(element);this._parentPane.setEditingStyle(true);const parentMediaElement=element.enclosingNodeOrSelfWithClass('media');parentMediaElement.classList.add('editing-media');event.consume(true);}
_editingMediaFinished(element){this._parentPane.setEditingStyle(false);const parentMediaElement=element.enclosingNodeOrSelfWithClass('media');parentMediaElement.classList.remove('editing-media');}
_editingMediaCancelled(element){this._editingMediaFinished(element);this._markSelectorMatches();element.getComponentSelection().collapse(element,0);}
_editingMediaBlurHandler(editor,blurEvent){return true;}
_editingMediaCommitted(media,element,newContent,oldContent,context,moveDirection){this._parentPane.setEditingStyle(false);this._editingMediaFinished(element);if(newContent){newContent=newContent.trim();}
function userCallback(success){if(success){this._matchedStyles.resetActiveProperties();this._parentPane._refreshUpdate(this);}
this._parentPane.setUserOperation(false);this._editingMediaTextCommittedForTest();}
this._parentPane.setUserOperation(true);const cssModel=this._parentPane.cssModel();if(cssModel){cssModel.setMediaText(media.styleSheetId,media.range,newContent).then(userCallback.bind(this));}}
_editingMediaTextCommittedForTest(){}
_handleSelectorClick(event){if(UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta((event))&&this.navigable&&event.target.classList.contains('simple-selector')){this._navigateToSelectorSource(event.target._selectorIndex,true);event.consume(true);return;}
if(this.element.hasSelection()){return;}
this._startEditingAtFirstPosition();event.consume(true);}
_navigateToSelectorSource(index,focus){const cssModel=this._parentPane.cssModel();if(!cssModel){return;}
const rule=this._style.parentRule;const header=cssModel.styleSheetHeaderForId((rule.styleSheetId));if(!header){return;}
const rawLocation=new SDK.CSSModel.CSSLocation(header,rule.lineNumberInSource(index),rule.columnNumberInSource(index));StylePropertiesSection._revealSelectorSource(rawLocation,focus);}
static _revealSelectorSource(rawLocation,focus){const uiLocation=self.Bindings.cssWorkspaceBinding.rawLocationToUILocation(rawLocation);if(uiLocation){Common.Revealer.reveal(uiLocation,!focus);}}
_startEditingAtFirstPosition(){if(!this.editable){return;}
if(!this._style.parentRule){this.moveEditorFromSelector('forward');return;}
this.startEditingSelector();}
startEditingSelector(){const element=this._selectorElement;if(UI.UIUtils.isBeingEdited(element)){return;}
element.scrollIntoViewIfNeeded(false);element.textContent=element.textContent.replace(/\s+/g,' ').trim();const config=new UI.InplaceEditor.Config(this.editingSelectorCommitted.bind(this),this.editingSelectorCancelled.bind(this));UI.InplaceEditor.InplaceEditor.startEditing(this._selectorElement,config);element.getComponentSelection().selectAllChildren(element);this._parentPane.setEditingStyle(true);if(element.classList.contains('simple-selector')){this._navigateToSelectorSource(0,false);}}
moveEditorFromSelector(moveDirection){this._markSelectorMatches();if(!moveDirection){return;}
if(moveDirection==='forward'){let firstChild=this.propertiesTreeOutline.firstChild();while(firstChild&&firstChild.inherited()){firstChild=firstChild.nextSibling;}
if(!firstChild){this.addNewBlankProperty().startEditing();}else{firstChild.startEditing(firstChild.nameElement);}}else{const previousSection=this.previousEditableSibling();if(!previousSection){return;}
previousSection.addNewBlankProperty().startEditing();}}
editingSelectorCommitted(element,newContent,oldContent,context,moveDirection){this._editingSelectorEnded();if(newContent){newContent=newContent.trim();}
if(newContent===oldContent){this._selectorElement.textContent=newContent;this.moveEditorFromSelector(moveDirection);return;}
const rule=this._style.parentRule;if(!rule){return;}
function headerTextCommitted(){this._parentPane.setUserOperation(false);this.moveEditorFromSelector(moveDirection);this._editingSelectorCommittedForTest();}
this._parentPane.setUserOperation(true);this._setHeaderText(rule,newContent).then(headerTextCommitted.bind(this));}
_setHeaderText(rule,newContent){function onSelectorsUpdated(rule,success){if(!success){return Promise.resolve();}
return this._matchedStyles.recomputeMatchingSelectors(rule).then(updateSourceRanges.bind(this,rule));}
function updateSourceRanges(rule){const doesAffectSelectedNode=this._matchedStyles.matchingSelectors(rule).length>0;this.propertiesTreeOutline.element.classList.toggle('no-affect',!doesAffectSelectedNode);this._matchedStyles.resetActiveProperties();this._parentPane._refreshUpdate(this);}
console.assert(rule instanceof SDK.CSSRule.CSSStyleRule);const oldSelectorRange=rule.selectorRange();if(!oldSelectorRange){return Promise.resolve();}
return rule.setSelectorText(newContent).then(onSelectorsUpdated.bind(this,(rule),oldSelectorRange));}
_editingSelectorCommittedForTest(){}
_updateRuleOrigin(){this._selectorRefElement.removeChildren();this._selectorRefElement.appendChild(StylePropertiesSection.createRuleOriginNode(this._matchedStyles,this._parentPane._linkifier,this._style.parentRule));}
_editingSelectorEnded(){this._parentPane.setEditingStyle(false);}
editingSelectorCancelled(){this._editingSelectorEnded();this._markSelectorMatches();}}
StylePropertiesSection.MaxProperties=50;export class BlankStylePropertiesSection extends StylePropertiesSection{constructor(stylesPane,matchedStyles,defaultSelectorText,styleSheetId,ruleLocation,insertAfterStyle){const cssModel=(stylesPane.cssModel());const rule=SDK.CSSRule.CSSStyleRule.createDummyRule(cssModel,defaultSelectorText);super(stylesPane,matchedStyles,rule.style);this._normal=false;this._ruleLocation=ruleLocation;this._styleSheetId=styleSheetId;this._selectorRefElement.removeChildren();this._selectorRefElement.appendChild(StylePropertiesSection._linkifyRuleLocation(cssModel,this._parentPane._linkifier,styleSheetId,this._actualRuleLocation()));if(insertAfterStyle&&insertAfterStyle.parentRule){this._createMediaList(insertAfterStyle.parentRule.media);}
this.element.classList.add('blank-section');}
_actualRuleLocation(){const prefix=this._rulePrefix();const lines=prefix.split('\n');const editRange=new TextUtils.TextRange.TextRange(0,0,lines.length-1,lines.peekLast().length);return this._ruleLocation.rebaseAfterTextEdit(TextUtils.TextRange.TextRange.createFromLocation(0,0),editRange);}
_rulePrefix(){return this._ruleLocation.startLine===0&&this._ruleLocation.startColumn===0?'':'\n\n';}
get isBlank(){return!this._normal;}
editingSelectorCommitted(element,newContent,oldContent,context,moveDirection){if(!this.isBlank){super.editingSelectorCommitted(element,newContent,oldContent,context,moveDirection);return;}
function onRuleAdded(newRule){if(!newRule){this.editingSelectorCancelled();this._editingSelectorCommittedForTest();return Promise.resolve();}
return this._matchedStyles.addNewRule(newRule,this._matchedStyles.node()).then(onAddedToCascade.bind(this,newRule));}
function onAddedToCascade(newRule){const doesSelectorAffectSelectedNode=this._matchedStyles.matchingSelectors(newRule).length>0;this._makeNormal(newRule);if(!doesSelectorAffectSelectedNode){this.propertiesTreeOutline.element.classList.add('no-affect');}
this._updateRuleOrigin();this._parentPane.setUserOperation(false);this._editingSelectorEnded();if(this.element.parentElement)
{this.moveEditorFromSelector(moveDirection);}
this._markSelectorMatches();this._editingSelectorCommittedForTest();}
if(newContent){newContent=newContent.trim();}
this._parentPane.setUserOperation(true);const cssModel=this._parentPane.cssModel();const ruleText=this._rulePrefix()+newContent+' {}';if(cssModel){cssModel.addRule(this._styleSheetId,ruleText,this._ruleLocation).then(onRuleAdded.bind(this));}}
editingSelectorCancelled(){this._parentPane.setUserOperation(false);if(!this.isBlank){super.editingSelectorCancelled();return;}
this._editingSelectorEnded();this._parentPane.removeSection(this);}
_makeNormal(newRule){this.element.classList.remove('blank-section');this._style=newRule.style;this._normal=true;}}
export class KeyframePropertiesSection extends StylePropertiesSection{constructor(stylesPane,matchedStyles,style){super(stylesPane,matchedStyles,style);this._selectorElement.className='keyframe-key';}
_headerText(){return this._style.parentRule.key().text;}
_setHeaderText(rule,newContent){function updateSourceRanges(success){if(!success){return;}
this._parentPane._refreshUpdate(this);}
console.assert(rule instanceof SDK.CSSRule.CSSKeyframeRule);const oldRange=rule.key().range;if(!oldRange){return Promise.resolve();}
return rule.setKeyText(newContent).then(updateSourceRanges.bind(this));}
isPropertyInherited(propertyName){return false;}
_isPropertyOverloaded(property){return false;}
_markSelectorHighlights(){}
_markSelectorMatches(){this._selectorElement.textContent=this._style.parentRule.key().text;}
_highlight(){}}
export class CSSPropertyPrompt extends UI.TextPrompt.TextPrompt{constructor(treeElement,isEditingName){super();this.initialize(this._buildPropertyCompletions.bind(this),UI.UIUtils.StyleValueDelimiters);this._isColorAware=SDK.CSSMetadata.cssMetadata().isColorAwareProperty(treeElement.property.name);this._cssCompletions=[];if(isEditingName){this._cssCompletions=SDK.CSSMetadata.cssMetadata().allProperties();if(!treeElement.node().isSVGNode()){this._cssCompletions=this._cssCompletions.filter(property=>!SDK.CSSMetadata.cssMetadata().isSVGProperty(property));}}else{this._cssCompletions=SDK.CSSMetadata.cssMetadata().propertyValues(treeElement.nameElement.textContent);}
this._treeElement=treeElement;this._isEditingName=isEditingName;this._cssVariables=treeElement.matchedStyles().availableCSSVariables(treeElement.property.ownerStyle);if(this._cssVariables.length<1000){this._cssVariables.sort(String.naturalOrderComparator);}else{this._cssVariables.sort();}
if(!isEditingName){this.disableDefaultSuggestionForEmptyInput();if(treeElement&&treeElement.valueElement){const cssValueText=treeElement.valueElement.textContent;const cmdOrCtrl=Host.Platform.isMac()?'Cmd':'Ctrl';if(cssValueText.match(/#[\da-f]{3,6}$/i)){this.setTitle(ls`Increment/decrement with mousewheel or up/down keys. ${cmdOrCtrl}: R ±1, Shift: G ±1, Alt: B ±1`);}else if(cssValueText.match(/\d+/)){this.setTitle(ls`Increment/decrement with mousewheel or up/down keys. ${cmdOrCtrl}: ±100, Shift: ±10, Alt: ±0.1`);}}}}
onKeyDown(event){switch(event.key){case'ArrowUp':case'ArrowDown':case'PageUp':case'PageDown':if(!this.isSuggestBoxVisible()&&this._handleNameOrValueUpDown(event)){event.preventDefault();return;}
break;case'Enter':if(event.shiftKey){return;}
this.tabKeyPressed();event.preventDefault();return;}
super.onKeyDown(event);}
onMouseWheel(event){if(this._handleNameOrValueUpDown(event)){event.consume(true);return;}
super.onMouseWheel(event);}
tabKeyPressed(){this.acceptAutoComplete();return false;}
_handleNameOrValueUpDown(event){function finishHandler(originalValue,replacementString){this._treeElement.applyStyleText(this._treeElement.nameElement.textContent+': '+this._treeElement.valueElement.textContent,false);}
function customNumberHandler(prefix,number,suffix){if(number!==0&&!suffix.length&&SDK.CSSMetadata.cssMetadata().isLengthProperty(this._treeElement.property.name)){suffix='px';}
return prefix+number+suffix;}
if(!this._isEditingName&&this._treeElement.valueElement&&UI.UIUtils.handleElementValueModifications(event,this._treeElement.valueElement,finishHandler.bind(this),this._isValueSuggestion.bind(this),customNumberHandler.bind(this))){return true;}
return false;}
_isValueSuggestion(word){if(!word){return false;}
word=word.toLowerCase();return this._cssCompletions.indexOf(word)!==-1||word.startsWith('--');}
_buildPropertyCompletions(expression,query,force){const lowerQuery=query.toLowerCase();const editingVariable=!this._isEditingName&&expression.trim().endsWith('var(');if(!query&&!force&&!editingVariable&&(this._isEditingName||expression)){return Promise.resolve([]);}
const prefixResults=[];const anywhereResults=[];if(!editingVariable){this._cssCompletions.forEach(completion=>filterCompletions.call(this,completion,false));}
if(this._isEditingName){const nameValuePresets=SDK.CSSMetadata.cssMetadata().nameValuePresets(this._treeElement.node().isSVGNode());nameValuePresets.forEach(preset=>filterCompletions.call(this,preset,false,true));}
if(this._isEditingName||editingVariable){this._cssVariables.forEach(variable=>filterCompletions.call(this,variable,true));}
const results=prefixResults.concat(anywhereResults);if(!this._isEditingName&&!results.length&&query.length>1&&'!important'.startsWith(lowerQuery)){results.push({text:'!important'});}
const userEnteredText=query.replace('-','');if(userEnteredText&&(userEnteredText===userEnteredText.toUpperCase())){for(let i=0;i<results.length;++i){if(!results[i].text.startsWith('--')){results[i].text=results[i].text.toUpperCase();}}}
results.forEach(result=>{if(editingVariable){result.title=result.text;result.text+=')';return;}
const valuePreset=SDK.CSSMetadata.cssMetadata().getValuePreset(this._treeElement.name,result.text);if(!this._isEditingName&&valuePreset){result.title=result.text;result.text=valuePreset.text;result.selectionRange={startColumn:valuePreset.startColumn,endColumn:valuePreset.endColumn};}});if(this._isColorAware&&!this._isEditingName){results.sort((a,b)=>{if(!!a.subtitleRenderer===!!b.subtitleRenderer){return 0;}
return a.subtitleRenderer?-1:1;});}
return Promise.resolve(results);function filterCompletions(completion,variable,nameValue){const index=completion.toLowerCase().indexOf(lowerQuery);const result={text:completion};if(variable){const computedValue=this._treeElement.matchedStyles().computeCSSVariable(this._treeElement.property.ownerStyle,completion);if(computedValue){const color=Common.Color.Color.parse(computedValue);if(color){result.subtitleRenderer=swatchRenderer.bind(null,color);}}}
if(nameValue){result.hideGhostText=true;}
if(index===0){result.priority=this._isEditingName?SDK.CSSMetadata.cssMetadata().propertyUsageWeight(completion):1;prefixResults.push(result);}else if(index>-1){anywhereResults.push(result);}}
function swatchRenderer(color){const swatch=InlineEditor.ColorSwatch.ColorSwatch.create();swatch.hideText(true);swatch.setColor(color);swatch.style.pointerEvents='none';return swatch;}}}
export class StylesSidebarPropertyRenderer{constructor(rule,node,name,value){this._rule=rule;this._node=node;this._propertyName=name;this._propertyValue=value;this._colorHandler=null;this._bezierHandler=null;this._shadowHandler=null;this._gridHandler=null;this._varHandler=createTextNode;}
setColorHandler(handler){this._colorHandler=handler;}
setBezierHandler(handler){this._bezierHandler=handler;}
setShadowHandler(handler){this._shadowHandler=handler;}
setGridHandler(handler){this._gridHandler=handler;}
setVarHandler(handler){this._varHandler=handler;}
renderName(){const nameElement=createElement('span');nameElement.className='webkit-css-property';nameElement.textContent=this._propertyName;nameElement.normalize();return nameElement;}
renderValue(){const valueElement=createElement('span');valueElement.className='value';if(!this._propertyValue){return valueElement;}
const metadata=SDK.CSSMetadata.cssMetadata();if(this._shadowHandler&&metadata.isShadowProperty(this._propertyName)&&!SDK.CSSMetadata.VariableRegex.test(this._propertyValue)){valueElement.appendChild(this._shadowHandler(this._propertyValue,this._propertyName));valueElement.normalize();return valueElement;}
if(this._gridHandler&&metadata.isGridAreaDefiningProperty(this._propertyName)){valueElement.appendChild(this._gridHandler(this._propertyValue,this._propertyName));valueElement.normalize();return valueElement;}
if(metadata.isStringProperty(this._propertyName)){valueElement.title=unescapeCssString(this._propertyValue);}
const regexes=[SDK.CSSMetadata.VariableRegex,SDK.CSSMetadata.URLRegex];const processors=[this._varHandler,this._processURL.bind(this)];if(this._bezierHandler&&metadata.isBezierAwareProperty(this._propertyName)){regexes.push(UI.Geometry.CubicBezier.Regex);processors.push(this._bezierHandler);}
if(this._colorHandler&&metadata.isColorAwareProperty(this._propertyName)){regexes.push(Common.Color.Regex);processors.push(this._colorHandler);}
const results=TextUtils.TextUtils.Utils.splitStringByRegexes(this._propertyValue,regexes);for(let i=0;i<results.length;i++){const result=results[i];const processor=result.regexIndex===-1?createTextNode:processors[result.regexIndex];valueElement.appendChild(processor(result.value));}
valueElement.normalize();return valueElement;}
_processURL(text){let url=text.substring(4,text.length-1).trim();const isQuoted=/^'.*'$/.test(url)||/^".*"$/.test(url);if(isQuoted){url=url.substring(1,url.length-1);}
const container=createDocumentFragment();container.createTextChild('url(');let hrefUrl=null;if(this._rule&&this._rule.resourceURL()){hrefUrl=Common.ParsedURL.ParsedURL.completeURL(this._rule.resourceURL(),url);}else if(this._node){hrefUrl=this._node.resolveURL(url);}
container.appendChild(Components.Linkifier.Linkifier.linkifyURL(hrefUrl||url,{text:url,preventClick:true,bypassURLTrimming:true,}));container.createTextChild(')');return container;}}
export class ButtonProvider{constructor(){this._button=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('New Style Rule'),'largeicon-add');this._button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._clicked,this);const longclickTriangle=UI.Icon.Icon.create('largeicon-longclick-triangle','long-click-glyph');this._button.element.appendChild(longclickTriangle);new UI.UIUtils.LongClickController(this._button.element,this._longClicked.bind(this));self.UI.context.addFlavorChangeListener(SDK.DOMModel.DOMNode,onNodeChanged.bind(this));onNodeChanged.call(this);function onNodeChanged(){let node=self.UI.context.flavor(SDK.DOMModel.DOMNode);node=node?node.enclosingElementOrSelf():null;this._button.setEnabled(!!node);}}
_clicked(event){StylesSidebarPane._instance._createNewRuleInViaInspectorStyleSheet();}
_longClicked(event){StylesSidebarPane._instance._onAddButtonLongClick(event);}
item(){return this._button;}}