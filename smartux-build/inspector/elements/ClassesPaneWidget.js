import*as Common from'../common/common.js';import*as Platform from'../platform/platform.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ElementsPanel}from'./ElementsPanel.js';export class ClassesPaneWidget extends UI.Widget.Widget{constructor(){super(true);this.registerRequiredCSS('elements/classesPaneWidget.css');this.contentElement.className='styles-element-classes-pane';const container=this.contentElement.createChild('div','title-container');this._input=container.createChild('div','new-class-input monospace');this.setDefaultFocusedElement(this._input);this._classesContainer=this.contentElement.createChild('div','source-code');this._classesContainer.classList.add('styles-element-classes-container');this._prompt=new ClassNamePrompt(this._nodeClasses.bind(this));this._prompt.setAutocompletionTimeout(0);this._prompt.renderAsBlock();const proxyElement=this._prompt.attach(this._input);this._prompt.setPlaceholder(Common.UIString.UIString('Add new class'));this._prompt.addEventListener(UI.TextPrompt.Events.TextChanged,this._onTextChanged,this);proxyElement.addEventListener('keydown',this._onKeyDown.bind(this),false);self.SDK.targetManager.addModelListener(SDK.DOMModel.DOMModel,SDK.DOMModel.Events.DOMMutated,this._onDOMMutated,this);this._mutatingNodes=new Set();this._pendingNodeClasses=new Map();this._updateNodeThrottler=new Common.Throttler.Throttler(0);this._previousTarget=null;self.UI.context.addFlavorChangeListener(SDK.DOMModel.DOMNode,this._onSelectedNodeChanged,this);}
_splitTextIntoClasses(text){return text.split(/[.,\s]/).map(className=>className.trim()).filter(className=>className.length);}
_onKeyDown(event){if(!isEnterKey(event)&&!isEscKey(event)){return;}
if(isEnterKey(event)){event.consume();if(this._prompt.acceptAutoComplete()){return;}}
let text=event.target.textContent;if(isEscKey(event)){if(!Platform.StringUtilities.isWhitespace(text)){event.consume(true);}
text='';}
this._prompt.clearAutocomplete();event.target.textContent='';const node=self.UI.context.flavor(SDK.DOMModel.DOMNode);if(!node){return;}
const classNames=this._splitTextIntoClasses(text);for(const className of classNames){this._toggleClass(node,className,true);}
this._installNodeClasses(node);this._update();}
_onTextChanged(){const node=self.UI.context.flavor(SDK.DOMModel.DOMNode);if(!node){return;}
this._installNodeClasses(node);}
_onDOMMutated(event){const node=(event.data);if(this._mutatingNodes.has(node)){return;}
delete node[ClassesPaneWidget._classesSymbol];this._update();}
_onSelectedNodeChanged(event){if(this._previousTarget&&this._prompt.text()){this._input.textContent='';this._installNodeClasses(this._previousTarget);}
this._previousTarget=(event.data);this._update();}
wasShown(){this._update();}
_update(){if(!this.isShowing()){return;}
let node=self.UI.context.flavor(SDK.DOMModel.DOMNode);if(node){node=node.enclosingElementOrSelf();}
this._classesContainer.removeChildren();this._input.disabled=!node;if(!node){return;}
const classes=this._nodeClasses(node);const keys=[...classes.keys()];keys.sort(String.caseInsensetiveComparator);for(let i=0;i<keys.length;++i){const className=keys[i];const label=UI.UIUtils.CheckboxLabel.create(className,classes.get(className));label.classList.add('monospace');label.checkboxElement.addEventListener('click',this._onClick.bind(this,className),false);this._classesContainer.appendChild(label);}}
_onClick(className,event){const node=self.UI.context.flavor(SDK.DOMModel.DOMNode);if(!node){return;}
const enabled=event.target.checked;this._toggleClass(node,className,enabled);this._installNodeClasses(node);}
_nodeClasses(node){let result=node[ClassesPaneWidget._classesSymbol];if(!result){const classAttribute=node.getAttribute('class')||'';const classes=classAttribute.split(/\s/);result=new Map();for(let i=0;i<classes.length;++i){const className=classes[i].trim();if(!className.length){continue;}
result.set(className,true);}
node[ClassesPaneWidget._classesSymbol]=result;}
return result;}
_toggleClass(node,className,enabled){const classes=this._nodeClasses(node);classes.set(className,enabled);}
_installNodeClasses(node){const classes=this._nodeClasses(node);const activeClasses=new Set();for(const className of classes.keys()){if(classes.get(className)){activeClasses.add(className);}}
const additionalClasses=this._splitTextIntoClasses(this._prompt.textWithCurrentSuggestion());for(const className of additionalClasses){activeClasses.add(className);}
const newClasses=[...activeClasses.values()].sort();this._pendingNodeClasses.set(node,newClasses.join(' '));this._updateNodeThrottler.schedule(this._flushPendingClasses.bind(this));}
_flushPendingClasses(){const promises=[];for(const node of this._pendingNodeClasses.keys()){this._mutatingNodes.add(node);const promise=node.setAttributeValuePromise('class',this._pendingNodeClasses.get(node)).then(onClassValueUpdated.bind(this,node));promises.push(promise);}
this._pendingNodeClasses.clear();return Promise.all(promises);function onClassValueUpdated(node){this._mutatingNodes.delete(node);}}}
ClassesPaneWidget._classesSymbol=Symbol('ClassesPaneWidget._classesSymbol');export class ButtonProvider{constructor(){this._button=new UI.Toolbar.ToolbarToggle(Common.UIString.UIString('Element Classes'),'');this._button.setText('.cls');this._button.element.classList.add('monospace');this._button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._clicked,this);this._view=new ClassesPaneWidget();}
_clicked(){ElementsPanel.instance().showToolbarPane(!this._view.isShowing()?this._view:null,this._button);}
item(){return this._button;}}
export class ClassNamePrompt extends UI.TextPrompt.TextPrompt{constructor(nodeClasses){super();this._nodeClasses=nodeClasses;this.initialize(this._buildClassNameCompletions.bind(this),' ');this.disableDefaultSuggestionForEmptyInput();this._selectedFrameId='';this._classNamesPromise=null;}
_getClassNames(selectedNode){const promises=[];const completions=new Set();this._selectedFrameId=selectedNode.frameId();const cssModel=selectedNode.domModel().cssModel();const allStyleSheets=cssModel.allStyleSheets();for(const stylesheet of allStyleSheets){if(stylesheet.frameId!==this._selectedFrameId){continue;}
const cssPromise=cssModel.classNamesPromise(stylesheet.id).then(classes=>completions.addAll(classes));promises.push(cssPromise);}
const domPromise=selectedNode.domModel().classNamesPromise(selectedNode.ownerDocument.id).then(classes=>completions.addAll(classes));promises.push(domPromise);return Promise.all(promises).then(()=>[...completions]);}
_buildClassNameCompletions(expression,prefix,force){if(!prefix||force){this._classNamesPromise=null;}
const selectedNode=self.UI.context.flavor(SDK.DOMModel.DOMNode);if(!selectedNode||(!prefix&&!force&&!expression.trim())){return Promise.resolve([]);}
if(!this._classNamesPromise||this._selectedFrameId!==selectedNode.frameId()){this._classNamesPromise=this._getClassNames(selectedNode);}
return this._classNamesPromise.then(completions=>{const classesMap=this._nodeClasses((selectedNode));completions=completions.filter(value=>!classesMap.get(value));if(prefix[0]==='.'){completions=completions.map(value=>'.'+value);}
return completions.filter(value=>value.startsWith(prefix)).sort().map(completion=>({text:completion}));});}}