import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as Extensions from'../extensions/extensions.js';import*as Host from'../host/host.js';import*as ObjectUI from'../object_ui/object_ui.js';import*as SDK from'../sdk/sdk.js';import*as Snippets from'../snippets/snippets.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{CallStackSidebarPane}from'./CallStackSidebarPane.js';import{DebuggerPausedMessage}from'./DebuggerPausedMessage.js';import{NavigatorView}from'./NavigatorView.js';import{Events,SourcesView}from'./SourcesView.js';import{ThreadsSidebarPane}from'./ThreadsSidebarPane.js';import{UISourceCodeFrame}from'./UISourceCodeFrame.js';export class SourcesPanel extends UI.Panel.Panel{constructor(){super('sources');SourcesPanel._instance=this;this.registerRequiredCSS('sources/sourcesPanel.css');new UI.DropTarget.DropTarget(this.element,[UI.DropTarget.Type.Folder],Common.UIString.UIString('Drop workspace folder here'),this._handleDrop.bind(this));this._workspace=self.Workspace.workspace;this._togglePauseAction=(self.UI.actionRegistry.action('debugger.toggle-pause'));this._stepOverAction=(self.UI.actionRegistry.action('debugger.step-over'));this._stepIntoAction=(self.UI.actionRegistry.action('debugger.step-into'));this._stepOutAction=(self.UI.actionRegistry.action('debugger.step-out'));this._stepAction=(self.UI.actionRegistry.action('debugger.step'));this._toggleBreakpointsActiveAction=(self.UI.actionRegistry.action('debugger.toggle-breakpoints-active'));this._debugToolbar=this._createDebugToolbar();this._debugToolbarDrawer=this._createDebugToolbarDrawer();this._debuggerPausedMessage=new DebuggerPausedMessage();const initialDebugSidebarWidth=225;this._splitWidget=new UI.SplitWidget.SplitWidget(true,true,'sourcesPanelSplitViewState',initialDebugSidebarWidth);this._splitWidget.enableShowModeSaving();this._splitWidget.show(this.element);const initialNavigatorWidth=225;this.editorView=new UI.SplitWidget.SplitWidget(true,false,'sourcesPanelNavigatorSplitViewState',initialNavigatorWidth);this.editorView.enableShowModeSaving();this._splitWidget.setMainWidget(this.editorView);this._navigatorTabbedLocation=self.UI.viewManager.createTabbedLocation(this._revealNavigatorSidebar.bind(this),'navigator-view',true);const tabbedPane=this._navigatorTabbedLocation.tabbedPane();tabbedPane.setMinimumSize(100,25);tabbedPane.element.classList.add('navigator-tabbed-pane');const navigatorMenuButton=new UI.Toolbar.ToolbarMenuButton(this._populateNavigatorMenu.bind(this),true);navigatorMenuButton.setTitle(Common.UIString.UIString('More options'));tabbedPane.rightToolbar().appendToolbarItem(navigatorMenuButton);if(self.UI.viewManager.hasViewsForLocation('run-view-sidebar')){const navigatorSplitWidget=new UI.SplitWidget.SplitWidget(false,true,'sourcePanelNavigatorSidebarSplitViewState');navigatorSplitWidget.setMainWidget(tabbedPane);const runViewTabbedPane=self.UI.viewManager.createTabbedLocation(this._revealNavigatorSidebar.bind(this),'run-view-sidebar').tabbedPane();navigatorSplitWidget.setSidebarWidget(runViewTabbedPane);navigatorSplitWidget.installResizer(runViewTabbedPane.headerElement());this.editorView.setSidebarWidget(navigatorSplitWidget);}else{this.editorView.setSidebarWidget(tabbedPane);}
this._sourcesView=new SourcesView();this._sourcesView.addEventListener(Events.EditorSelected,this._editorSelected.bind(this));this._toggleNavigatorSidebarButton=this.editorView.createShowHideSidebarButton(ls`navigator`);this._toggleDebuggerSidebarButton=this._splitWidget.createShowHideSidebarButton(ls`debugger`);this.editorView.setMainWidget(this._sourcesView);this._threadsSidebarPane=null;this._watchSidebarPane=(self.UI.viewManager.view('sources.watch'));this._callstackPane=self.runtime.sharedInstance(CallStackSidebarPane);self.Common.settings.moduleSetting('sidebarPosition').addChangeListener(this._updateSidebarPosition.bind(this));this._updateSidebarPosition();this._updateDebuggerButtonsAndStatus();this._pauseOnExceptionEnabledChanged();self.Common.settings.moduleSetting('pauseOnExceptionEnabled').addChangeListener(this._pauseOnExceptionEnabledChanged,this);this._liveLocationPool=new Bindings.LiveLocation.LiveLocationPool();this._setTarget(self.UI.context.flavor(SDK.SDKModel.Target));self.Common.settings.moduleSetting('breakpointsActive').addChangeListener(this._breakpointsActiveStateChanged,this);self.UI.context.addFlavorChangeListener(SDK.SDKModel.Target,this._onCurrentTargetChanged,this);self.UI.context.addFlavorChangeListener(SDK.DebuggerModel.CallFrame,this._callFrameChanged,this);self.SDK.targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.DebuggerWasEnabled,this._debuggerWasEnabled,this);self.SDK.targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.DebuggerPaused,this._debuggerPaused,this);self.SDK.targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.DebuggerResumed,event=>this._debuggerResumed((event.data)));self.SDK.targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.GlobalObjectCleared,event=>this._debuggerResumed((event.data)));self.Extensions.extensionServer.addEventListener(Extensions.ExtensionServer.Events.SidebarPaneAdded,this._extensionSidebarPaneAdded,this);self.SDK.targetManager.observeTargets(this);}
static instance(){if(SourcesPanel._instance){return SourcesPanel._instance;}
return(self.runtime.sharedInstance(SourcesPanel));}
static updateResizerAndSidebarButtons(panel){panel._sourcesView.leftToolbar().removeToolbarItems();panel._sourcesView.rightToolbar().removeToolbarItems();panel._sourcesView.bottomToolbar().removeToolbarItems();const isInWrapper=WrapperView.isShowing()&&!self.UI.inspectorView.isDrawerMinimized();if(panel._splitWidget.isVertical()||isInWrapper){panel._splitWidget.uninstallResizer(panel._sourcesView.toolbarContainerElement());}else{panel._splitWidget.installResizer(panel._sourcesView.toolbarContainerElement());}
if(!isInWrapper){panel._sourcesView.leftToolbar().appendToolbarItem(panel._toggleNavigatorSidebarButton);if(panel._splitWidget.isVertical()){panel._sourcesView.rightToolbar().appendToolbarItem(panel._toggleDebuggerSidebarButton);}else{panel._sourcesView.bottomToolbar().appendToolbarItem(panel._toggleDebuggerSidebarButton);}}}
targetAdded(target){this._showThreadsIfNeeded();}
targetRemoved(target){}
_showThreadsIfNeeded(){if(ThreadsSidebarPane.shouldBeShown()&&!this._threadsSidebarPane){this._threadsSidebarPane=(self.UI.viewManager.view('sources.threads'));if(this._sidebarPaneStack&&this._threadsSidebarPane){this._sidebarPaneStack.showView(this._threadsSidebarPane,this._splitWidget.isVertical()?this._watchSidebarPane:this._callstackPane);}}}
_setTarget(target){if(!target){return;}
const debuggerModel=target.model(SDK.DebuggerModel.DebuggerModel);if(!debuggerModel){return;}
if(debuggerModel.isPaused()){this._showDebuggerPausedDetails((debuggerModel.debuggerPausedDetails()));}else{this._paused=false;this._clearInterface();this._toggleDebuggerSidebarButton.setEnabled(true);}}
_onCurrentTargetChanged(event){const target=(event.data);this._setTarget(target);}
paused(){return this._paused;}
wasShown(){self.UI.context.setFlavor(SourcesPanel,this);super.wasShown();const wrapper=WrapperView._instance;if(wrapper&&wrapper.isShowing()){self.UI.inspectorView.setDrawerMinimized(true);SourcesPanel.updateResizerAndSidebarButtons(this);}
this.editorView.setMainWidget(this._sourcesView);}
willHide(){super.willHide();self.UI.context.setFlavor(SourcesPanel,null);if(WrapperView.isShowing()){WrapperView._instance._showViewInWrapper();self.UI.inspectorView.setDrawerMinimized(false);SourcesPanel.updateResizerAndSidebarButtons(this);}}
resolveLocation(locationName){if(locationName==='sources.sidebar-top'||locationName==='sources.sidebar-bottom'||locationName==='sources.sidebar-tabs'){return this._sidebarPaneStack;}
return this._navigatorTabbedLocation;}
_ensureSourcesViewVisible(){if(WrapperView.isShowing()){return true;}
if(!self.UI.inspectorView.canSelectPanel('sources')){return false;}
self.UI.viewManager.showView('sources');return true;}
onResize(){if(self.Common.settings.moduleSetting('sidebarPosition').get()==='auto'){this.element.window().requestAnimationFrame(this._updateSidebarPosition.bind(this));}}
searchableView(){return this._sourcesView.searchableView();}
_debuggerPaused(event){const debuggerModel=(event.data);const details=debuggerModel.debuggerPausedDetails();if(!this._paused){this._setAsCurrentPanel();}
if(self.UI.context.flavor(SDK.SDKModel.Target)===debuggerModel.target()){this._showDebuggerPausedDetails((details));}else if(!this._paused){self.UI.context.setFlavor(SDK.SDKModel.Target,debuggerModel.target());}}
_showDebuggerPausedDetails(details){this._paused=true;this._updateDebuggerButtonsAndStatus();self.UI.context.setFlavor(SDK.DebuggerModel.DebuggerPausedDetails,details);this._toggleDebuggerSidebarButton.setEnabled(false);this._revealDebuggerSidebar();window.focus();Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();}
_debuggerResumed(debuggerModel){const target=debuggerModel.target();if(self.UI.context.flavor(SDK.SDKModel.Target)!==target){return;}
this._paused=false;this._clearInterface();this._toggleDebuggerSidebarButton.setEnabled(true);this._switchToPausedTargetTimeout=setTimeout(this._switchToPausedTarget.bind(this,debuggerModel),500);}
_debuggerWasEnabled(event){const debuggerModel=(event.data);if(self.UI.context.flavor(SDK.SDKModel.Target)!==debuggerModel.target()){return;}
this._updateDebuggerButtonsAndStatus();}
get visibleView(){return this._sourcesView.visibleView();}
showUISourceCode(uiSourceCode,lineNumber,columnNumber,omitFocus){if(omitFocus){const wrapperShowing=WrapperView._instance&&WrapperView._instance.isShowing();if(!this.isShowing()&&!wrapperShowing){return;}}else{this._showEditor();}
this._sourcesView.showSourceLocation(uiSourceCode,lineNumber,columnNumber,omitFocus);}
_showEditor(){if(WrapperView._instance&&WrapperView._instance.isShowing()){return;}
this._setAsCurrentPanel();}
showUILocation(uiLocation,omitFocus){this.showUISourceCode(uiLocation.uiSourceCode,uiLocation.lineNumber,uiLocation.columnNumber,omitFocus);}
_revealInNavigator(uiSourceCode,skipReveal){const extensions=self.runtime.extensions(NavigatorView);Promise.all(extensions.map(extension=>extension.instance())).then(filterNavigators.bind(this));function filterNavigators(objects){for(let i=0;i<objects.length;++i){const navigatorView=(objects[i]);const viewId=extensions[i].descriptor()['viewId'];if(navigatorView.acceptProject(uiSourceCode.project())){navigatorView.revealUISourceCode(uiSourceCode,true);if(skipReveal){this._navigatorTabbedLocation.tabbedPane().selectTab(viewId);}else{self.UI.viewManager.showView(viewId);}}}}}
_populateNavigatorMenu(contextMenu){const groupByFolderSetting=self.Common.settings.moduleSetting('navigatorGroupByFolder');contextMenu.appendItemsAtLocation('navigatorMenu');contextMenu.viewSection().appendCheckboxItem(Common.UIString.UIString('Group by folder'),()=>groupByFolderSetting.set(!groupByFolderSetting.get()),groupByFolderSetting.get());}
setIgnoreExecutionLineEvents(ignoreExecutionLineEvents){this._ignoreExecutionLineEvents=ignoreExecutionLineEvents;}
updateLastModificationTime(){this._lastModificationTime=window.performance.now();}
_executionLineChanged(liveLocation){const uiLocation=liveLocation.uiLocation();if(!uiLocation){return;}
if(window.performance.now()-this._lastModificationTime<lastModificationTimeout){return;}
this._sourcesView.showSourceLocation(uiLocation.uiSourceCode,uiLocation.lineNumber,uiLocation.columnNumber,undefined,true);}
_lastModificationTimeoutPassedForTest(){lastModificationTimeout=Number.MIN_VALUE;}
_updateLastModificationTimeForTest(){lastModificationTimeout=Number.MAX_VALUE;}
async _callFrameChanged(){const callFrame=self.UI.context.flavor(SDK.DebuggerModel.CallFrame);if(!callFrame){return;}
if(this._executionLineLocation){this._executionLineLocation.dispose();}
this._executionLineLocation=await self.Bindings.debuggerWorkspaceBinding.createCallFrameLiveLocation(callFrame.location(),this._executionLineChanged.bind(this),this._liveLocationPool);}
_pauseOnExceptionEnabledChanged(){const enabled=self.Common.settings.moduleSetting('pauseOnExceptionEnabled').get();this._pauseOnExceptionButton.setToggled(enabled);this._pauseOnExceptionButton.setTitle(enabled?ls`Don't pause on exceptions`:ls`Pause on exceptions`);this._debugToolbarDrawer.classList.toggle('expanded',enabled);}
async _updateDebuggerButtonsAndStatus(){const currentTarget=self.UI.context.flavor(SDK.SDKModel.Target);const currentDebuggerModel=currentTarget?currentTarget.model(SDK.DebuggerModel.DebuggerModel):null;if(!currentDebuggerModel){this._togglePauseAction.setEnabled(false);this._stepOverAction.setEnabled(false);this._stepIntoAction.setEnabled(false);this._stepOutAction.setEnabled(false);this._stepAction.setEnabled(false);}else if(this._paused){this._togglePauseAction.setToggled(true);this._togglePauseAction.setEnabled(true);this._stepOverAction.setEnabled(true);this._stepIntoAction.setEnabled(true);this._stepOutAction.setEnabled(true);this._stepAction.setEnabled(true);}else{this._togglePauseAction.setToggled(false);this._togglePauseAction.setEnabled(!currentDebuggerModel.isPausing());this._stepOverAction.setEnabled(false);this._stepIntoAction.setEnabled(false);this._stepOutAction.setEnabled(false);this._stepAction.setEnabled(false);}
const details=currentDebuggerModel?currentDebuggerModel.debuggerPausedDetails():null;await this._debuggerPausedMessage.render(details,self.Bindings.debuggerWorkspaceBinding,self.Bindings.breakpointManager);if(details){this._updateDebuggerButtonsAndStatusForTest();}}
_updateDebuggerButtonsAndStatusForTest(){}
_clearInterface(){this._updateDebuggerButtonsAndStatus();self.UI.context.setFlavor(SDK.DebuggerModel.DebuggerPausedDetails,null);if(this._switchToPausedTargetTimeout){clearTimeout(this._switchToPausedTargetTimeout);}
this._liveLocationPool.disposeAll();}
_switchToPausedTarget(debuggerModel){delete this._switchToPausedTargetTimeout;if(this._paused||debuggerModel.isPaused()){return;}
for(const debuggerModel of self.SDK.targetManager.models(SDK.DebuggerModel.DebuggerModel)){if(debuggerModel.isPaused()){self.UI.context.setFlavor(SDK.SDKModel.Target,debuggerModel.target());break;}}}
_togglePauseOnExceptions(){self.Common.settings.moduleSetting('pauseOnExceptionEnabled').set(!this._pauseOnExceptionButton.toggled());}
_runSnippet(){const uiSourceCode=this._sourcesView.currentUISourceCode();if(uiSourceCode){Snippets.ScriptSnippetFileSystem.evaluateScriptSnippet(uiSourceCode);}}
_editorSelected(event){const uiSourceCode=(event.data);if(this.editorView.mainWidget()&&self.Common.settings.moduleSetting('autoRevealInNavigator').get()){this._revealInNavigator(uiSourceCode,true);}}
_togglePause(){const target=self.UI.context.flavor(SDK.SDKModel.Target);if(!target){return true;}
const debuggerModel=target.model(SDK.DebuggerModel.DebuggerModel);if(!debuggerModel){return true;}
if(this._paused){this._paused=false;debuggerModel.resume();}else{debuggerModel.pause();}
this._clearInterface();return true;}
_prepareToResume(){if(!this._paused){return null;}
this._paused=false;this._clearInterface();const target=self.UI.context.flavor(SDK.SDKModel.Target);return target?target.model(SDK.DebuggerModel.DebuggerModel):null;}
_longResume(event){const debuggerModel=this._prepareToResume();if(debuggerModel){debuggerModel.skipAllPausesUntilReloadOrTimeout(500);debuggerModel.resume();}}
_terminateExecution(event){const debuggerModel=this._prepareToResume();if(debuggerModel){debuggerModel.runtimeModel().terminateExecution();debuggerModel.resume();}}
_stepOver(){const debuggerModel=this._prepareToResume();if(debuggerModel){debuggerModel.stepOver();}
return true;}
_stepInto(){const debuggerModel=this._prepareToResume();if(debuggerModel){debuggerModel.stepInto();}
return true;}
_stepIntoAsync(){const debuggerModel=this._prepareToResume();if(debuggerModel){debuggerModel.scheduleStepIntoAsync();}
return true;}
_stepOut(){const debuggerModel=this._prepareToResume();if(debuggerModel){debuggerModel.stepOut();}
return true;}
async _continueToLocation(uiLocation){const executionContext=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);if(!executionContext){return;}
const rawLocations=await self.Bindings.debuggerWorkspaceBinding.uiLocationToRawLocations(uiLocation.uiSourceCode,uiLocation.lineNumber,0);const rawLocation=rawLocations.find(location=>location.debuggerModel===executionContext.debuggerModel);if(rawLocation&&this._prepareToResume()){rawLocation.continueToLocation();}}
_toggleBreakpointsActive(){self.Common.settings.moduleSetting('breakpointsActive').set(!self.Common.settings.moduleSetting('breakpointsActive').get());}
_breakpointsActiveStateChanged(){const active=self.Common.settings.moduleSetting('breakpointsActive').get();this._toggleBreakpointsActiveAction.setToggled(!active);this._sourcesView.toggleBreakpointsActiveState(active);}
_createDebugToolbar(){const debugToolbar=new UI.Toolbar.Toolbar('scripts-debug-toolbar');const longResumeButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Resume with all pauses blocked for 500 ms'),'largeicon-play');longResumeButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._longResume,this);const terminateExecutionButton=new UI.Toolbar.ToolbarButton(ls`Terminate current JavaScript call`,'largeicon-terminate-execution');terminateExecutionButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._terminateExecution,this);debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createLongPressActionButton(this._togglePauseAction,[terminateExecutionButton,longResumeButton],[]));debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepOverAction));debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepIntoAction));debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepOutAction));debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepAction));debugToolbar.appendSeparator();debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._toggleBreakpointsActiveAction));this._pauseOnExceptionButton=new UI.Toolbar.ToolbarToggle('','largeicon-pause-on-exceptions');this._pauseOnExceptionButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._togglePauseOnExceptions,this);debugToolbar.appendToolbarItem(this._pauseOnExceptionButton);return debugToolbar;}
_createDebugToolbarDrawer(){const debugToolbarDrawer=createElementWithClass('div','scripts-debug-toolbar-drawer');const label=Common.UIString.UIString('Pause on caught exceptions');const setting=self.Common.settings.moduleSetting('pauseOnCaughtException');debugToolbarDrawer.appendChild(UI.SettingsUI.createSettingCheckbox(label,setting,true));return debugToolbarDrawer;}
appendApplicableItems(event,contextMenu,target){this._appendUISourceCodeItems(event,contextMenu,target);this._appendUISourceCodeFrameItems(event,contextMenu,target);this.appendUILocationItems(contextMenu,target);this._appendRemoteObjectItems(contextMenu,target);this._appendNetworkRequestItems(contextMenu,target);}
_appendUISourceCodeItems(event,contextMenu,target){if(!(target instanceof Workspace.UISourceCode.UISourceCode)){return;}
const uiSourceCode=(target);if(!uiSourceCode.project().isServiceProject()&&!event.target.isSelfOrDescendant(this._navigatorTabbedLocation.widget().element)){contextMenu.revealSection().appendItem(Common.UIString.UIString('Reveal in sidebar'),this._handleContextMenuReveal.bind(this,uiSourceCode));}}
_appendUISourceCodeFrameItems(event,contextMenu,target){if(!(target instanceof UISourceCodeFrame)){return;}
if(target.uiSourceCode().contentType().isFromSourceMap()||target.textEditor.selection().isEmpty()){return;}
contextMenu.debugSection().appendAction('debugger.evaluate-selection');}
appendUILocationItems(contextMenu,object){if(!(object instanceof Workspace.UISourceCode.UILocation)){return;}
const uiLocation=(object);const uiSourceCode=uiLocation.uiSourceCode;const contentType=uiSourceCode.contentType();if(contentType.hasScripts()){const target=self.UI.context.flavor(SDK.SDKModel.Target);const debuggerModel=target?target.model(SDK.DebuggerModel.DebuggerModel):null;if(debuggerModel&&debuggerModel.isPaused()){contextMenu.debugSection().appendItem(Common.UIString.UIString('Continue to here'),this._continueToLocation.bind(this,uiLocation));}
this._callstackPane.appendBlackboxURLContextMenuItems(contextMenu,uiSourceCode);}}
_handleContextMenuReveal(uiSourceCode){this.editorView.showBoth();this._revealInNavigator(uiSourceCode);}
_appendRemoteObjectItems(contextMenu,target){if(!(target instanceof SDK.RemoteObject.RemoteObject)){return;}
const remoteObject=(target);const executionContext=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);contextMenu.debugSection().appendItem(ls`Store as global variable`,()=>self.SDK.consoleModel.saveToTempVariable(executionContext,remoteObject));if(remoteObject.type==='function'){contextMenu.debugSection().appendItem(ls`Show function definition`,this._showFunctionDefinition.bind(this,remoteObject));}}
_appendNetworkRequestItems(contextMenu,target){if(!(target instanceof SDK.NetworkRequest.NetworkRequest)){return;}
const request=(target);const uiSourceCode=this._workspace.uiSourceCodeForURL(request.url());if(!uiSourceCode){return;}
const openText=Common.UIString.UIString('Open in Sources panel');contextMenu.revealSection().appendItem(openText,this.showUILocation.bind(this,uiSourceCode.uiLocation(0,0)));}
_showFunctionDefinition(remoteObject){remoteObject.debuggerModel().functionDetailsPromise(remoteObject).then(this._didGetFunctionDetails.bind(this));}
async _didGetFunctionDetails(response){if(!response||!response.location){return;}
const uiLocation=await self.Bindings.debuggerWorkspaceBinding.rawLocationToUILocation(response.location);if(uiLocation){this.showUILocation(uiLocation);}}
_revealNavigatorSidebar(){this._setAsCurrentPanel();this.editorView.showBoth(true);}
_revealDebuggerSidebar(){this._setAsCurrentPanel();this._splitWidget.showBoth(true);}
_updateSidebarPosition(){let vertically;const position=self.Common.settings.moduleSetting('sidebarPosition').get();if(position==='right'){vertically=false;}else if(position==='bottom'){vertically=true;}else{vertically=self.UI.inspectorView.element.offsetWidth<680;}
if(this.sidebarPaneView&&vertically===!this._splitWidget.isVertical()){return;}
if(this.sidebarPaneView&&this.sidebarPaneView.shouldHideOnDetach()){return;}
if(this.sidebarPaneView){this.sidebarPaneView.detach();}
this._splitWidget.setVertical(!vertically);this._splitWidget.element.classList.toggle('sources-split-view-vertical',vertically);SourcesPanel.updateResizerAndSidebarButtons(this);const vbox=new UI.Widget.VBox();vbox.element.appendChild(this._debugToolbar.element);vbox.element.appendChild(this._debugToolbarDrawer);vbox.setMinimumAndPreferredSizes(minToolbarWidth,25,minToolbarWidth,100);this._sidebarPaneStack=self.UI.viewManager.createStackLocation(this._revealDebuggerSidebar.bind(this));this._sidebarPaneStack.widget().element.classList.add('overflow-auto');this._sidebarPaneStack.widget().show(vbox.element);this._sidebarPaneStack.widget().element.appendChild(this._debuggerPausedMessage.element());this._sidebarPaneStack.appendApplicableItems('sources.sidebar-top');if(this._threadsSidebarPane){this._sidebarPaneStack.showView(this._threadsSidebarPane);}
if(!vertically){this._sidebarPaneStack.appendView(this._watchSidebarPane);}
this._sidebarPaneStack.showView(this._callstackPane);const jsBreakpoints=(self.UI.viewManager.view('sources.jsBreakpoints'));const sourceScopeChainView=(Root.Runtime.experiments.isEnabled('wasmDWARFDebugging')?self.UI.viewManager.view('sources.sourceScopeChain'):null);const scopeChainView=(self.UI.viewManager.view('sources.scopeChain'));if(this._tabbedLocationHeader){this._splitWidget.uninstallResizer(this._tabbedLocationHeader);this._tabbedLocationHeader=null;}
if(!vertically){if(Root.Runtime.experiments.isEnabled('wasmDWARFDebugging')){this._sidebarPaneStack.showView((sourceScopeChainView));}
this._sidebarPaneStack.showView(scopeChainView);this._sidebarPaneStack.showView(jsBreakpoints);this._extensionSidebarPanesContainer=this._sidebarPaneStack;this.sidebarPaneView=vbox;this._splitWidget.uninstallResizer(this._debugToolbar.gripElementForResize());}else{const splitWidget=new UI.SplitWidget.SplitWidget(true,true,'sourcesPanelDebuggerSidebarSplitViewState',0.5);splitWidget.setMainWidget(vbox);this._sidebarPaneStack.showView(jsBreakpoints);const tabbedLocation=self.UI.viewManager.createTabbedLocation(this._revealDebuggerSidebar.bind(this));splitWidget.setSidebarWidget(tabbedLocation.tabbedPane());this._tabbedLocationHeader=tabbedLocation.tabbedPane().headerElement();this._splitWidget.installResizer(this._tabbedLocationHeader);this._splitWidget.installResizer(this._debugToolbar.gripElementForResize());if(Root.Runtime.experiments.isEnabled('wasmDWARFDebugging')){tabbedLocation.appendView((sourceScopeChainView));}
tabbedLocation.appendView(scopeChainView);tabbedLocation.appendView(this._watchSidebarPane);tabbedLocation.appendApplicableItems('sources.sidebar-tabs');this._extensionSidebarPanesContainer=tabbedLocation;this.sidebarPaneView=splitWidget;}
this._sidebarPaneStack.appendApplicableItems('sources.sidebar-bottom');const extensionSidebarPanes=self.Extensions.extensionServer.sidebarPanes();for(let i=0;i<extensionSidebarPanes.length;++i){this._addExtensionSidebarPane(extensionSidebarPanes[i]);}
this._splitWidget.setSidebarWidget(this.sidebarPaneView);}
_setAsCurrentPanel(){return self.UI.viewManager.showView('sources');}
_extensionSidebarPaneAdded(event){const pane=(event.data);this._addExtensionSidebarPane(pane);}
_addExtensionSidebarPane(pane){if(pane.panelName()===this.name){this._extensionSidebarPanesContainer.appendView(pane);}}
sourcesView(){return this._sourcesView;}
_handleDrop(dataTransfer){const items=dataTransfer.items;if(!items.length){return;}
const entry=items[0].webkitGetAsEntry();if(!entry.isDirectory){return;}
Host.InspectorFrontendHost.InspectorFrontendHostInstance.upgradeDraggedFileSystemPermissions(entry.filesystem);}}
export let lastModificationTimeout=200;export const minToolbarWidth=215;export class UILocationRevealer{reveal(uiLocation,omitFocus){if(!(uiLocation instanceof Workspace.UISourceCode.UILocation)){return Promise.reject(new Error('Internal error: not a ui location'));}
SourcesPanel.instance().showUILocation(uiLocation,omitFocus);return Promise.resolve();}}
export class DebuggerLocationRevealer{async reveal(rawLocation,omitFocus){if(!(rawLocation instanceof SDK.DebuggerModel.Location)){throw new Error('Internal error: not a debugger location');}
const uiLocation=await self.Bindings.debuggerWorkspaceBinding.rawLocationToUILocation(rawLocation);if(uiLocation){SourcesPanel.instance().showUILocation(uiLocation,omitFocus);}}}
export class UISourceCodeRevealer{reveal(uiSourceCode,omitFocus){if(!(uiSourceCode instanceof Workspace.UISourceCode.UISourceCode)){return Promise.reject(new Error('Internal error: not a ui source code'));}
SourcesPanel.instance().showUISourceCode(uiSourceCode,undefined,undefined,omitFocus);return Promise.resolve();}}
export class DebuggerPausedDetailsRevealer{reveal(object){return SourcesPanel.instance()._setAsCurrentPanel();}}
export class RevealingActionDelegate{handleAction(context,actionId){const panel=SourcesPanel.instance();if(!panel._ensureSourcesViewVisible()){return false;}
switch(actionId){case'debugger.toggle-pause':panel._togglePause();return true;}
return false;}}
export class DebuggingActionDelegate{handleAction(context,actionId){const panel=SourcesPanel.instance();switch(actionId){case'debugger.step-over':panel._stepOver();return true;case'debugger.step-into':panel._stepIntoAsync();return true;case'debugger.step':panel._stepInto();return true;case'debugger.step-out':panel._stepOut();return true;case'debugger.run-snippet':panel._runSnippet();return true;case'debugger.toggle-breakpoints-active':panel._toggleBreakpointsActive();return true;case'debugger.evaluate-selection':const frame=self.UI.context.flavor(UISourceCodeFrame);if(frame){let text=frame.textEditor.text(frame.textEditor.selection());const executionContext=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);if(executionContext){const message=self.SDK.consoleModel.addCommandMessage(executionContext,text);text=ObjectUI.JavaScriptREPL.JavaScriptREPL.wrapObjectLiteral(text);self.SDK.consoleModel.evaluateCommandInConsole(executionContext,message,text,true,false);}}
return true;}
return false;}}
export class WrapperView extends UI.Widget.VBox{constructor(){super();this.element.classList.add('sources-view-wrapper');WrapperView._instance=this;this._view=SourcesPanel.instance()._sourcesView;}
static isShowing(){return!!WrapperView._instance&&WrapperView._instance.isShowing();}
wasShown(){if(!SourcesPanel.instance().isShowing()){this._showViewInWrapper();}else{self.UI.inspectorView.setDrawerMinimized(true);}
SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance());}
willHide(){self.UI.inspectorView.setDrawerMinimized(false);setImmediate(()=>SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance()));}
_showViewInWrapper(){this._view.show(this.element);}}