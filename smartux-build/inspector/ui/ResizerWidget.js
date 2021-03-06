import*as Common from'../common/common.js';import{elementDragStart}from'./UIUtils.js';export class ResizerWidget extends Common.ObjectWrapper.ObjectWrapper{constructor(){super();this._isEnabled=true;this._elements=new Set();this._installDragOnMouseDownBound=this._installDragOnMouseDown.bind(this);this._cursor='nwse-resize';}
isEnabled(){return this._isEnabled;}
setEnabled(enabled){this._isEnabled=enabled;this.updateElementCursors();}
elements(){return[...this._elements];}
addElement(element){if(!this._elements.has(element)){this._elements.add(element);element.addEventListener('mousedown',this._installDragOnMouseDownBound,false);this._updateElementCursor(element);}}
removeElement(element){if(this._elements.has(element)){this._elements.delete(element);element.removeEventListener('mousedown',this._installDragOnMouseDownBound,false);element.style.removeProperty('cursor');}}
updateElementCursors(){this._elements.forEach(this._updateElementCursor.bind(this));}
_updateElementCursor(element){if(this._isEnabled){element.style.setProperty('cursor',this.cursor());}else{element.style.removeProperty('cursor');}}
cursor(){return this._cursor;}
setCursor(cursor){this._cursor=cursor;this.updateElementCursors();}
_installDragOnMouseDown(event){const element=(event.target);if(!this._elements.has(element)){return false;}
elementDragStart(element,this._dragStart.bind(this),this._drag.bind(this),this._dragEnd.bind(this),this.cursor(),event);}
_dragStart(event){if(!this._isEnabled){return false;}
this._startX=event.pageX;this._startY=event.pageY;this.sendDragStart(this._startX,this._startY);return true;}
sendDragStart(x,y){this.dispatchEventToListeners(Events.ResizeStart,{startX:x,currentX:x,startY:y,currentY:y});}
_drag(event){if(!this._isEnabled){this._dragEnd(event);return true;}
this.sendDragMove(this._startX,event.pageX,this._startY,event.pageY,event.shiftKey);event.preventDefault();return false;}
sendDragMove(startX,currentX,startY,currentY,shiftKey){this.dispatchEventToListeners(Events.ResizeUpdate,{startX:startX,currentX:currentX,startY:startY,currentY:currentY,shiftKey:shiftKey});}
_dragEnd(event){this.dispatchEventToListeners(Events.ResizeEnd);delete this._startX;delete this._startY;window.document.dispatchEvent(new CustomEvent('DEVTOOLS_SPLITBAR_DRAG_END'));}}
export const Events={ResizeStart:Symbol('ResizeStart'),ResizeUpdate:Symbol('ResizeUpdate'),ResizeEnd:Symbol('ResizeEnd')};export class SimpleResizerWidget extends ResizerWidget{constructor(){super();this._isVertical=true;}
isVertical(){return this._isVertical;}
setVertical(vertical){this._isVertical=vertical;this.updateElementCursors();}
cursor(){return this._isVertical?'ns-resize':'ew-resize';}
sendDragStart(x,y){const position=this._isVertical?y:x;this.dispatchEventToListeners(Events.ResizeStart,{startPosition:position,currentPosition:position});}
sendDragMove(startX,currentX,startY,currentY,shiftKey){if(this._isVertical){this.dispatchEventToListeners(Events.ResizeUpdate,{startPosition:startY,currentPosition:currentY,shiftKey:shiftKey});}else{this.dispatchEventToListeners(Events.ResizeUpdate,{startPosition:startX,currentPosition:currentX,shiftKey:shiftKey});}}}