import*as Coverage from'../coverage/coverage.js';import*as Formatter from'../formatter/formatter.js';import*as SourceFrame from'../source_frame/source_frame.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{Plugin}from'./Plugin.js';export class CoveragePlugin extends Plugin{constructor(textEditor,uiSourceCode){super();this._textEditor=textEditor;this._uiSourceCode=uiSourceCode;this._originalSourceCode=Formatter.sourceFormatter.getOriginalUISourceCode(this._uiSourceCode);this._text=new UI.Toolbar.ToolbarButton(ls`Click to show Coverage Panel`);this._text.setSecondary();this._text.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,()=>{self.UI.viewManager.showView('coverage');});const mainTarget=self.SDK.targetManager.mainTarget();if(mainTarget){this._model=mainTarget.model(Coverage.CoverageModel.CoverageModel);this._model.addEventListener(Coverage.CoverageModel.Events.CoverageReset,this._handleReset,this);this._coverage=this._model.getCoverageForUrl(this._originalSourceCode.url());if(this._coverage){this._coverage.addEventListener(Coverage.CoverageModel.URLCoverageInfo.Events.SizesChanged,this._handleCoverageSizesChanged,this);}}
this._updateStats();}
dispose(){if(this._coverage){this._coverage.removeEventListener(Coverage.CoverageModel.URLCoverageInfo.Events.SizesChanged,this._handleCoverageSizesChanged,this);}
if(this._model){this._model.removeEventListener(Coverage.CoverageModel.Events.CoverageReset,this._handleReset,this);}}
static accepts(uiSourceCode){return uiSourceCode.contentType().isDocumentOrScriptOrStyleSheet();}
_handleReset(){this._coverage=null;this._updateStats();}
_handleCoverageSizesChanged(){this._updateStats();}
_updateStats(){if(this._coverage){this._text.setTitle(ls`Show Details`);this._text.setText(ls`Coverage: ${this._coverage.usedPercentage().toFixed(1)} %`);}else{this._text.setTitle(ls`Click to show Coverage Panel`);this._text.setText(ls`Coverage: n/a`);}}
async rightToolbarItems(){return[this._text];}}