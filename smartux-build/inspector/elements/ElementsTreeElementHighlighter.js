import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ElementsTreeOutline}from'./ElementsTreeOutline.js';export class ElementsTreeElementHighlighter{constructor(treeOutline){this._throttler=new Common.Throttler.Throttler(100);this._treeOutline=treeOutline;this._treeOutline.addEventListener(UI.TreeOutline.Events.ElementExpanded,this._clearState,this);this._treeOutline.addEventListener(UI.TreeOutline.Events.ElementCollapsed,this._clearState,this);this._treeOutline.addEventListener(ElementsTreeOutline.Events.SelectedNodeChanged,this._clearState,this);self.SDK.targetManager.addModelListener(SDK.OverlayModel.OverlayModel,SDK.OverlayModel.Events.HighlightNodeRequested,this._highlightNode,this);self.SDK.targetManager.addModelListener(SDK.OverlayModel.OverlayModel,SDK.OverlayModel.Events.InspectModeWillBeToggled,this._clearState,this);}
_highlightNode(event){if(!self.Common.settings.moduleSetting('highlightNodeOnHoverInOverlay').get()){return;}
const domNode=(event.data);this._throttler.schedule(callback.bind(this));this._pendingHighlightNode=this._treeOutline===ElementsTreeOutline.forDOMModel(domNode.domModel())?domNode:null;function callback(){this._highlightNodeInternal(this._pendingHighlightNode);delete this._pendingHighlightNode;return Promise.resolve();}}
_highlightNodeInternal(node){this._isModifyingTreeOutline=true;let treeElement=null;if(this._currentHighlightedElement){let currentTreeElement=this._currentHighlightedElement;while(currentTreeElement!==this._alreadyExpandedParentElement){if(currentTreeElement.expanded){currentTreeElement.collapse();}
currentTreeElement=currentTreeElement.parent;}}
delete this._currentHighlightedElement;delete this._alreadyExpandedParentElement;if(node){let deepestExpandedParent=node;const treeElementSymbol=this._treeOutline.treeElementSymbol();while(deepestExpandedParent&&(!deepestExpandedParent[treeElementSymbol]||!deepestExpandedParent[treeElementSymbol].expanded)){deepestExpandedParent=deepestExpandedParent.parentNode;}
this._alreadyExpandedParentElement=deepestExpandedParent?deepestExpandedParent[treeElementSymbol]:this._treeOutline.rootElement();treeElement=this._treeOutline.createTreeElementFor(node);}
this._currentHighlightedElement=treeElement;this._treeOutline.setHoverEffect(treeElement);if(treeElement){treeElement.reveal(true);}
this._isModifyingTreeOutline=false;}
_clearState(){if(this._isModifyingTreeOutline){return;}
delete this._currentHighlightedElement;delete this._alreadyExpandedParentElement;delete this._pendingHighlightNode;}}