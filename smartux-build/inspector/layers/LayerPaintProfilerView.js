import*as LayerViewer from'../layer_viewer/layer_viewer.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';export class LayerPaintProfilerView extends UI.SplitWidget.SplitWidget{constructor(showImageCallback){super(true,false);this._logTreeView=new LayerViewer.PaintProfilerView.PaintProfilerCommandLogView();this.setSidebarWidget(this._logTreeView);this._paintProfilerView=new LayerViewer.PaintProfilerView.PaintProfilerView(showImageCallback);this.setMainWidget(this._paintProfilerView);this._paintProfilerView.addEventListener(LayerViewer.PaintProfilerView.Events.WindowChanged,this._onWindowChanged,this);this._logTreeView.focus();}
reset(){this._paintProfilerView.setSnapshotAndLog(null,[],null);}
profile(snapshot){snapshot.commandLog().then(log=>setSnapshotAndLog.call(this,snapshot,log));function setSnapshotAndLog(snapshot,log){this._logTreeView.setCommandLog(log||[]);this._paintProfilerView.setSnapshotAndLog(snapshot,log||[],null);if(snapshot){snapshot.release();}}}
setScale(scale){this._paintProfilerView.setScale(scale);}
_onWindowChanged(){this._logTreeView.updateWindow(this._paintProfilerView.selectionWindow());}}