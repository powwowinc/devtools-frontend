import*as SDK from'../sdk/sdk.js';import{LayerPaintEvent}from'./TimelineFrameModel.js';export class TracingLayerTree extends SDK.LayerTreeBase.LayerTreeBase{constructor(target){super(target);this._tileById=new Map();this._paintProfilerModel=target&&target.model(SDK.PaintProfiler.PaintProfilerModel);}
async setLayers(root,layers,paints){const idsToResolve=new Set();if(root){this._extractNodeIdsToResolve(idsToResolve,{},root);}else{for(let i=0;i<layers.length;++i){this._extractNodeIdsToResolve(idsToResolve,{},layers[i]);}}
await this.resolveBackendNodeIds(idsToResolve);const oldLayersById=this._layersById;this._layersById={};this.setContentRoot(null);if(root){const convertedLayers=this._innerSetLayers(oldLayersById,root);this.setRoot(convertedLayers);}else{const processedLayers=layers.map(this._innerSetLayers.bind(this,oldLayersById));const contentRoot=this.contentRoot();this.setRoot(contentRoot);for(let i=0;i<processedLayers.length;++i){if(processedLayers[i].id()!==contentRoot.id()){contentRoot.addChild(processedLayers[i]);}}}
this._setPaints(paints);}
setTiles(tiles){this._tileById=new Map();for(const tile of tiles){this._tileById.set(tile.id,tile);}}
pictureForRasterTile(tileId){const tile=this._tileById.get('cc::Tile/'+tileId);if(!tile){self.Common.console.error(`Tile ${tileId} is missing`);return(Promise.resolve(null));}
const layer=(this.layerById(tile.layer_id));if(!layer){self.Common.console.error(`Layer ${tile.layer_id} for tile ${tileId} is not found`);return(Promise.resolve(null));}
return layer._pictureForRect(tile.content_rect);}
_setPaints(paints){for(let i=0;i<paints.length;++i){const layer=this._layersById[paints[i].layerId()];if(layer){layer._addPaintEvent(paints[i]);}}}
_innerSetLayers(oldLayersById,payload){let layer=(oldLayersById[payload.layer_id]);if(layer){layer._reset(payload);}else{layer=new TracingLayer(this._paintProfilerModel,payload);}
this._layersById[payload.layer_id]=layer;if(payload.owner_node){layer._setNode(this.backendNodeIdToNode().get(payload.owner_node)||null);}
if(!this.contentRoot()&&layer.drawsContent()){this.setContentRoot(layer);}
for(let i=0;payload.children&&i<payload.children.length;++i){layer.addChild(this._innerSetLayers(oldLayersById,payload.children[i]));}
return layer;}
_extractNodeIdsToResolve(nodeIdsToResolve,seenNodeIds,payload){const backendNodeId=payload.owner_node;if(backendNodeId&&!this.backendNodeIdToNode().has(backendNodeId)){nodeIdsToResolve.add(backendNodeId);}
for(let i=0;payload.children&&i<payload.children.length;++i){this._extractNodeIdsToResolve(nodeIdsToResolve,seenNodeIds,payload.children[i]);}}}
export class TracingLayer{constructor(paintProfilerModel,payload){this._paintProfilerModel=paintProfilerModel;this._reset(payload);}
_reset(payload){this._node=null;this._layerId=String(payload.layer_id);this._offsetX=payload.position[0];this._offsetY=payload.position[1];this._width=payload.bounds.width;this._height=payload.bounds.height;this._children=[];this._parentLayerId=null;this._parent=null;this._quad=payload.layer_quad||[];this._createScrollRects(payload);this._compositingReasonIds=payload.compositing_reason_ids||(payload.debug_info&&payload.debug_info.compositing_reason_ids)||[];this._drawsContent=!!payload.draws_content;this._gpuMemoryUsage=payload.gpu_memory_usage;this._paints=[];}
id(){return this._layerId;}
parentId(){return this._parentLayerId;}
parent(){return this._parent;}
isRoot(){return!this.parentId();}
children(){return this._children;}
addChild(childParam){const child=(childParam);if(child._parent){console.assert(false,'Child already has a parent');}
this._children.push(child);child._parent=this;child._parentLayerId=this._layerId;}
_setNode(node){this._node=node;}
node(){return this._node;}
nodeForSelfOrAncestor(){for(let layer=this;layer;layer=layer._parent){if(layer._node){return layer._node;}}
return null;}
offsetX(){return this._offsetX;}
offsetY(){return this._offsetY;}
width(){return this._width;}
height(){return this._height;}
transform(){return null;}
quad(){return this._quad;}
anchorPoint(){return[0.5,0.5,0];}
invisible(){return false;}
paintCount(){return 0;}
lastPaintRect(){return null;}
scrollRects(){return this._scrollRects;}
stickyPositionConstraint(){return null;}
gpuMemoryUsage(){return this._gpuMemoryUsage;}
snapshots(){return this._paints.map(paint=>paint.snapshotPromise().then(snapshot=>{if(!snapshot){return null;}
const rect={x:snapshot.rect[0],y:snapshot.rect[1],width:snapshot.rect[2],height:snapshot.rect[3]};return{rect:rect,snapshot:snapshot.snapshot};}));}
_pictureForRect(targetRect){return Promise.all(this._paints.map(paint=>paint.picturePromise())).then(pictures=>{const fragments=pictures.filter(picture=>picture&&rectsOverlap(picture.rect,targetRect)).map(picture=>({x:picture.rect[0],y:picture.rect[1],picture:picture.serializedPicture}));if(!fragments.length||!this._paintProfilerModel){return null;}
const x0=fragments.reduce((min,item)=>Math.min(min,item.x),Infinity);const y0=fragments.reduce((min,item)=>Math.min(min,item.y),Infinity);const rect={x:targetRect[0]-x0,y:targetRect[1]-y0,width:targetRect[2],height:targetRect[3]};return this._paintProfilerModel.loadSnapshotFromFragments(fragments).then(snapshot=>snapshot?{rect:rect,snapshot:snapshot}:null);});function segmentsOverlap(a1,a2,b1,b2){console.assert(a1<=a2&&b1<=b2,'segments should be specified as ordered pairs');return a2>b1&&a1<b2;}
function rectsOverlap(a,b){return segmentsOverlap(a[0],a[0]+a[2],b[0],b[0]+b[2])&&segmentsOverlap(a[1],a[1]+a[3],b[1],b[1]+b[3]);}}
_scrollRectsFromParams(params,type){return{rect:{x:params[0],y:params[1],width:params[2],height:params[3]},type:type};}
_createScrollRects(payload){this._scrollRects=[];if(payload.non_fast_scrollable_region){this._scrollRects.push(this._scrollRectsFromParams(payload.non_fast_scrollable_region,SDK.LayerTreeBase.Layer.ScrollRectType.NonFastScrollable.name));}
if(payload.touch_event_handler_region){this._scrollRects.push(this._scrollRectsFromParams(payload.touch_event_handler_region,SDK.LayerTreeBase.Layer.ScrollRectType.TouchEventHandler.name));}
if(payload.wheel_event_handler_region){this._scrollRects.push(this._scrollRectsFromParams(payload.wheel_event_handler_region,SDK.LayerTreeBase.Layer.ScrollRectType.WheelEventHandler.name));}
if(payload.scroll_event_handler_region){this._scrollRects.push(this._scrollRectsFromParams(payload.scroll_event_handler_region,SDK.LayerTreeBase.Layer.ScrollRectType.RepaintsOnScroll.name));}}
_addPaintEvent(paint){this._paints.push(paint);}
requestCompositingReasonIds(){return Promise.resolve(this._compositingReasonIds);}
drawsContent(){return this._drawsContent;}}
export let TracingLayerPayload;export let TracingLayerTile;