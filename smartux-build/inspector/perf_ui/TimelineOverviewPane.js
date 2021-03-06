import*as Common from'../common/common.js';import*as UI from'../ui/ui.js';import{Events as OverviewGridEvents,OverviewGrid}from'./OverviewGrid.js';import{Calculator}from'./TimelineGrid.js';export class TimelineOverviewPane extends UI.Widget.VBox{constructor(prefix){super();this.element.id=prefix+'-overview-pane';this._overviewCalculator=new TimelineOverviewCalculator();this._overviewGrid=new OverviewGrid(prefix,this._overviewCalculator);this.element.appendChild(this._overviewGrid.element);this._cursorArea=this._overviewGrid.element.createChild('div','overview-grid-cursor-area');this._cursorElement=this._overviewGrid.element.createChild('div','overview-grid-cursor-position');this._cursorArea.addEventListener('mousemove',this._onMouseMove.bind(this),true);this._cursorArea.addEventListener('mouseleave',this._hideCursor.bind(this),true);this._overviewGrid.setResizeEnabled(false);this._overviewGrid.addEventListener(OverviewGridEvents.WindowChanged,this._onWindowChanged,this);this._overviewGrid.setClickHandler(this._onClick.bind(this));this._overviewControls=[];this._markers=new Map();this._overviewInfo=new OverviewInfo(this._cursorElement);this._updateThrottler=new Common.Throttler.Throttler(100);this._cursorEnabled=false;this._cursorPosition=0;this._lastWidth=0;this._windowStartTime=0;this._windowEndTime=Infinity;this._muteOnWindowChanged=false;}
_onMouseMove(event){if(!this._cursorEnabled){return;}
this._cursorPosition=event.offsetX+event.target.offsetLeft;this._cursorElement.style.left=this._cursorPosition+'px';this._cursorElement.style.visibility='visible';this._overviewInfo.setContent(this._buildOverviewInfo());}
async _buildOverviewInfo(){const document=this.element.ownerDocument;const x=this._cursorPosition;const elements=await Promise.all(this._overviewControls.map(control=>control.overviewInfoPromise(x)));const fragment=document.createDocumentFragment();fragment.appendChildren.apply(fragment,elements.filter(element=>element!==null));return fragment;}
_hideCursor(){this._cursorElement.style.visibility='hidden';this._overviewInfo.hide();}
wasShown(){this._update();}
willHide(){this._overviewInfo.hide();}
onResize(){const width=this.element.offsetWidth;if(width===this._lastWidth){return;}
this._lastWidth=width;this.scheduleUpdate();}
setOverviewControls(overviewControls){for(let i=0;i<this._overviewControls.length;++i){this._overviewControls[i].dispose();}
for(let i=0;i<overviewControls.length;++i){overviewControls[i].setCalculator(this._overviewCalculator);overviewControls[i].show(this._overviewGrid.element);}
this._overviewControls=overviewControls;this._update();}
setBounds(minimumBoundary,maximumBoundary){this._overviewCalculator.setBounds(minimumBoundary,maximumBoundary);this._overviewGrid.setResizeEnabled(true);this._cursorEnabled=true;}
scheduleUpdate(){this._updateThrottler.schedule(process.bind(this));function process(){this._update();return Promise.resolve();}}
_update(){if(!this.isShowing()){return;}
this._overviewCalculator.setDisplayWidth(this._overviewGrid.clientWidth());for(let i=0;i<this._overviewControls.length;++i){this._overviewControls[i].update();}
this._overviewGrid.updateDividers(this._overviewCalculator);this._updateMarkers();this._updateWindow();}
setMarkers(markers){this._markers=markers;}
_updateMarkers(){const filteredMarkers=new Map();for(const time of this._markers.keys()){const marker=this._markers.get(time);const position=Math.round(this._overviewCalculator.computePosition(time));if(filteredMarkers.has(position)){continue;}
filteredMarkers.set(position,marker);marker.style.left=position+'px';}
this._overviewGrid.removeEventDividers();this._overviewGrid.addEventDividers([...filteredMarkers.values()]);}
reset(){this._windowStartTime=0;this._windowEndTime=Infinity;this._overviewCalculator.reset();this._overviewGrid.reset();this._overviewGrid.setResizeEnabled(false);this._cursorEnabled=false;this._hideCursor();this._markers=new Map();for(const control of this._overviewControls){control.reset();}
this._overviewInfo.hide();this.scheduleUpdate();}
_onClick(event){return this._overviewControls.some(control=>control.onClick(event));}
_onWindowChanged(event){if(this._muteOnWindowChanged){return;}
if(!this._overviewControls.length){return;}
this._windowStartTime=event.data.rawStartValue;this._windowEndTime=event.data.rawEndValue;const windowTimes={startTime:this._windowStartTime,endTime:this._windowEndTime};this.dispatchEventToListeners(Events.WindowChanged,windowTimes);}
setWindowTimes(startTime,endTime){if(startTime===this._windowStartTime&&endTime===this._windowEndTime){return;}
this._windowStartTime=startTime;this._windowEndTime=endTime;this._updateWindow();this.dispatchEventToListeners(Events.WindowChanged,{startTime:startTime,endTime:endTime});}
_updateWindow(){if(!this._overviewControls.length){return;}
const absoluteMin=this._overviewCalculator.minimumBoundary();const timeSpan=this._overviewCalculator.maximumBoundary()-absoluteMin;const haveRecords=absoluteMin>0;const left=haveRecords&&this._windowStartTime?Math.min((this._windowStartTime-absoluteMin)/timeSpan,1):0;const right=haveRecords&&this._windowEndTime<Infinity?(this._windowEndTime-absoluteMin)/timeSpan:1;this._muteOnWindowChanged=true;this._overviewGrid.setWindow(left,right);this._muteOnWindowChanged=false;}}
export const Events={WindowChanged:Symbol('WindowChanged')};export class TimelineOverviewCalculator{constructor(){this.reset();}
computePosition(time){return(time-this._minimumBoundary)/this.boundarySpan()*this._workingArea;}
positionToTime(position){return position/this._workingArea*this.boundarySpan()+this._minimumBoundary;}
setBounds(minimumBoundary,maximumBoundary){this._minimumBoundary=minimumBoundary;this._maximumBoundary=maximumBoundary;}
setDisplayWidth(clientWidth){this._workingArea=clientWidth;}
reset(){this.setBounds(0,100);}
formatValue(value,precision){return Number.preciseMillisToString(value-this.zeroTime(),precision);}
maximumBoundary(){return this._maximumBoundary;}
minimumBoundary(){return this._minimumBoundary;}
zeroTime(){return this._minimumBoundary;}
boundarySpan(){return this._maximumBoundary-this._minimumBoundary;}}
export class TimelineOverview{show(parentElement,insertBefore){}
update(){}
dispose(){}
reset(){}
overviewInfoPromise(x){}
onClick(event){}
setCalculator(calculator){}}
export class TimelineOverviewBase extends UI.Widget.VBox{constructor(){super();this._calculator=null;this._canvas=this.element.createChild('canvas','fill');this._context=this._canvas.getContext('2d');}
width(){return this._canvas.width;}
height(){return this._canvas.height;}
context(){return this._context;}
calculator(){return this._calculator;}
update(){this.resetCanvas();}
dispose(){this.detach();}
reset(){}
overviewInfoPromise(x){return Promise.resolve((null));}
setCalculator(calculator){this._calculator=calculator;}
onClick(event){return false;}
resetCanvas(){if(this.element.clientWidth){this.setCanvasSize(this.element.clientWidth,this.element.clientHeight);}}
setCanvasSize(width,height){this._canvas.width=width*window.devicePixelRatio;this._canvas.height=height*window.devicePixelRatio;}}
export class OverviewInfo{constructor(anchor){this._anchorElement=anchor;this._glassPane=new UI.GlassPane.GlassPane();this._glassPane.setPointerEventsBehavior(UI.GlassPane.PointerEventsBehavior.PierceContents);this._glassPane.setMarginBehavior(UI.GlassPane.MarginBehavior.Arrow);this._glassPane.setSizeBehavior(UI.GlassPane.SizeBehavior.MeasureContent);this._visible=false;this._element=UI.Utils.createShadowRootWithCoreStyles(this._glassPane.contentElement,'perf_ui/timelineOverviewInfo.css').createChild('div','overview-info');}
async setContent(contentPromise){this._visible=true;const content=await contentPromise;if(!this._visible){return;}
this._element.removeChildren();this._element.appendChild(content);this._glassPane.setContentAnchorBox(this._anchorElement.boxInWindow());if(!this._glassPane.isShowing()){this._glassPane.show((this._anchorElement.ownerDocument));}}
hide(){this._visible=false;this._glassPane.hide();}}