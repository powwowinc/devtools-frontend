import*as Common from'../common/common.js';import*as DataGrid from'../data_grid/data_grid.js';import*as Host from'../host/host.js';import*as SDK from'../sdk/sdk.js';import*as SourceFrame from'../source_frame/source_frame.js';import*as UI from'../ui/ui.js';import{BinaryResourceView}from'./BinaryResourceView.js';export class ResourceWebSocketFrameView extends UI.Widget.VBox{constructor(request){super();this.registerRequiredCSS('network/webSocketFrameView.css');this.element.classList.add('websocket-frame-view');this._request=request;this._splitWidget=new UI.SplitWidget.SplitWidget(false,true,'resourceWebSocketFrameSplitViewState');this._splitWidget.show(this.element);const columns=([{id:'data',title:Common.UIString.UIString('Data'),sortable:false,weight:88},{id:'length',title:Common.UIString.UIString('Length'),sortable:false,align:DataGrid.DataGrid.Align.Right,weight:5},{id:'time',title:Common.UIString.UIString('Time'),sortable:true,weight:7}]);this._dataGrid=new DataGrid.SortableDataGrid.SortableDataGrid({displayName:ls`Web Socket Frame`,columns});this._dataGrid.setRowContextMenuCallback(onRowContextMenu.bind(this));this._dataGrid.setStickToBottom(true);this._dataGrid.setCellClass('websocket-frame-view-td');this._timeComparator=(ResourceWebSocketFrameNodeTimeComparator);this._dataGrid.sortNodes(this._timeComparator,false);this._dataGrid.markColumnAsSortedBy('time',DataGrid.DataGrid.Order.Ascending);this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged,this._sortItems,this);this._dataGrid.setName('ResourceWebSocketFrameView');this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,event=>{this._onFrameSelected(event);},this);this._dataGrid.addEventListener(DataGrid.DataGrid.Events.DeselectedNode,this._onFrameDeselected,this);this._mainToolbar=new UI.Toolbar.Toolbar('');this._clearAllButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Clear All'),'largeicon-clear');this._clearAllButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._clearFrames,this);this._mainToolbar.appendToolbarItem(this._clearAllButton);this._filterTypeCombobox=new UI.Toolbar.ToolbarComboBox(this._updateFilterSetting.bind(this),ls`Filter`);for(const filterItem of _filterTypes){const option=this._filterTypeCombobox.createOption(filterItem.label,filterItem.name);this._filterTypeCombobox.addOption(option);}
this._mainToolbar.appendToolbarItem(this._filterTypeCombobox);this._filterType=null;const placeholder='Enter regex, for example: (web)?socket';this._filterTextInput=new UI.Toolbar.ToolbarInput(Common.UIString.UIString(placeholder),'',0.4);this._filterTextInput.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged,this._updateFilterSetting,this);this._mainToolbar.appendToolbarItem(this._filterTextInput);this._filterRegex=null;const mainContainer=new UI.Widget.VBox();mainContainer.element.appendChild(this._mainToolbar.element);this._dataGrid.asWidget().show(mainContainer.element);mainContainer.setMinimumSize(0,72);this._splitWidget.setMainWidget(mainContainer);this._frameEmptyWidget=new UI.EmptyWidget.EmptyWidget(Common.UIString.UIString('Select message to browse its content.'));this._splitWidget.setSidebarWidget(this._frameEmptyWidget);this._selectedNode=null;function onRowContextMenu(contextMenu,genericNode){const node=(genericNode);const binaryView=node.binaryView();if(binaryView){binaryView.addCopyToContextMenu(contextMenu,ls`Copy message...`);}else{contextMenu.clipboardSection().appendItem(Common.UIString.UIString('Copy message'),Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText.bind(Host.InspectorFrontendHost.InspectorFrontendHostInstance,node.data.data));}
contextMenu.footerSection().appendItem(Common.UIString.UIString('Clear all'),this._clearFrames.bind(this));}}
static opCodeDescription(opCode,mask){const localizedDescription=opCodeDescriptions[opCode]||'';if(mask){return ls`${localizedDescription} (Opcode ${opCode}, mask)`;}
return ls`${localizedDescription} (Opcode ${opCode})`;}
wasShown(){this.refresh();this._request.addEventListener(SDK.NetworkRequest.Events.WebsocketFrameAdded,this._frameAdded,this);}
willHide(){this._request.removeEventListener(SDK.NetworkRequest.Events.WebsocketFrameAdded,this._frameAdded,this);}
_frameAdded(event){const frame=(event.data);if(!this._frameFilter(frame)){return;}
this._dataGrid.insertChild(new ResourceWebSocketFrameNode(this._request.url(),frame));}
_frameFilter(frame){if(this._filterType&&frame.type!==this._filterType){return false;}
return!this._filterRegex||this._filterRegex.test(frame.text);}
_clearFrames(){this._request[_clearFrameOffsetSymbol]=this._request.frames().length;this.refresh();}
_updateFilterSetting(){const text=this._filterTextInput.value();const type=this._filterTypeCombobox.selectedOption().value;this._filterRegex=text?new RegExp(text,'i'):null;this._filterType=type==='all'?null:type;this.refresh();}
async _onFrameSelected(event){this._currentSelectedNode=(event.data);const content=this._currentSelectedNode.dataText();const binaryView=this._currentSelectedNode.binaryView();if(binaryView){this._splitWidget.setSidebarWidget(binaryView);return;}
const jsonView=await SourceFrame.JSONView.JSONView.createView(content);if(jsonView){this._splitWidget.setSidebarWidget(jsonView);return;}
this._splitWidget.setSidebarWidget(new SourceFrame.ResourceSourceFrame.ResourceSourceFrame(Common.StaticContentProvider.StaticContentProvider.fromString(this._request.url(),Common.ResourceType.resourceTypes.WebSocket,content)));}
_onFrameDeselected(event){this._currentSelectedNode=null;this._splitWidget.setSidebarWidget(this._frameEmptyWidget);}
refresh(){this._dataGrid.rootNode().removeChildren();const url=this._request.url();let frames=this._request.frames();const offset=this._request[_clearFrameOffsetSymbol]||0;frames=frames.slice(offset);frames=frames.filter(this._frameFilter.bind(this));frames.forEach(frame=>this._dataGrid.insertChild(new ResourceWebSocketFrameNode(url,frame)));}
_sortItems(){this._dataGrid.sortNodes(this._timeComparator,!this._dataGrid.isSortOrderAscending());}}
export const OpCodes={ContinuationFrame:0,TextFrame:1,BinaryFrame:2,ConnectionCloseFrame:8,PingFrame:9,PongFrame:10};export const opCodeDescriptions=(function(){const opCodes=OpCodes;const map=[];map[opCodes.ContinuationFrame]=ls`Continuation Frame`;map[opCodes.TextFrame]=ls`Text Message`;map[opCodes.BinaryFrame]=ls`Binary Message`;map[opCodes.ContinuationFrame]=ls`Connection Close Message`;map[opCodes.PingFrame]=ls`Ping Message`;map[opCodes.PongFrame]=ls`Pong Message`;return map;})();export const _filterTypes=[{name:'all',label:Common.UIString.UIString('All')},{name:'send',label:Common.UIString.UIString('Send')},{name:'receive',label:Common.UIString.UIString('Receive')},];export class ResourceWebSocketFrameNode extends DataGrid.SortableDataGrid.SortableDataGridNode{constructor(url,frame){let length=frame.text.length;const time=new Date(frame.time*1000);const timeText=('0'+time.getHours()).substr(-2)+':'+('0'+time.getMinutes()).substr(-2)+':'+
('0'+time.getSeconds()).substr(-2)+'.'+('00'+time.getMilliseconds()).substr(-3);const timeNode=createElement('div');timeNode.createTextChild(timeText);timeNode.title=time.toLocaleString();let dataText=frame.text;let description=ResourceWebSocketFrameView.opCodeDescription(frame.opCode,frame.mask);const isTextFrame=frame.opCode===OpCodes.TextFrame;if(frame.type===SDK.NetworkRequest.WebSocketFrameType.Error){description=dataText;length=ls`N/A`;}else if(isTextFrame){description=dataText;}else if(frame.opCode===OpCodes.BinaryFrame){length=Number.bytesToString(base64ToSize(frame.text));description=opCodeDescriptions[frame.opCode];}else{dataText=description;}
super({data:description,length:length,time:timeNode});this._url=url;this._frame=frame;this._isTextFrame=isTextFrame;this._dataText=dataText;}
createCells(element){element.classList.toggle('websocket-frame-view-row-error',this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Error);element.classList.toggle('websocket-frame-view-row-send',this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Send);element.classList.toggle('websocket-frame-view-row-receive',this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Receive);super.createCells(element);}
nodeSelfHeight(){return 21;}
dataText(){return this._dataText;}
opCode(){return(this._frame.opCode);}
binaryView(){if(this._isTextFrame||this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Error){return null;}
if(!this._binaryView){this._binaryView=new BinaryResourceView(this._dataText,'',Common.ResourceType.resourceTypes.WebSocket);}
return this._binaryView;}}
export function ResourceWebSocketFrameNodeTimeComparator(a,b){return a._frame.time-b._frame.time;}
export const _clearFrameOffsetSymbol=Symbol('ClearFrameOffset');