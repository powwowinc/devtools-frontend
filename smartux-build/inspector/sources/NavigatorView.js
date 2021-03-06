import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as Persistence from'../persistence/persistence.js';import*as Platform from'../platform/platform.js';import*as SDK from'../sdk/sdk.js';import*as Snippets from'../snippets/snippets.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{SearchSourcesView}from'./SearchSourcesView.js';export class NavigatorView extends UI.Widget.VBox{constructor(){super(true);this.registerRequiredCSS('sources/navigatorView.css');this._placeholder=null;this._scriptsTree=new UI.TreeOutline.TreeOutlineInShadow();this._scriptsTree.registerRequiredCSS('sources/navigatorTree.css');this._scriptsTree.setComparator(NavigatorView._treeElementsCompare);this.contentElement.appendChild(this._scriptsTree.element);this.setDefaultFocusedElement(this._scriptsTree.element);this._uiSourceCodeNodes=new Platform.Multimap();this._subfolderNodes=new Map();this._rootNode=new NavigatorRootTreeNode(this);this._rootNode.populate();this._frameNodes=new Map();this.contentElement.addEventListener('contextmenu',this.handleContextMenu.bind(this),false);self.UI.shortcutRegistry.addShortcutListener(this.contentElement,'sources.rename',this._renameShortcut.bind(this),true);this._navigatorGroupByFolderSetting=self.Common.settings.moduleSetting('navigatorGroupByFolder');this._navigatorGroupByFolderSetting.addChangeListener(this._groupingChanged.bind(this));this._initGrouping();self.Persistence.persistence.addEventListener(Persistence.Persistence.Events.BindingCreated,this._onBindingChanged,this);self.Persistence.persistence.addEventListener(Persistence.Persistence.Events.BindingRemoved,this._onBindingChanged,this);self.SDK.targetManager.addEventListener(SDK.SDKModel.Events.NameChanged,this._targetNameChanged,this);self.SDK.targetManager.observeTargets(this);this._resetWorkspace(self.Workspace.workspace);this._workspace.uiSourceCodes().forEach(this._addUISourceCode.bind(this));self.Bindings.networkProjectManager.addEventListener(Bindings.NetworkProject.Events.FrameAttributionAdded,this._frameAttributionAdded,this);self.Bindings.networkProjectManager.addEventListener(Bindings.NetworkProject.Events.FrameAttributionRemoved,this._frameAttributionRemoved,this);}
static _treeElementOrder(treeElement){if(treeElement._boostOrder){return 0;}
if(!NavigatorView._typeOrders){const weights={};const types=Types;weights[types.Root]=1;weights[types.Domain]=10;weights[types.FileSystemFolder]=1;weights[types.NetworkFolder]=1;weights[types.SourceMapFolder]=2;weights[types.File]=10;weights[types.Frame]=70;weights[types.Worker]=90;weights[types.FileSystem]=100;NavigatorView._typeOrders=weights;}
let order=NavigatorView._typeOrders[treeElement._nodeType];if(treeElement._uiSourceCode){const contentType=treeElement._uiSourceCode.contentType();if(contentType.isDocument()){order+=3;}else if(contentType.isScript()){order+=5;}else if(contentType.isStyleSheet()){order+=10;}else{order+=15;}}
return order;}
static appendSearchItem(contextMenu,path){function searchPath(){SearchSourcesView.openSearch(`file:${path.trim()}`);}
let searchLabel=Common.UIString.UIString('Search in folder');if(!path||!path.trim()){path='*';searchLabel=Common.UIString.UIString('Search in all files');}
contextMenu.viewSection().appendItem(searchLabel,searchPath);}
static _treeElementsCompare(treeElement1,treeElement2){const typeWeight1=NavigatorView._treeElementOrder(treeElement1);const typeWeight2=NavigatorView._treeElementOrder(treeElement2);if(typeWeight1>typeWeight2){return 1;}
if(typeWeight1<typeWeight2){return-1;}
return treeElement1.titleAsText().compareTo(treeElement2.titleAsText());}
setPlaceholder(placeholder){console.assert(!this._placeholder,'A placeholder widget was already set');this._placeholder=placeholder;placeholder.show(this.contentElement,this.contentElement.firstChild);updateVisibility.call(this);this._scriptsTree.addEventListener(UI.TreeOutline.Events.ElementAttached,updateVisibility.bind(this));this._scriptsTree.addEventListener(UI.TreeOutline.Events.ElementsDetached,updateVisibility.bind(this));function updateVisibility(){const showTree=this._scriptsTree.firstChild();if(showTree){placeholder.hideWidget();}else{placeholder.showWidget();}
this._scriptsTree.element.classList.toggle('hidden',!showTree);}}
_onBindingChanged(event){const binding=(event.data);const networkNodes=this._uiSourceCodeNodes.get(binding.network);for(const networkNode of networkNodes){networkNode.updateTitle();}
const fileSystemNodes=this._uiSourceCodeNodes.get(binding.fileSystem);for(const fileSystemNode of fileSystemNodes){fileSystemNode.updateTitle();}
const pathTokens=Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.relativePath(binding.fileSystem);let folderPath='';for(let i=0;i<pathTokens.length-1;++i){folderPath+=pathTokens[i];const folderId=this._folderNodeId(binding.fileSystem.project(),null,null,binding.fileSystem.origin(),folderPath);const folderNode=this._subfolderNodes.get(folderId);if(folderNode){folderNode.updateTitle();}
folderPath+='/';}
const fileSystemRoot=this._rootNode.child(binding.fileSystem.project().id());if(fileSystemRoot){fileSystemRoot.updateTitle();}}
focus(){this._scriptsTree.focus();}
_resetWorkspace(workspace){this._workspace=workspace;this._workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded,this._uiSourceCodeAdded,this);this._workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeRemoved,this._uiSourceCodeRemoved,this);this._workspace.addEventListener(Workspace.Workspace.Events.ProjectAdded,event=>{const project=(event.data);this._projectAdded(project);if(project.type()===Workspace.Workspace.projectTypes.FileSystem){this._computeUniqueFileSystemProjectNames();}});this._workspace.addEventListener(Workspace.Workspace.Events.ProjectRemoved,event=>{const project=(event.data);this._removeProject(project);if(project.type()===Workspace.Workspace.projectTypes.FileSystem){this._computeUniqueFileSystemProjectNames();}});this._workspace.projects().forEach(this._projectAdded.bind(this));this._computeUniqueFileSystemProjectNames();}
workspace(){return this._workspace;}
acceptProject(project){return!project.isServiceProject();}
_frameAttributionAdded(event){const uiSourceCode=(event.data.uiSourceCode);if(!this._acceptsUISourceCode(uiSourceCode)){return;}
const addedFrame=(event.data.frame);this._addUISourceCodeNode(uiSourceCode,addedFrame);}
_frameAttributionRemoved(event){const uiSourceCode=(event.data.uiSourceCode);if(!this._acceptsUISourceCode(uiSourceCode)){return;}
const removedFrame=(event.data.frame);const node=Array.from(this._uiSourceCodeNodes.get(uiSourceCode)).find(node=>node.frame()===removedFrame);this._removeUISourceCodeNode(node);}
_acceptsUISourceCode(uiSourceCode){return this.acceptProject(uiSourceCode.project());}
_addUISourceCode(uiSourceCode){if(!this._acceptsUISourceCode(uiSourceCode)){return;}
const frames=Bindings.NetworkProject.NetworkProject.framesForUISourceCode(uiSourceCode);if(frames.length){for(const frame of frames){this._addUISourceCodeNode(uiSourceCode,frame);}}else{this._addUISourceCodeNode(uiSourceCode,null);}
this.uiSourceCodeAdded(uiSourceCode);}
_addUISourceCodeNode(uiSourceCode,frame){const isFromSourceMap=uiSourceCode.contentType().isFromSourceMap();let path;if(uiSourceCode.project().type()===Workspace.Workspace.projectTypes.FileSystem){path=Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.relativePath(uiSourceCode).slice(0,-1);}else{path=Common.ParsedURL.ParsedURL.extractPath(uiSourceCode.url()).split('/').slice(1,-1);}
const project=uiSourceCode.project();const target=Bindings.NetworkProject.NetworkProject.targetForUISourceCode(uiSourceCode);const folderNode=this._folderNode(uiSourceCode,project,target,frame,uiSourceCode.origin(),path,isFromSourceMap);const uiSourceCodeNode=new NavigatorUISourceCodeTreeNode(this,uiSourceCode,frame);folderNode.appendChild(uiSourceCodeNode);this._uiSourceCodeNodes.set(uiSourceCode,uiSourceCodeNode);this._selectDefaultTreeNode();}
uiSourceCodeAdded(uiSourceCode){}
_uiSourceCodeAdded(event){const uiSourceCode=(event.data);this._addUISourceCode(uiSourceCode);}
_uiSourceCodeRemoved(event){const uiSourceCode=(event.data);this._removeUISourceCode(uiSourceCode);}
tryAddProject(project){this._projectAdded(project);project.uiSourceCodes().forEach(this._addUISourceCode.bind(this));}
_projectAdded(project){if(!this.acceptProject(project)||project.type()!==Workspace.Workspace.projectTypes.FileSystem||Snippets.ScriptSnippetFileSystem.isSnippetsProject(project)||this._rootNode.child(project.id())){return;}
this._rootNode.appendChild(new NavigatorGroupTreeNode(this,project,project.id(),Types.FileSystem,project.displayName()));this._selectDefaultTreeNode();}
_selectDefaultTreeNode(){const children=this._rootNode.children();if(children.length&&!this._scriptsTree.selectedTreeElement){children[0].treeNode().select(true,false);}}
_computeUniqueFileSystemProjectNames(){const fileSystemProjects=this._workspace.projectsForType(Workspace.Workspace.projectTypes.FileSystem);if(!fileSystemProjects.length){return;}
const encoder=new Persistence.Persistence.PathEncoder();const reversedPaths=fileSystemProjects.map(project=>{const fileSystem=(project);return Platform.StringUtilities.reverse(encoder.encode(fileSystem.fileSystemPath()));});const reversedIndex=new Common.Trie.Trie();for(const reversedPath of reversedPaths){reversedIndex.add(reversedPath);}
for(let i=0;i<fileSystemProjects.length;++i){const reversedPath=reversedPaths[i];const project=fileSystemProjects[i];reversedIndex.remove(reversedPath);const commonPrefix=reversedIndex.longestPrefix(reversedPath,false);reversedIndex.add(reversedPath);const prefixPath=reversedPath.substring(0,commonPrefix.length+1);const path=encoder.decode(Platform.StringUtilities.reverse(prefixPath));const fileSystemNode=this._rootNode.child(project.id());if(fileSystemNode){fileSystemNode.setTitle(path);}}}
_removeProject(project){const uiSourceCodes=project.uiSourceCodes();for(let i=0;i<uiSourceCodes.length;++i){this._removeUISourceCode(uiSourceCodes[i]);}
if(project.type()!==Workspace.Workspace.projectTypes.FileSystem){return;}
const fileSystemNode=this._rootNode.child(project.id());if(!fileSystemNode){return;}
this._rootNode.removeChild(fileSystemNode);}
_folderNodeId(project,target,frame,projectOrigin,path){const targetId=target?target.id():'';const projectId=project.type()===Workspace.Workspace.projectTypes.FileSystem?project.id():'';const frameId=this._groupByFrame&&frame?frame.id:'';return targetId+':'+projectId+':'+frameId+':'+projectOrigin+':'+path;}
_folderNode(uiSourceCode,project,target,frame,projectOrigin,path,fromSourceMap){if(Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(uiSourceCode)){return this._rootNode;}
if(target&&!this._groupByFolder&&!fromSourceMap){return this._domainNode(uiSourceCode,project,target,frame,projectOrigin);}
const folderPath=path.join('/');const folderId=this._folderNodeId(project,target,frame,projectOrigin,folderPath);let folderNode=this._subfolderNodes.get(folderId);if(folderNode){return folderNode;}
if(!path.length){if(target){return this._domainNode(uiSourceCode,project,target,frame,projectOrigin);}
return(this._rootNode.child(project.id()));}
const parentNode=this._folderNode(uiSourceCode,project,target,frame,projectOrigin,path.slice(0,-1),fromSourceMap);let type=fromSourceMap?Types.SourceMapFolder:Types.NetworkFolder;if(project.type()===Workspace.Workspace.projectTypes.FileSystem){type=Types.FileSystemFolder;}
const name=path[path.length-1];folderNode=new NavigatorFolderTreeNode(this,project,folderId,type,folderPath,name);this._subfolderNodes.set(folderId,folderNode);parentNode.appendChild(folderNode);return folderNode;}
_domainNode(uiSourceCode,project,target,frame,projectOrigin){const frameNode=this._frameNode(project,target,frame);if(!this._groupByDomain){return frameNode;}
let domainNode=frameNode.child(projectOrigin);if(domainNode){return domainNode;}
domainNode=new NavigatorGroupTreeNode(this,project,projectOrigin,Types.Domain,this._computeProjectDisplayName(target,projectOrigin));if(frame&&projectOrigin===Common.ParsedURL.ParsedURL.extractOrigin(frame.url)){domainNode.treeNode()._boostOrder=true;}
frameNode.appendChild(domainNode);return domainNode;}
_frameNode(project,target,frame){if(!this._groupByFrame||!frame){return this._targetNode(project,target);}
let frameNode=this._frameNodes.get(frame);if(frameNode){return frameNode;}
frameNode=new NavigatorGroupTreeNode(this,project,target.id()+':'+frame.id,Types.Frame,frame.displayName());frameNode.setHoverCallback(hoverCallback);this._frameNodes.set(frame,frameNode);const parentFrame=frame.parentFrame||frame.crossTargetParentFrame();this._frameNode(project,parentFrame?parentFrame.resourceTreeModel().target():target,parentFrame).appendChild(frameNode);if(!parentFrame){frameNode.treeNode()._boostOrder=true;frameNode.treeNode().expand();}
function hoverCallback(hovered){if(hovered){const overlayModel=target.model(SDK.OverlayModel.OverlayModel);if(overlayModel){overlayModel.highlightFrame(frame.id);}}else{SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();}}
return frameNode;}
_targetNode(project,target){if(target===self.SDK.targetManager.mainTarget()){return this._rootNode;}
let targetNode=this._rootNode.child('target:'+target.id());if(!targetNode){targetNode=new NavigatorGroupTreeNode(this,project,'target:'+target.id(),target.type()===SDK.SDKModel.Type.Frame?Types.Frame:Types.Worker,target.name());this._rootNode.appendChild(targetNode);}
return targetNode;}
_computeProjectDisplayName(target,projectOrigin){const runtimeModel=target.model(SDK.RuntimeModel.RuntimeModel);const executionContexts=runtimeModel?runtimeModel.executionContexts():[];for(const context of executionContexts){if(context.name&&context.origin&&projectOrigin.startsWith(context.origin)){return context.name;}}
if(!projectOrigin){return Common.UIString.UIString('(no domain)');}
const parsedURL=new Common.ParsedURL.ParsedURL(projectOrigin);const prettyURL=parsedURL.isValid?parsedURL.host+(parsedURL.port?(':'+parsedURL.port):''):'';return(prettyURL||projectOrigin);}
revealUISourceCode(uiSourceCode,select){const nodes=this._uiSourceCodeNodes.get(uiSourceCode);const node=nodes.firstValue();if(!node){return null;}
if(this._scriptsTree.selectedTreeElement){this._scriptsTree.selectedTreeElement.deselect();}
this._lastSelectedUISourceCode=uiSourceCode;node.reveal(select);return node;}
_sourceSelected(uiSourceCode,focusSource){this._lastSelectedUISourceCode=uiSourceCode;Common.Revealer.reveal(uiSourceCode,!focusSource);}
_removeUISourceCode(uiSourceCode){const nodes=this._uiSourceCodeNodes.get(uiSourceCode);for(const node of nodes){this._removeUISourceCodeNode(node);}}
_removeUISourceCodeNode(node){const uiSourceCode=node.uiSourceCode();this._uiSourceCodeNodes.delete(uiSourceCode,node);const project=uiSourceCode.project();const target=Bindings.NetworkProject.NetworkProject.targetForUISourceCode(uiSourceCode);const frame=node.frame();let parentNode=node.parent;parentNode.removeChild(node);node=parentNode;while(node){parentNode=node.parent;if(!parentNode||!node.isEmpty()){break;}
if(parentNode===this._rootNode&&project.type()===Workspace.Workspace.projectTypes.FileSystem){break;}
if(!(node instanceof NavigatorGroupTreeNode||node instanceof NavigatorFolderTreeNode)){break;}
if(node._type===Types.Frame){this._discardFrame((frame));break;}
const folderId=this._folderNodeId(project,target,frame,uiSourceCode.origin(),node._folderPath);this._subfolderNodes.delete(folderId);parentNode.removeChild(node);node=parentNode;}}
reset(){for(const node of this._uiSourceCodeNodes.valuesArray()){node.dispose();}
this._scriptsTree.removeChildren();this._uiSourceCodeNodes.clear();this._subfolderNodes.clear();this._frameNodes.clear();this._rootNode.reset();}
handleContextMenu(event){}
_renameShortcut(){const node=this._scriptsTree.selectedTreeElement&&this._scriptsTree.selectedTreeElement._node;if(!node||!node._uiSourceCode||!node._uiSourceCode.canRename()){return false;}
this.rename(node,false);return true;}
_handleContextMenuCreate(project,path,uiSourceCode){if(uiSourceCode){const relativePath=Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.relativePath(uiSourceCode);relativePath.pop();path=relativePath.join('/');}
this.create(project,path,uiSourceCode);}
_handleContextMenuRename(node){this.rename(node,false);}
_handleContextMenuExclude(project,path){const shouldExclude=window.confirm(Common.UIString.UIString('Are you sure you want to exclude this folder?'));if(shouldExclude){UI.UIUtils.startBatchUpdate();project.excludeFolder(Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.completeURL(project,path));UI.UIUtils.endBatchUpdate();}}
_handleContextMenuDelete(uiSourceCode){const shouldDelete=window.confirm(Common.UIString.UIString('Are you sure you want to delete this file?'));if(shouldDelete){uiSourceCode.project().deleteFile(uiSourceCode);}}
handleFileContextMenu(event,node){const uiSourceCode=node.uiSourceCode();const contextMenu=new UI.ContextMenu.ContextMenu(event);contextMenu.appendApplicableItems(uiSourceCode);const project=uiSourceCode.project();if(project.type()===Workspace.Workspace.projectTypes.FileSystem){contextMenu.editSection().appendItem(Common.UIString.UIString('Rename…'),this._handleContextMenuRename.bind(this,node));contextMenu.editSection().appendItem(Common.UIString.UIString('Make a copy…'),this._handleContextMenuCreate.bind(this,project,'',uiSourceCode));contextMenu.editSection().appendItem(Common.UIString.UIString('Delete'),this._handleContextMenuDelete.bind(this,uiSourceCode));}
contextMenu.show();}
_handleDeleteOverrides(node){const shouldRemove=window.confirm(ls`Are you sure you want to delete all overrides contained in this folder?`);if(shouldRemove){this._handleDeleteOverridesHelper(node);}}
_handleDeleteOverridesHelper(node){node._children.forEach(child=>{this._handleDeleteOverridesHelper(child);});if(node instanceof NavigatorUISourceCodeTreeNode){node.uiSourceCode().project().deleteFile(node.uiSourceCode());}}
handleFolderContextMenu(event,node){const path=node._folderPath||'';const project=node._project;const contextMenu=new UI.ContextMenu.ContextMenu(event);if(project.type()===Workspace.Workspace.projectTypes.FileSystem){NavigatorView.appendSearchItem(contextMenu,path);const folderPath=Common.ParsedURL.ParsedURL.urlToPlatformPath(Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.completeURL(project,path),Host.Platform.isWin());contextMenu.revealSection().appendItem(Common.UIString.UIString('Open folder'),()=>Host.InspectorFrontendHost.InspectorFrontendHostInstance.showItemInFolder(folderPath));if(project.canCreateFile()){contextMenu.defaultSection().appendItem(Common.UIString.UIString('New file'),this._handleContextMenuCreate.bind(this,project,path));}}
if(project.canExcludeFolder(path)){contextMenu.defaultSection().appendItem(Common.UIString.UIString('Exclude folder'),this._handleContextMenuExclude.bind(this,project,path));}
function removeFolder(){const shouldRemove=window.confirm(Common.UIString.UIString('Are you sure you want to remove this folder?'));if(shouldRemove){project.remove();}}
if(project.type()===Workspace.Workspace.projectTypes.FileSystem){contextMenu.defaultSection().appendAction('sources.add-folder-to-workspace',undefined,true);if(node instanceof NavigatorGroupTreeNode){contextMenu.defaultSection().appendItem(Common.UIString.UIString('Remove folder from workspace'),removeFolder);}
if(project._fileSystem._type==='overrides'){contextMenu.defaultSection().appendItem(ls`Delete all overrides`,this._handleDeleteOverrides.bind(this,node));}}
contextMenu.show();}
rename(node,creatingNewUISourceCode){const uiSourceCode=node.uiSourceCode();node.rename(callback.bind(this));function callback(committed){if(!creatingNewUISourceCode){return;}
if(!committed){uiSourceCode.remove();}else if(node._treeElement.listItemElement.hasFocus()){this._sourceSelected(uiSourceCode,true);}}}
async create(project,path,uiSourceCodeToCopy){let content='';if(uiSourceCodeToCopy){content=(await uiSourceCodeToCopy.requestContent()).content||'';}
const uiSourceCode=await project.createFile(path,null,content);if(!uiSourceCode){return;}
this._sourceSelected(uiSourceCode,false);const node=this.revealUISourceCode(uiSourceCode,true);if(node){this.rename(node,true);}}
_groupingChanged(){this.reset();this._initGrouping();this._workspace.uiSourceCodes().forEach(this._addUISourceCode.bind(this));}
_initGrouping(){this._groupByFrame=true;this._groupByDomain=this._navigatorGroupByFolderSetting.get();this._groupByFolder=this._groupByDomain;}
_resetForTest(){this.reset();this._workspace.uiSourceCodes().forEach(this._addUISourceCode.bind(this));}
_discardFrame(frame){const node=this._frameNodes.get(frame);if(!node){return;}
if(node.parent){node.parent.removeChild(node);}
this._frameNodes.delete(frame);for(const child of frame.childFrames){this._discardFrame(child);}}
targetAdded(target){}
targetRemoved(target){const targetNode=this._rootNode.child('target:'+target.id());if(targetNode){this._rootNode.removeChild(targetNode);}}
_targetNameChanged(event){const target=(event.data);const targetNode=this._rootNode.child('target:'+target.id());if(targetNode){targetNode.setTitle(target.name());}}}
export const Types={Domain:'domain',File:'file',FileSystem:'fs',FileSystemFolder:'fs-folder',Frame:'frame',NetworkFolder:'nw-folder',Root:'root',SourceMapFolder:'sm-folder',Worker:'worker'};export class NavigatorFolderTreeElement extends UI.TreeOutline.TreeElement{constructor(navigatorView,type,title,hoverCallback){super('',true);this.listItemElement.classList.add('navigator-'+type+'-tree-item','navigator-folder-tree-item');UI.ARIAUtils.setAccessibleName(this.listItemElement,`${title}, ${type}`);this._nodeType=type;this.title=title;this.tooltip=title;this._navigatorView=navigatorView;this._hoverCallback=hoverCallback;let iconType='largeicon-navigator-folder';if(type===Types.Domain){iconType='largeicon-navigator-domain';}else if(type===Types.Frame){iconType='largeicon-navigator-frame';}else if(type===Types.Worker){iconType='largeicon-navigator-worker';}
this.setLeadingIcons([UI.Icon.Icon.create(iconType,'icon')]);}
async onpopulate(){this._node.populate();}
onattach(){this.collapse();this._node.onattach();this.listItemElement.addEventListener('contextmenu',this._handleContextMenuEvent.bind(this),false);this.listItemElement.addEventListener('mousemove',this._mouseMove.bind(this),false);this.listItemElement.addEventListener('mouseleave',this._mouseLeave.bind(this),false);}
setNode(node){this._node=node;const paths=[];while(node&&!node.isRoot()){paths.push(node._title);node=node.parent;}
paths.reverse();this.tooltip=paths.join('/');UI.ARIAUtils.setAccessibleName(this.listItemElement,`${this.title}, ${this._nodeType}`);}
_handleContextMenuEvent(event){if(!this._node){return;}
this.select();this._navigatorView.handleFolderContextMenu(event,this._node);}
_mouseMove(event){if(this._hovered||!this._hoverCallback){return;}
this._hovered=true;this._hoverCallback(true);}
_mouseLeave(event){if(!this._hoverCallback){return;}
this._hovered=false;this._hoverCallback(false);}}
export class NavigatorSourceTreeElement extends UI.TreeOutline.TreeElement{constructor(navigatorView,uiSourceCode,title,node){super('',false);this._nodeType=Types.File;this._node=node;this.title=title;this.listItemElement.classList.add('navigator-'+uiSourceCode.contentType().name()+'-tree-item','navigator-file-tree-item');this.tooltip=uiSourceCode.url();UI.ARIAUtils.setAccessibleName(this.listItemElement,`${uiSourceCode.name()}, ${this._nodeType}`);Common.EventTarget.fireEvent('source-tree-file-added',uiSourceCode.fullDisplayName());this._navigatorView=navigatorView;this._uiSourceCode=uiSourceCode;this.updateIcon();}
updateIcon(){const binding=self.Persistence.persistence.binding(this._uiSourceCode);if(binding){const container=createElementWithClass('span','icon-stack');let iconType='largeicon-navigator-file-sync';if(Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(binding.fileSystem)){iconType='largeicon-navigator-snippet';}
const icon=UI.Icon.Icon.create(iconType,'icon');const badge=UI.Icon.Icon.create('badge-navigator-file-sync','icon-badge');if(self.Persistence.networkPersistenceManager.project()===binding.fileSystem.project()){badge.style.filter='hue-rotate(160deg)';}
container.appendChild(icon);container.appendChild(badge);container.title=Persistence.PersistenceUtils.PersistenceUtils.tooltipForUISourceCode(this._uiSourceCode);this.setLeadingIcons([container]);}else{let iconType='largeicon-navigator-file';if(Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(this._uiSourceCode)){iconType='largeicon-navigator-snippet';}
const defaultIcon=UI.Icon.Icon.create(iconType,'icon');this.setLeadingIcons([defaultIcon]);}}
get uiSourceCode(){return this._uiSourceCode;}
onattach(){this.listItemElement.draggable=true;this.listItemElement.addEventListener('click',this._onclick.bind(this),false);this.listItemElement.addEventListener('contextmenu',this._handleContextMenuEvent.bind(this),false);this.listItemElement.addEventListener('dragstart',this._ondragstart.bind(this),false);}
_shouldRenameOnMouseDown(){if(!this._uiSourceCode.canRename()){return false;}
const isSelected=this===this.treeOutline.selectedTreeElement;return isSelected&&this.treeOutline.element.hasFocus()&&!UI.UIUtils.isBeingEdited(this.treeOutline.element);}
selectOnMouseDown(event){if(event.which!==1||!this._shouldRenameOnMouseDown()){super.selectOnMouseDown(event);return;}
setTimeout(rename.bind(this),300);function rename(){if(this._shouldRenameOnMouseDown()){this._navigatorView.rename(this._node,false);}}}
_ondragstart(event){event.dataTransfer.setData('text/plain',this._uiSourceCode.url());event.dataTransfer.effectAllowed='copy';}
onspace(){this._navigatorView._sourceSelected(this.uiSourceCode,true);return true;}
_onclick(event){this._navigatorView._sourceSelected(this.uiSourceCode,false);}
ondblclick(event){const middleClick=event.button===1;this._navigatorView._sourceSelected(this.uiSourceCode,!middleClick);return false;}
onenter(){this._navigatorView._sourceSelected(this.uiSourceCode,true);return true;}
ondelete(){return true;}
_handleContextMenuEvent(event){this.select();this._navigatorView.handleFileContextMenu(event,this._node);}}
export class NavigatorTreeNode{constructor(id,type){this.id=id;this._type=type;this._children=new Map();}
treeNode(){throw'Not implemented';}
dispose(){}
isRoot(){return false;}
hasChildren(){return true;}
onattach(){}
setTitle(title){throw'Not implemented';}
populate(){if(this.isPopulated()){return;}
if(this.parent){this.parent.populate();}
this._populated=true;this.wasPopulated();}
wasPopulated(){const children=this.children();for(let i=0;i<children.length;++i){this.treeNode().appendChild((children[i].treeNode()));}}
didAddChild(node){if(this.isPopulated()){this.treeNode().appendChild((node.treeNode()));}}
willRemoveChild(node){if(this.isPopulated()){this.treeNode().removeChild((node.treeNode()));}}
isPopulated(){return this._populated;}
isEmpty(){return!this._children.size;}
children(){return[...this._children.values()];}
child(id){return this._children.get(id)||null;}
appendChild(node){this._children.set(node.id,node);node.parent=this;this.didAddChild(node);}
removeChild(node){this.willRemoveChild(node);this._children.remove(node.id);delete node.parent;node.dispose();}
reset(){this._children.clear();}}
export class NavigatorRootTreeNode extends NavigatorTreeNode{constructor(navigatorView){super('',Types.Root);this._navigatorView=navigatorView;}
isRoot(){return true;}
treeNode(){return this._navigatorView._scriptsTree.rootElement();}}
export class NavigatorUISourceCodeTreeNode extends NavigatorTreeNode{constructor(navigatorView,uiSourceCode,frame){super(uiSourceCode.project().id()+':'+uiSourceCode.url(),Types.File);this._navigatorView=navigatorView;this._uiSourceCode=uiSourceCode;this._treeElement=null;this._eventListeners=[];this._frame=frame;}
frame(){return this._frame;}
uiSourceCode(){return this._uiSourceCode;}
treeNode(){if(this._treeElement){return this._treeElement;}
this._treeElement=new NavigatorSourceTreeElement(this._navigatorView,this._uiSourceCode,'',this);this.updateTitle();const updateTitleBound=this.updateTitle.bind(this,undefined);this._eventListeners=[this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.TitleChanged,updateTitleBound),this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged,updateTitleBound),this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted,updateTitleBound)];return this._treeElement;}
updateTitle(ignoreIsDirty){if(!this._treeElement){return;}
let titleText=this._uiSourceCode.displayName();if(!ignoreIsDirty&&this._uiSourceCode.isDirty()){titleText='*'+titleText;}
this._treeElement.title=titleText;this._treeElement.updateIcon();let tooltip=this._uiSourceCode.url();if(this._uiSourceCode.contentType().isFromSourceMap()){tooltip=Common.UIString.UIString('%s (from source map)',this._uiSourceCode.displayName());}
this._treeElement.tooltip=tooltip;}
hasChildren(){return false;}
dispose(){Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);}
reveal(select){this.parent.populate();this.parent.treeNode().expand();this._treeElement.reveal(true);if(select){this._treeElement.select(true);}}
rename(callback){if(!this._treeElement){return;}
this._treeElement.listItemElement.focus();const treeOutlineElement=this._treeElement.treeOutline.element;UI.UIUtils.markBeingEdited(treeOutlineElement,true);function commitHandler(element,newTitle,oldTitle){if(newTitle!==oldTitle){this._treeElement.title=newTitle;this._uiSourceCode.rename(newTitle).then(renameCallback.bind(this));return;}
afterEditing.call(this,true);}
function renameCallback(success){if(!success){UI.UIUtils.markBeingEdited(treeOutlineElement,false);this.updateTitle();this.rename(callback);return;}
afterEditing.call(this,true);}
function afterEditing(committed){UI.UIUtils.markBeingEdited(treeOutlineElement,false);this.updateTitle();if(callback){callback(committed);}}
this.updateTitle(true);this._treeElement.startEditingTitle(new UI.InplaceEditor.Config(commitHandler.bind(this),afterEditing.bind(this,false)));}}
export class NavigatorFolderTreeNode extends NavigatorTreeNode{constructor(navigatorView,project,id,type,folderPath,title){super(id,type);this._navigatorView=navigatorView;this._project=project;this._folderPath=folderPath;this._title=title;}
treeNode(){if(this._treeElement){return this._treeElement;}
this._treeElement=this._createTreeElement(this._title,this);this.updateTitle();return this._treeElement;}
updateTitle(){if(!this._treeElement||this._project.type()!==Workspace.Workspace.projectTypes.FileSystem){return;}
const absoluteFileSystemPath=Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemPath(this._project.id())+'/'+
this._folderPath;const hasMappedFiles=self.Persistence.persistence.filePathHasBindings(absoluteFileSystemPath);this._treeElement.listItemElement.classList.toggle('has-mapped-files',hasMappedFiles);}
_createTreeElement(title,node){if(this._project.type()!==Workspace.Workspace.projectTypes.FileSystem){try{title=decodeURI(title);}catch(e){}}
const treeElement=new NavigatorFolderTreeElement(this._navigatorView,this._type,title);treeElement.setNode(node);return treeElement;}
wasPopulated(){if(!this._treeElement||this._treeElement._node!==this){return;}
this._addChildrenRecursive();}
_addChildrenRecursive(){const children=this.children();for(let i=0;i<children.length;++i){const child=children[i];this.didAddChild(child);if(child instanceof NavigatorFolderTreeNode){child._addChildrenRecursive();}}}
_shouldMerge(node){return this._type!==Types.Domain&&node instanceof NavigatorFolderTreeNode;}
didAddChild(node){function titleForNode(node){return node._title;}
if(!this._treeElement){return;}
let children=this.children();if(children.length===1&&this._shouldMerge(node)){node._isMerged=true;this._treeElement.title=this._treeElement.title+'/'+node._title;node._treeElement=this._treeElement;this._treeElement.setNode(node);return;}
let oldNode;if(children.length===2){oldNode=children[0]!==node?children[0]:children[1];}
if(oldNode&&oldNode._isMerged){delete oldNode._isMerged;const mergedToNodes=[];mergedToNodes.push(this);let treeNode=this;while(treeNode._isMerged){treeNode=treeNode.parent;mergedToNodes.push(treeNode);}
mergedToNodes.reverse();const titleText=mergedToNodes.map(titleForNode).join('/');const nodes=[];treeNode=oldNode;do{nodes.push(treeNode);children=treeNode.children();treeNode=children.length===1?children[0]:null;}while(treeNode&&treeNode._isMerged);if(!this.isPopulated()){this._treeElement.title=titleText;this._treeElement.setNode(this);for(let i=0;i<nodes.length;++i){delete nodes[i]._treeElement;delete nodes[i]._isMerged;}
return;}
const oldTreeElement=this._treeElement;const treeElement=this._createTreeElement(titleText,this);for(let i=0;i<mergedToNodes.length;++i){mergedToNodes[i]._treeElement=treeElement;}
oldTreeElement.parent.appendChild(treeElement);oldTreeElement.setNode(nodes[nodes.length-1]);oldTreeElement.title=nodes.map(titleForNode).join('/');oldTreeElement.parent.removeChild(oldTreeElement);this._treeElement.appendChild(oldTreeElement);if(oldTreeElement.expanded){treeElement.expand();}}
if(this.isPopulated()){this._treeElement.appendChild(node.treeNode());}}
willRemoveChild(node){if(node._isMerged||!this.isPopulated()){return;}
this._treeElement.removeChild(node._treeElement);}}
export class NavigatorGroupTreeNode extends NavigatorTreeNode{constructor(navigatorView,project,id,type,title){super(id,type);this._project=project;this._navigatorView=navigatorView;this._title=title;this.populate();}
setHoverCallback(hoverCallback){this._hoverCallback=hoverCallback;}
treeNode(){if(this._treeElement){return this._treeElement;}
this._treeElement=new NavigatorFolderTreeElement(this._navigatorView,this._type,this._title,this._hoverCallback);this._treeElement.setNode(this);return this._treeElement;}
onattach(){this.updateTitle();}
updateTitle(){if(!this._treeElement||this._project.type()!==Workspace.Workspace.projectTypes.FileSystem){return;}
const fileSystemPath=Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemPath(this._project.id());const wasActive=this._treeElement.listItemElement.classList.contains('has-mapped-files');const isActive=self.Persistence.persistence.filePathHasBindings(fileSystemPath);if(wasActive===isActive){return;}
this._treeElement.listItemElement.classList.toggle('has-mapped-files',isActive);if(this._treeElement.childrenListElement.hasFocus()){return;}
if(isActive){this._treeElement.expand();}else{this._treeElement.collapse();}}
setTitle(title){this._title=title;if(this._treeElement){this._treeElement.title=this._title;}}}