import*as UI from'../ui/ui.js';import{MinimalTimeWindowMs}from'./FlameChart.js';export class ChartViewportDelegate{windowChanged(startTime,endTime,animate){}
updateRangeSelection(startTime,endTime){}
setSize(width,height){}
update(){}}
export class ChartViewport extends UI.Widget.VBox{constructor(delegate){super();this.registerRequiredCSS('perf_ui/chartViewport.css');this._delegate=delegate;this.viewportElement=this.contentElement.createChild('div','fill');this.viewportElement.addEventListener('mousemove',this._updateCursorPosition.bind(this),false);this.viewportElement.addEventListener('mouseout',this._onMouseOut.bind(this),false);this.viewportElement.addEventListener('mousewheel',this._onMouseWheel.bind(this),false);this.viewportElement.addEventListener('keydown',this._onChartKeyDown.bind(this),false);this.viewportElement.addEventListener('keyup',this._onChartKeyUp.bind(this),false);UI.UIUtils.installDragHandle(this.viewportElement,this._startDragging.bind(this),this._dragging.bind(this),this._endDragging.bind(this),'-webkit-grabbing',null);UI.UIUtils.installDragHandle(this.viewportElement,this._startRangeSelection.bind(this),this._rangeSelectionDragging.bind(this),this._endRangeSelection.bind(this),'text',null);this._alwaysShowVerticalScroll=false;this._rangeSelectionEnabled=true;this._vScrollElement=this.contentElement.createChild('div','chart-viewport-v-scroll');this._vScrollContent=this._vScrollElement.createChild('div');this._vScrollElement.addEventListener('scroll',this._onScroll.bind(this),false);this._selectionOverlay=this.contentElement.createChild('div','chart-viewport-selection-overlay hidden');this._selectedTimeSpanLabel=this._selectionOverlay.createChild('div','time-span');this._cursorElement=this.contentElement.createChild('div','chart-cursor-element hidden');this.reset();}
alwaysShowVerticalScroll(){this._alwaysShowVerticalScroll=true;this._vScrollElement.classList.add('always-show-scrollbar');}
disableRangeSelection(){this._rangeSelectionEnabled=false;this._rangeSelectionStart=null;this._rangeSelectionEnd=null;this._updateRangeSelectionOverlay();}
isDragging(){return this._isDragging;}
elementsToRestoreScrollPositionsFor(){return[this._vScrollElement];}
_updateScrollBar(){const showScroll=this._alwaysShowVerticalScroll||this._totalHeight>this._offsetHeight;if(this._vScrollElement.classList.contains('hidden')!==showScroll){return;}
this._vScrollElement.classList.toggle('hidden',!showScroll);this._updateContentElementSize();}
onResize(){this._updateScrollBar();this._updateContentElementSize();this.scheduleUpdate();}
reset(){this._vScrollElement.scrollTop=0;this._scrollTop=0;this._rangeSelectionStart=null;this._rangeSelectionEnd=null;this._isDragging=false;this._dragStartPointX=0;this._dragStartPointY=0;this._dragStartScrollTop=0;this._visibleLeftTime=0;this._visibleRightTime=0;this._offsetWidth=0;this._offsetHeight=0;this._totalHeight=0;this._targetLeftTime=0;this._targetRightTime=0;this._updateContentElementSize();}
_updateContentElementSize(){let offsetWidth=this._vScrollElement.offsetLeft;if(!offsetWidth){offsetWidth=this.contentElement.offsetWidth;}
this._offsetWidth=offsetWidth;this._offsetHeight=this.contentElement.offsetHeight;this._delegate.setSize(this._offsetWidth,this._offsetHeight);}
setContentHeight(totalHeight){this._totalHeight=totalHeight;this._vScrollContent.style.height=totalHeight+'px';this._updateScrollBar();this._updateContentElementSize();if(this._scrollTop+this._offsetHeight<=totalHeight){return;}
this._scrollTop=Math.max(0,totalHeight-this._offsetHeight);this._vScrollElement.scrollTop=this._scrollTop;}
setScrollOffset(offset,height){height=height||0;if(this._vScrollElement.scrollTop>offset){this._vScrollElement.scrollTop=offset;}else if(this._vScrollElement.scrollTop<offset-this._offsetHeight+height){this._vScrollElement.scrollTop=offset-this._offsetHeight+height;}}
scrollOffset(){return this._vScrollElement.scrollTop;}
chartHeight(){return this._offsetHeight;}
setBoundaries(zeroTime,totalTime){this._minimumBoundary=zeroTime;this._totalTime=totalTime;}
_onMouseWheel(e){const doZoomInstead=e.shiftKey^(self.Common.settings.moduleSetting('flamechartMouseWheelAction').get()==='zoom');const panVertically=!doZoomInstead&&(e.wheelDeltaY||Math.abs(e.wheelDeltaX)===120);const panHorizontally=doZoomInstead&&Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY);if(panVertically){this._vScrollElement.scrollTop-=(e.wheelDeltaY||e.wheelDeltaX)/120*this._offsetHeight/8;}else if(panHorizontally){this._handlePanGesture(-e.wheelDeltaX,true);}else{const mouseWheelZoomSpeed=1/120;this._handleZoomGesture(Math.pow(1.2,-(e.wheelDeltaY||e.wheelDeltaX)*mouseWheelZoomSpeed)-1);}
e.consume(true);}
_startDragging(event){if(event.shiftKey){return false;}
this._isDragging=true;this._dragStartPointX=event.pageX;this._dragStartPointY=event.pageY;this._dragStartScrollTop=this._vScrollElement.scrollTop;this.viewportElement.style.cursor='';return true;}
_dragging(event){const pixelShift=this._dragStartPointX-event.pageX;this._dragStartPointX=event.pageX;this._handlePanGesture(pixelShift);const pixelScroll=this._dragStartPointY-event.pageY;this._vScrollElement.scrollTop=this._dragStartScrollTop+pixelScroll;}
_endDragging(){this._isDragging=false;}
_startRangeSelection(event){if(!event.shiftKey||!this._rangeSelectionEnabled){return false;}
this._isDragging=true;this._selectionOffsetShiftX=event.offsetX-event.pageX;this._selectionOffsetShiftY=event.offsetY-event.pageY;this._selectionStartX=event.offsetX;const style=this._selectionOverlay.style;style.left=this._selectionStartX+'px';style.width='1px';this._selectedTimeSpanLabel.textContent='';this._selectionOverlay.classList.remove('hidden');return true;}
_endRangeSelection(){this._isDragging=false;this._selectionStartX=null;}
hideRangeSelection(){this._selectionOverlay.classList.add('hidden');this._rangeSelectionStart=null;this._rangeSelectionEnd=null;}
setRangeSelection(startTime,endTime){if(!this._rangeSelectionEnabled){return;}
this._rangeSelectionStart=Math.min(startTime,endTime);this._rangeSelectionEnd=Math.max(startTime,endTime);this._updateRangeSelectionOverlay();this._delegate.updateRangeSelection(this._rangeSelectionStart,this._rangeSelectionEnd);}
onClick(event){const time=this.pixelToTime(event.offsetX);if(this._rangeSelectionStart!==null&&time>=this._rangeSelectionStart&&time<=this._rangeSelectionEnd){return;}
this.hideRangeSelection();}
_rangeSelectionDragging(event){const x=Number.constrain(event.pageX+this._selectionOffsetShiftX,0,this._offsetWidth);const start=this.pixelToTime(this._selectionStartX);const end=this.pixelToTime(x);this.setRangeSelection(start,end);}
_updateRangeSelectionOverlay(){const margin=100;const left=Number.constrain(this.timeToPosition(this._rangeSelectionStart),-margin,this._offsetWidth+margin);const right=Number.constrain(this.timeToPosition(this._rangeSelectionEnd),-margin,this._offsetWidth+margin);const style=this._selectionOverlay.style;style.left=left+'px';style.width=(right-left)+'px';const timeSpan=this._rangeSelectionEnd-this._rangeSelectionStart;this._selectedTimeSpanLabel.textContent=Number.preciseMillisToString(timeSpan,2);}
_onScroll(){this._scrollTop=this._vScrollElement.scrollTop;this.scheduleUpdate();}
_onMouseOut(){this._lastMouseOffsetX=-1;this._showCursor(false);}
_updateCursorPosition(e){this._showCursor(e.shiftKey);this._cursorElement.style.left=e.offsetX+'px';this._lastMouseOffsetX=e.offsetX;}
pixelToTime(x){return this.pixelToTimeOffset(x)+this._visibleLeftTime;}
pixelToTimeOffset(x){return x*(this._visibleRightTime-this._visibleLeftTime)/this._offsetWidth;}
timeToPosition(time){return Math.floor((time-this._visibleLeftTime)/(this._visibleRightTime-this._visibleLeftTime)*this._offsetWidth);}
timeToPixel(){return this._offsetWidth/(this._visibleRightTime-this._visibleLeftTime);}
_showCursor(visible){this._cursorElement.classList.toggle('hidden',!visible||this._isDragging);}
_onChartKeyDown(e){this._showCursor(e.shiftKey);this._handleZoomPanKeys(e);}
_onChartKeyUp(e){this._showCursor(e.shiftKey);}
_handleZoomPanKeys(e){if(!UI.KeyboardShortcut.KeyboardShortcut.hasNoModifiers(e)){return;}
const zoomFactor=e.shiftKey?0.8:0.3;const panOffset=e.shiftKey?320:160;switch(e.code){case'KeyA':this._handlePanGesture(-panOffset,true);break;case'KeyD':this._handlePanGesture(panOffset,true);break;case'KeyW':this._handleZoomGesture(-zoomFactor);break;case'KeyS':this._handleZoomGesture(zoomFactor);break;default:return;}
e.consume(true);}
_handleZoomGesture(zoom){const bounds={left:this._targetLeftTime,right:this._targetRightTime};const cursorTime=this.pixelToTime(this._lastMouseOffsetX);bounds.left+=(bounds.left-cursorTime)*zoom;bounds.right+=(bounds.right-cursorTime)*zoom;this._requestWindowTimes(bounds,true);}
_handlePanGesture(offset,animate){const bounds={left:this._targetLeftTime,right:this._targetRightTime};const timeOffset=Number.constrain(this.pixelToTimeOffset(offset),this._minimumBoundary-bounds.left,this._totalTime+this._minimumBoundary-bounds.right);bounds.left+=timeOffset;bounds.right+=timeOffset;this._requestWindowTimes(bounds,!!animate);}
_requestWindowTimes(bounds,animate){const maxBound=this._minimumBoundary+this._totalTime;if(bounds.left<this._minimumBoundary){bounds.right=Math.min(bounds.right+this._minimumBoundary-bounds.left,maxBound);bounds.left=this._minimumBoundary;}else if(bounds.right>maxBound){bounds.left=Math.max(bounds.left-bounds.right+maxBound,this._minimumBoundary);bounds.right=maxBound;}
if(bounds.right-bounds.left<MinimalTimeWindowMs){return;}
this._delegate.windowChanged(bounds.left,bounds.right,animate);}
scheduleUpdate(){if(this._updateTimerId||this._cancelWindowTimesAnimation){return;}
this._updateTimerId=this.element.window().requestAnimationFrame(()=>{this._updateTimerId=0;this._update();});}
_update(){this._updateRangeSelectionOverlay();this._delegate.update();}
setWindowTimes(startTime,endTime,animate){if(startTime===this._targetLeftTime&&endTime===this._targetRightTime){return;}
if(!animate||this._visibleLeftTime===0||this._visibleRightTime===Infinity||(startTime===0&&endTime===Infinity)||(startTime===Infinity&&endTime===Infinity)){this._targetLeftTime=startTime;this._targetRightTime=endTime;this._visibleLeftTime=startTime;this._visibleRightTime=endTime;this.scheduleUpdate();return;}
if(this._cancelWindowTimesAnimation){this._cancelWindowTimesAnimation();this._visibleLeftTime=this._targetLeftTime;this._visibleRightTime=this._targetRightTime;}
this._targetLeftTime=startTime;this._targetRightTime=endTime;this._cancelWindowTimesAnimation=UI.UIUtils.animateFunction(this.element.window(),animateWindowTimes.bind(this),[{from:this._visibleLeftTime,to:startTime},{from:this._visibleRightTime,to:endTime}],100,()=>this._cancelWindowTimesAnimation=null);function animateWindowTimes(startTime,endTime){this._visibleLeftTime=startTime;this._visibleRightTime=endTime;this._update();}}
windowLeftTime(){return this._visibleLeftTime;}
windowRightTime(){return this._visibleRightTime;}}