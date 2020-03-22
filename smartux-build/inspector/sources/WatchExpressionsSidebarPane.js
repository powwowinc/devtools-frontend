import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as Host from'../host/host.js';import*as ObjectUI from'../object_ui/object_ui.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{UISourceCodeFrame}from'./UISourceCodeFrame.js';export class WatchExpressionsSidebarPane extends UI.ThrottledWidget.ThrottledWidget{constructor(){super(true);this.registerRequiredCSS('object_ui/objectValue.css');this.registerRequiredCSS('sources/watchExpressionsSidebarPane.css');this._watchExpressions=[];this._watchExpressionsSetting=self.Common.settings.createLocalSetting('watchExpressions',[]);this._addButton=new UI.Toolbar.ToolbarButton(ls`Add watch expression`,'largeicon-add');this._addButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,event=>{this._addButtonClicked();});this._refreshButton=new UI.Toolbar.ToolbarButton(ls`Refresh watch expressions`,'largeicon-refresh');this._refreshButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this.update,this);this.contentElement.classList.add('watch-expressions');this.contentElement.addEventListener('contextmenu',this._contextMenu.bind(this),false);this._treeOutline=new ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeOutline();this._treeOutline.registerRequiredCSS('sources/watchExpressionsSidebarPane.css');this._treeOutline.setShowSelectionOnKeyboardFocus(true);this._expandController=new ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController(this._treeOutline);self.UI.context.addFlavorChangeListener(SDK.RuntimeModel.ExecutionContext,this.update,this);self.UI.context.addFlavorChangeListener(SDK.DebuggerModel.CallFrame,this.update,this);this._linkifier=new Components.Linkifier.Linkifier();this.update();}
toolbarItems(){return[this._addButton,this._refreshButton];}
focus(){if(this.hasFocus()){return;}
if(this._watchExpressions.length>0){this._treeOutline.forceSelect();}}
hasExpressions(){return!!this._watchExpressionsSetting.get().length;}
_saveExpressions(){const toSave=[];for(let i=0;i<this._watchExpressions.length;i++){if(this._watchExpressions[i].expression()){toSave.push(this._watchExpressions[i].expression());}}
this._watchExpressionsSetting.set(toSave);}
async _addButtonClicked(){await self.UI.viewManager.showView('sources.watch');this._createWatchExpression(null).startEditing();}
doUpdate(){this._linkifier.reset();this.contentElement.removeChildren();this._treeOutline.removeChildren();this._watchExpressions=[];this._emptyElement=this.contentElement.createChild('div','gray-info-message');this._emptyElement.textContent=Common.UIString.UIString('No watch expressions');this._emptyElement.tabIndex=-1;const watchExpressionStrings=this._watchExpressionsSetting.get();for(let i=0;i<watchExpressionStrings.length;++i){const expression=watchExpressionStrings[i];if(!expression){continue;}
this._createWatchExpression(expression);}
return Promise.resolve();}
_createWatchExpression(expression){this._emptyElement.classList.add('hidden');this.contentElement.appendChild(this._treeOutline.element);const watchExpression=new WatchExpression(expression,this._expandController,this._linkifier);watchExpression.addEventListener(WatchExpression.Events.ExpressionUpdated,this._watchExpressionUpdated,this);this._treeOutline.appendChild(watchExpression.treeElement());this._watchExpressions.push(watchExpression);return watchExpression;}
_watchExpressionUpdated(event){const watchExpression=(event.data);if(!watchExpression.expression()){this._watchExpressions.remove(watchExpression);this._treeOutline.removeChild(watchExpression.treeElement());this._emptyElement.classList.toggle('hidden',!!this._watchExpressions.length);if(this._watchExpressions.length===0){this._treeOutline.element.remove();}}
this._saveExpressions();}
_contextMenu(event){const contextMenu=new UI.ContextMenu.ContextMenu(event);this._populateContextMenu(contextMenu,event);contextMenu.show();}
_populateContextMenu(contextMenu,event){let isEditing=false;for(const watchExpression of this._watchExpressions){isEditing|=watchExpression.isEditing();}
if(!isEditing){contextMenu.debugSection().appendItem(Common.UIString.UIString('Add watch expression'),this._addButtonClicked.bind(this));}
if(this._watchExpressions.length>1){contextMenu.debugSection().appendItem(Common.UIString.UIString('Delete all watch expressions'),this._deleteAllButtonClicked.bind(this));}
const treeElement=this._treeOutline.treeElementFromEvent(event);if(!treeElement){return;}
const currentWatchExpression=this._watchExpressions.find(watchExpression=>treeElement.hasAncestorOrSelf(watchExpression.treeElement()));currentWatchExpression._populateContextMenu(contextMenu,event);}
_deleteAllButtonClicked(){this._watchExpressions=[];this._saveExpressions();this.update();}
_focusAndAddExpressionToWatch(expression){self.UI.viewManager.showView('sources.watch');this.doUpdate();this._addExpressionToWatch(expression);}
_addExpressionToWatch(expression){this._createWatchExpression(expression);this._saveExpressions();}
handleAction(context,actionId){const frame=self.UI.context.flavor(UISourceCodeFrame);if(!frame){return false;}
const text=frame.textEditor.text(frame.textEditor.selection());this._focusAndAddExpressionToWatch(text);return true;}
_addPropertyPathToWatch(target){this._addExpressionToWatch(target.path());}
appendApplicableItems(event,contextMenu,target){if(target instanceof ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement&&!target.property.synthetic){contextMenu.debugSection().appendItem(ls`Add property path to watch`,this._addPropertyPathToWatch.bind(this,target));}
const frame=self.UI.context.flavor(UISourceCodeFrame);if(!frame||frame.textEditor.selection().isEmpty()){return;}
contextMenu.debugSection().appendAction('sources.add-to-watch');}}
export class WatchExpression extends Common.ObjectWrapper.ObjectWrapper{constructor(expression,expandController,linkifier){super();this._expression=expression;this._expandController=expandController;this._element=createElementWithClass('div','watch-expression monospace');this._editing=false;this._linkifier=linkifier;this._createWatchExpression();this.update();}
treeElement(){return this._treeElement;}
expression(){return this._expression;}
update(){const currentExecutionContext=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);if(currentExecutionContext&&this._expression){currentExecutionContext.evaluate({expression:this._expression,objectGroup:WatchExpression._watchObjectGroupId,includeCommandLineAPI:false,silent:true,returnByValue:false,generatePreview:false},false,false).then(result=>this._createWatchExpression(result.object,result.exceptionDetails));}}
startEditing(){this._editing=true;this._element.removeChildren();const newDiv=this._element.createChild('div');newDiv.textContent=this._nameElement.textContent;this._textPrompt=new ObjectUI.ObjectPropertiesSection.ObjectPropertyPrompt();this._textPrompt.renderAsBlock();const proxyElement=this._textPrompt.attachAndStartEditing(newDiv,this._finishEditing.bind(this));this._treeElement.listItemElement.classList.add('watch-expression-editing');proxyElement.classList.add('watch-expression-text-prompt-proxy');proxyElement.addEventListener('keydown',this._promptKeyDown.bind(this),false);this._element.getComponentSelection().selectAllChildren(newDiv);}
isEditing(){return!!this._editing;}
_finishEditing(event,canceled){if(event){event.consume(canceled);}
this._editing=false;this._treeElement.listItemElement.classList.remove('watch-expression-editing');this._textPrompt.detach();const newExpression=canceled?this._expression:this._textPrompt.text();delete this._textPrompt;this._element.removeChildren();this._updateExpression(newExpression);}
_dblClickOnWatchExpression(event){event.consume();if(!this.isEditing()){this.startEditing();}}
_updateExpression(newExpression){if(this._expression){this._expandController.stopWatchSectionsWithId(this._expression);}
this._expression=newExpression;this.update();this.dispatchEventToListeners(WatchExpression.Events.ExpressionUpdated,this);}
_deleteWatchExpression(event){event.consume(true);this._updateExpression(null);}
_createWatchExpression(result,exceptionDetails){this._result=result||null;this._element.removeChildren();const oldTreeElement=this._treeElement;this._createWatchExpressionTreeElement(result,exceptionDetails);if(oldTreeElement&&oldTreeElement.parent){const root=oldTreeElement.parent;const index=root.indexOfChild(oldTreeElement);root.removeChild(oldTreeElement);root.insertChild(this._treeElement,index);}
this._treeElement.select();}
_createWatchExpressionHeader(expressionValue,exceptionDetails){const headerElement=this._element.createChild('div','watch-expression-header');const deleteButton=UI.Icon.Icon.create('smallicon-cross','watch-expression-delete-button');deleteButton.title=ls`Delete watch expression`;deleteButton.addEventListener('click',this._deleteWatchExpression.bind(this),false);headerElement.appendChild(deleteButton);const titleElement=headerElement.createChild('div','watch-expression-title tree-element-title');this._nameElement=ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection.createNameElement(this._expression);if(!!exceptionDetails||!expressionValue){this._valueElement=createElementWithClass('span','watch-expression-error value');titleElement.classList.add('dimmed');this._valueElement.textContent=Common.UIString.UIString('<not available>');}else{const propertyValue=ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection.createPropertyValueWithCustomSupport(expressionValue,!!exceptionDetails,false,titleElement,this._linkifier);this._valueElement=propertyValue.element;}
const separatorElement=createElementWithClass('span','watch-expressions-separator');separatorElement.textContent=': ';titleElement.appendChildren(this._nameElement,separatorElement,this._valueElement);return headerElement;}
_createWatchExpressionTreeElement(expressionValue,exceptionDetails){const headerElement=this._createWatchExpressionHeader(expressionValue,exceptionDetails);if(!exceptionDetails&&expressionValue&&expressionValue.hasChildren&&!expressionValue.customPreview()){headerElement.classList.add('watch-expression-object-header');this._treeElement=new ObjectUI.ObjectPropertiesSection.RootElement(expressionValue,this._linkifier);this._expandController.watchSection((this._expression),this._treeElement);this._treeElement.toggleOnClick=false;this._treeElement.listItemElement.addEventListener('click',this._onSectionClick.bind(this),false);this._treeElement.listItemElement.addEventListener('dblclick',this._dblClickOnWatchExpression.bind(this));}else{headerElement.addEventListener('dblclick',this._dblClickOnWatchExpression.bind(this));this._treeElement=new UI.TreeOutline.TreeElement();}
this._treeElement.title=this._element;this._treeElement.listItemElement.classList.add('watch-expression-tree-item');this._treeElement.listItemElement.addEventListener('keydown',event=>{if(isEnterKey(event)&&!this.isEditing()){this.startEditing();event.consume(true);}});}
_onSectionClick(event){event.consume(true);if(event.detail===1){this._preventClickTimeout=setTimeout(handleClick.bind(this),333);}else{clearTimeout(this._preventClickTimeout);delete this._preventClickTimeout;}
function handleClick(){if(!this._treeElement){return;}
if(this._treeElement.expanded){this._treeElement.collapse();}else{this._treeElement.expand();}}}
_promptKeyDown(event){if(isEnterKey(event)||isEscKey(event)){this._finishEditing(event,isEscKey(event));}}
_populateContextMenu(contextMenu,event){if(!this.isEditing()){contextMenu.editSection().appendItem(Common.UIString.UIString('Delete watch expression'),this._updateExpression.bind(this,null));}
if(!this.isEditing()&&this._result&&(this._result.type==='number'||this._result.type==='string')){contextMenu.clipboardSection().appendItem(Common.UIString.UIString('Copy value'),this._copyValueButtonClicked.bind(this));}
const target=event.deepElementFromPoint();if(target&&this._valueElement.isSelfOrAncestor(target)){contextMenu.appendApplicableItems(this._result);}}
_copyValueButtonClicked(){Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this._valueElement.textContent);}}
WatchExpression._watchObjectGroupId='watch-group';WatchExpression.Events={ExpressionUpdated:Symbol('ExpressionUpdated')};