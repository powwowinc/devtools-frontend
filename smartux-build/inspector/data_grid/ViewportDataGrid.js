import{DataGridImpl,DataGridNode,Parameters}from'./DataGrid.js';export class ViewportDataGrid extends DataGridImpl{constructor(dataGridParameters){super(dataGridParameters);this._onScrollBound=this._onScroll.bind(this);this.scrollContainer.addEventListener('scroll',this._onScrollBound,true);this._visibleNodes=[];this._inline=false;this._stickToBottom=false;this._updateIsFromUser=false;this._lastScrollTop=0;this._firstVisibleIsStriped=false;this._isStriped=false;this.setRootNode(new ViewportDataGridNode());}
setStriped(striped){this._isStriped=striped;let startsWithOdd=true;if(this._visibleNodes.length){const allChildren=this.rootNode().flatChildren();startsWithOdd=!!(allChildren.indexOf(this._visibleNodes[0]));}
this._updateStripesClass(startsWithOdd);}
_updateStripesClass(startsWithOdd){this.element.classList.toggle('striped-data-grid',!startsWithOdd&&this._isStriped);this.element.classList.toggle('striped-data-grid-starts-with-odd',startsWithOdd&&this._isStriped);}
setScrollContainer(scrollContainer){this.scrollContainer.removeEventListener('scroll',this._onScrollBound,true);this._scrollContainer=scrollContainer;this.scrollContainer.addEventListener('scroll',this._onScrollBound,true);}
onResize(){if(this._stickToBottom){this.scrollContainer.scrollTop=this.scrollContainer.scrollHeight-this.scrollContainer.clientHeight;}
this.scheduleUpdate();super.onResize();}
setStickToBottom(stick){this._stickToBottom=stick;}
_onScroll(event){this._stickToBottom=this.scrollContainer.isScrolledToBottom();if(this._lastScrollTop!==this.scrollContainer.scrollTop){this.scheduleUpdate(true);}}
scheduleUpdateStructure(){this.scheduleUpdate();}
scheduleUpdate(isFromUser){if(this._stickToBottom&&isFromUser){this._stickToBottom=this.scrollContainer.isScrolledToBottom();}
this._updateIsFromUser=this._updateIsFromUser||isFromUser;if(this._updateAnimationFrameId){return;}
this._updateAnimationFrameId=this.element.window().requestAnimationFrame(this._update.bind(this));}
updateInstantly(){this._update();}
renderInline(){this._inline=true;super.renderInline();this._update();}
_calculateVisibleNodes(clientHeight,scrollTop){const nodes=this.rootNode().flatChildren();if(this._inline){return{topPadding:0,bottomPadding:0,contentHeight:0,visibleNodes:nodes,offset:0};}
const size=nodes.length;let i=0;let y=0;for(;i<size&&y+nodes[i].nodeSelfHeight()<scrollTop;++i){y+=nodes[i].nodeSelfHeight();}
const start=i;const topPadding=y;for(;i<size&&y<scrollTop+clientHeight;++i){y+=nodes[i].nodeSelfHeight();}
const end=i;let bottomPadding=0;for(;i<size;++i){bottomPadding+=nodes[i].nodeSelfHeight();}
return{topPadding:topPadding,bottomPadding:bottomPadding,contentHeight:y-topPadding,visibleNodes:nodes.slice(start,end),offset:start};}
_contentHeight(){const nodes=this.rootNode().flatChildren();let result=0;for(let i=0,size=nodes.length;i<size;++i){result+=nodes[i].nodeSelfHeight();}
return result;}
_update(){if(this._updateAnimationFrameId){this.element.window().cancelAnimationFrame(this._updateAnimationFrameId);delete this._updateAnimationFrameId;}
const clientHeight=this.scrollContainer.clientHeight;let scrollTop=this.scrollContainer.scrollTop;const currentScrollTop=scrollTop;const maxScrollTop=Math.max(0,this._contentHeight()-clientHeight);if(!this._updateIsFromUser&&this._stickToBottom){scrollTop=maxScrollTop;}
this._updateIsFromUser=false;scrollTop=Math.min(maxScrollTop,scrollTop);const viewportState=this._calculateVisibleNodes(clientHeight,scrollTop);const visibleNodes=viewportState.visibleNodes;const visibleNodesSet=new Set(visibleNodes);for(let i=0;i<this._visibleNodes.length;++i){const oldNode=this._visibleNodes[i];if(!visibleNodesSet.has(oldNode)&&oldNode.attached()){const element=oldNode.existingElement();element.remove();}}
let previousElement=this.topFillerRowElement();const tBody=this.dataTableBody;let offset=viewportState.offset;if(visibleNodes.length){const nodes=this.rootNode().flatChildren();const index=nodes.indexOf(visibleNodes[0]);this._updateStripesClass(!!(index%2));if(this._stickToBottom&&index!==-1&&!!(index%2)!==this._firstVisibleIsStriped){offset+=1;}}
this._firstVisibleIsStriped=!!(offset%2);for(let i=0;i<visibleNodes.length;++i){const node=visibleNodes[i];const element=node.element();node.setStriped((offset+i)%2===0);if(element!==previousElement.nextSibling){tBody.insertBefore(element,previousElement.nextSibling);}
node.revealed=true;previousElement=element;}
this.setVerticalPadding(viewportState.topPadding,viewportState.bottomPadding);this._lastScrollTop=scrollTop;if(scrollTop!==currentScrollTop){this.scrollContainer.scrollTop=scrollTop;}
const contentFits=viewportState.contentHeight<=clientHeight&&viewportState.topPadding+viewportState.bottomPadding===0;if(contentFits!==this.element.classList.contains('data-grid-fits-viewport')){this.element.classList.toggle('data-grid-fits-viewport',contentFits);this.updateWidths();}
this._visibleNodes=visibleNodes;this.dispatchEventToListeners(Events.ViewportCalculated);}
_revealViewportNode(node){const nodes=this.rootNode().flatChildren();const index=nodes.indexOf(node);if(index===-1){return;}
let fromY=0;for(let i=0;i<index;++i){fromY+=nodes[i].nodeSelfHeight();}
const toY=fromY+node.nodeSelfHeight();let scrollTop=this.scrollContainer.scrollTop;if(scrollTop>fromY){scrollTop=fromY;this._stickToBottom=false;}else if(scrollTop+this.scrollContainer.offsetHeight<toY){scrollTop=toY-this.scrollContainer.offsetHeight;}
this.scrollContainer.scrollTop=scrollTop;}}
export const Events={ViewportCalculated:Symbol('ViewportCalculated')};export class ViewportDataGridNode extends DataGridNode{constructor(data,hasChildren){super(data,hasChildren);this._stale=false;this._flatNodes=null;this._isStriped=false;}
element(){const existingElement=this.existingElement();const element=existingElement||this.createElement();if(!existingElement||this._stale){this.createCells(element);this._stale=false;}
return element;}
setStriped(isStriped){this._isStriped=isStriped;this.element().classList.toggle('odd',isStriped);}
isStriped(){return this._isStriped;}
clearFlatNodes(){this._flatNodes=null;const parent=(this.parent);if(parent){parent.clearFlatNodes();}}
flatChildren(){if(this._flatNodes){return this._flatNodes;}
const flatNodes=[];const children=[this.children];const counters=[0];let depth=0;while(depth>=0){if(children[depth].length<=counters[depth]){depth--;continue;}
const node=children[depth][counters[depth]++];flatNodes.push(node);if(node.expanded&&node.children.length){depth++;children[depth]=node.children;counters[depth]=0;}}
this._flatNodes=flatNodes;return flatNodes;}
insertChild(child,index){this.clearFlatNodes();if(child.parent===this){const currentIndex=this.children.indexOf(child);if(currentIndex<0){console.assert(false,'Inconsistent DataGrid state');}
if(currentIndex===index){return;}
if(currentIndex<index){--index;}}
child.remove();child.parent=this;child.dataGrid=this.dataGrid;if(!this.children.length){this.setHasChildren(true);}
this.children.splice(index,0,child);child.recalculateSiblings(index);if(this.expanded){this.dataGrid.scheduleUpdateStructure();}}
removeChild(child){this.clearFlatNodes();if(this.dataGrid){this.dataGrid.updateSelectionBeforeRemoval(child,false);}
if(child.previousSibling){child.previousSibling.nextSibling=child.nextSibling;}
if(child.nextSibling){child.nextSibling.previousSibling=child.previousSibling;}
if(child.parent!==this){throw'removeChild: Node is not a child of this node.';}
this.children.remove(child,true);child._unlink();if(!this.children.length){this.setHasChildren(false);}
if(this.expanded){this.dataGrid.scheduleUpdateStructure();}}
removeChildren(){this.clearFlatNodes();if(this.dataGrid){this.dataGrid.updateSelectionBeforeRemoval(this,true);}
for(let i=0;i<this.children.length;++i){this.children[i]._unlink();}
this.children=[];if(this.expanded){this.dataGrid.scheduleUpdateStructure();}}
_unlink(){if(this.attached()){this.existingElement().remove();}
this.resetNode();}
collapse(){if(!this.expanded){return;}
this.clearFlatNodes();this._expanded=false;if(this.existingElement()){this.existingElement().classList.remove('expanded');}
if(this.selected){this.dataGrid.updateGridAccessibleName(ls`collapsed`);}
this.dataGrid.scheduleUpdateStructure();}
expand(){if(this.expanded){return;}
this.dataGrid._stickToBottom=false;this.clearFlatNodes();super.expand();this.dataGrid.scheduleUpdateStructure();}
attached(){return!!(this.dataGrid&&this.existingElement()&&this.existingElement().parentElement);}
refresh(){if(this.attached()){this._stale=true;this.dataGrid.scheduleUpdate();}else{this.resetElement();}}
reveal(){this.dataGrid._revealViewportNode(this);}
recalculateSiblings(index){this.clearFlatNodes();super.recalculateSiblings(index);}}