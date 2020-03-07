import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';export class DOMBreakpointsSidebarPane extends UI.Widget.VBox{constructor(){super(true);this.registerRequiredCSS('browser_debugger/domBreakpointsSidebarPane.css');this._emptyElement=this.contentElement.createChild('div','gray-info-message');this._emptyElement.textContent=Common.UIString.UIString('No breakpoints');this._breakpoints=new UI.ListModel.ListModel();this._list=new UI.ListControl.ListControl(this._breakpoints,this,UI.ListControl.ListMode.NonViewport);this.contentElement.appendChild(this._list.element);this._list.element.classList.add('breakpoint-list','hidden');UI.ARIAUtils.markAsList(this._list.element);UI.ARIAUtils.setAccessibleName(this._list.element,ls`DOM Breakpoints list`);this._emptyElement.tabIndex=-1;self.SDK.targetManager.addModelListener(SDK.DOMDebuggerModel.DOMDebuggerModel,SDK.DOMDebuggerModel.Events.DOMBreakpointAdded,this._breakpointAdded,this);self.SDK.targetManager.addModelListener(SDK.DOMDebuggerModel.DOMDebuggerModel,SDK.DOMDebuggerModel.Events.DOMBreakpointToggled,this._breakpointToggled,this);self.SDK.targetManager.addModelListener(SDK.DOMDebuggerModel.DOMDebuggerModel,SDK.DOMDebuggerModel.Events.DOMBreakpointsRemoved,this._breakpointsRemoved,this);for(const domDebuggerModel of self.SDK.targetManager.models(SDK.DOMDebuggerModel.DOMDebuggerModel)){domDebuggerModel.retrieveDOMBreakpoints();for(const breakpoint of domDebuggerModel.domBreakpoints()){this._addBreakpoint(breakpoint);}}
this._highlightedBreakpoint=null;this._update();}
createElementForItem(item){const element=createElementWithClass('div','breakpoint-entry');element.addEventListener('contextmenu',this._contextMenu.bind(this,item),true);UI.ARIAUtils.markAsListitem(element);element.tabIndex=this._list.selectedItem()===item?0:-1;const checkboxLabel=UI.UIUtils.CheckboxLabel.create('',item.enabled);const checkboxElement=checkboxLabel.checkboxElement;checkboxElement.addEventListener('click',this._checkboxClicked.bind(this,item),false);checkboxElement.tabIndex=-1;UI.ARIAUtils.markAsHidden(checkboxLabel);element.appendChild(checkboxLabel);const labelElement=createElementWithClass('div','dom-breakpoint');element.appendChild(labelElement);element.addEventListener('keydown',event=>{if(event.key===' '){checkboxElement.click();event.consume(true);}});const description=createElement('div');const breakpointTypeLabel=BreakpointTypeLabels.get(item.type);description.textContent=breakpointTypeLabel;const linkifiedNode=createElementWithClass('monospace');linkifiedNode.style.display='block';labelElement.appendChild(linkifiedNode);Common.Linkifier.Linkifier.linkify(item.node,{preventKeyboardFocus:true}).then(linkified=>{linkifiedNode.appendChild(linkified);UI.ARIAUtils.setAccessibleName(checkboxElement,ls`${breakpointTypeLabel}: ${linkified.deepTextContent()}`);});labelElement.appendChild(description);const checkedStateText=item.enabled?ls`checked`:ls`unchecked`;if(item===this._highlightedBreakpoint){element.classList.add('breakpoint-hit');UI.ARIAUtils.setDescription(element,ls`${checkedStateText} breakpoint hit`);}else{UI.ARIAUtils.setDescription(element,checkedStateText);}
this._emptyElement.classList.add('hidden');this._list.element.classList.remove('hidden');return element;}
heightForItem(item){return 0;}
isItemSelectable(item){return true;}
updateSelectedItemARIA(fromElement,toElement){return true;}
selectedItemChanged(from,to,fromElement,toElement){if(fromElement){fromElement.tabIndex=-1;}
if(toElement){this.setDefaultFocusedElement(toElement);toElement.tabIndex=0;if(this.hasFocus()){toElement.focus();}}}
_breakpointAdded(event){this._addBreakpoint((event.data));}
_breakpointToggled(event){const hadFocus=this.hasFocus();const breakpoint=(event.data);this._list.refreshItem(breakpoint);if(hadFocus){this.focus();}}
_breakpointsRemoved(event){const hadFocus=this.hasFocus();const breakpoints=(event.data);let lastIndex=-1;for(const breakpoint of breakpoints){const index=this._breakpoints.indexOf(breakpoint);if(index>=0){this._breakpoints.remove(index);lastIndex=index;}}
if(this._breakpoints.length===0){this._emptyElement.classList.remove('hidden');this.setDefaultFocusedElement(this._emptyElement);this._list.element.classList.add('hidden');}else if(lastIndex>=0){const breakpointToSelect=this._breakpoints.at(lastIndex);if(breakpointToSelect){this._list.selectItem(breakpointToSelect);}}
if(hadFocus){this.focus();}}
_addBreakpoint(breakpoint){this._breakpoints.insertWithComparator(breakpoint,(breakpointA,breakpointB)=>{if(breakpointA.type>breakpointB.type){return-1;}
if(breakpointA.type<breakpointB.type){return 1;}
return 0;});if(!this.hasFocus()){this._list.selectItem(this._breakpoints.at(0));}}
_contextMenu(breakpoint,event){const contextMenu=new UI.ContextMenu.ContextMenu(event);contextMenu.defaultSection().appendItem(ls`Reveal DOM node in Elements panel`,Common.Revealer.reveal.bind(null,breakpoint.node));contextMenu.defaultSection().appendItem(Common.UIString.UIString('Remove breakpoint'),()=>{breakpoint.domDebuggerModel.removeDOMBreakpoint(breakpoint.node,breakpoint.type);});contextMenu.defaultSection().appendItem(Common.UIString.UIString('Remove all DOM breakpoints'),()=>{breakpoint.domDebuggerModel.removeAllDOMBreakpoints();});contextMenu.show();}
_checkboxClicked(breakpoint,event){breakpoint.domDebuggerModel.toggleDOMBreakpoint(breakpoint,event.target.checked);}
flavorChanged(object){this._update();}
_update(){const details=self.UI.context.flavor(SDK.DebuggerModel.DebuggerPausedDetails);if(this._highlightedBreakpoint){const oldHighlightedBreakpoint=this._highlightedBreakpoint;delete this._highlightedBreakpoint;this._list.refreshItem(oldHighlightedBreakpoint);}
if(!details||!details.auxData||details.reason!==SDK.DebuggerModel.BreakReason.DOM){return;}
const domDebuggerModel=details.debuggerModel.target().model(SDK.DOMDebuggerModel.DOMDebuggerModel);if(!domDebuggerModel){return;}
const data=domDebuggerModel.resolveDOMBreakpointData((details.auxData));if(!data){return;}
for(const breakpoint of this._breakpoints){if(breakpoint.node===data.node&&breakpoint.type===data.type){this._highlightedBreakpoint=breakpoint;}}
if(this._highlightedBreakpoint){this._list.refreshItem(this._highlightedBreakpoint);}
self.UI.viewManager.showView('sources.domBreakpoints');}}
export const BreakpointTypeLabels=new Map([[Protocol.DOMDebugger.DOMBreakpointType.SubtreeModified,Common.UIString.UIString('Subtree modified')],[Protocol.DOMDebugger.DOMBreakpointType.AttributeModified,Common.UIString.UIString('Attribute modified')],[Protocol.DOMDebugger.DOMBreakpointType.NodeRemoved,Common.UIString.UIString('Node removed')],]);export class ContextMenuProvider{appendApplicableItems(event,contextMenu,object){const node=(object);if(node.pseudoType()){return;}
const domDebuggerModel=node.domModel().target().model(SDK.DOMDebuggerModel.DOMDebuggerModel);if(!domDebuggerModel){return;}
function toggleBreakpoint(type){if(domDebuggerModel.hasDOMBreakpoint(node,type)){domDebuggerModel.removeDOMBreakpoint(node,type);}else{domDebuggerModel.setDOMBreakpoint(node,type);}}
const breakpointsMenu=contextMenu.debugSection().appendSubMenuItem(Common.UIString.UIString('Break on'));for(const key in Protocol.DOMDebugger.DOMBreakpointType){const type=Protocol.DOMDebugger.DOMBreakpointType[key];const label=Sources.DebuggerPausedMessage.BreakpointTypeNouns.get(type);breakpointsMenu.defaultSection().appendCheckboxItem(label,toggleBreakpoint.bind(null,type),domDebuggerModel.hasDOMBreakpoint(node,type));}}}