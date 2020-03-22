import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as Host from'../host/host.js';import*as UI from'../ui/ui.js';export class SettingsScreen extends UI.Widget.VBox{constructor(){super(true);this.registerRequiredCSS('settings/settingsScreen.css');this.contentElement.classList.add('settings-window-main');this.contentElement.classList.add('vbox');const settingsLabelElement=createElement('div');const settingsTitleElement=UI.Utils.createShadowRootWithCoreStyles(settingsLabelElement,'settings/settingsScreen.css').createChild('div','settings-window-title');UI.ARIAUtils.markAsHeading(settingsTitleElement,1);settingsTitleElement.textContent=ls`Settings`;this._tabbedLocation=self.UI.viewManager.createTabbedLocation(()=>SettingsScreen._showSettingsScreen(),'settings-view');const tabbedPane=this._tabbedLocation.tabbedPane();tabbedPane.leftToolbar().appendToolbarItem(new UI.Toolbar.ToolbarItem(settingsLabelElement));tabbedPane.setShrinkableTabs(false);tabbedPane.makeVerticalTabLayout();const shortcutsView=new UI.View.SimpleView(ls`Shortcuts`);self.UI.shortcutsScreen.createShortcutsTabView().show(shortcutsView.element);this._tabbedLocation.appendView(shortcutsView);tabbedPane.show(this.contentElement);}
static async _showSettingsScreen(name){const settingsScreen=(self.runtime.sharedInstance(SettingsScreen));if(settingsScreen.isShowing()){return;}
const dialog=new UI.Dialog.Dialog();dialog.contentElement.tabIndex=-1;dialog.addCloseButton();dialog.setOutsideClickCallback(()=>{});dialog.setPointerEventsBehavior(UI.GlassPane.PointerEventsBehavior.PierceGlassPane);dialog.setOutsideTabIndexBehavior(UI.Dialog.OutsideTabIndexBehavior.PreserveMainViewTabIndex);settingsScreen.show(dialog.contentElement);dialog.show();settingsScreen._selectTab(name||'preferences');const tabbedPane=settingsScreen._tabbedLocation.tabbedPane();await tabbedPane.waitForTabElementUpdate();tabbedPane.focusSelectedTabHeader();}
resolveLocation(locationName){return this._tabbedLocation;}
_selectTab(name){self.UI.viewManager.showView(name);}}
class SettingsTab extends UI.Widget.VBox{constructor(name,id){super();this.element.classList.add('settings-tab-container');if(id){this.element.id=id;}
const header=this.element.createChild('header');header.createChild('h1').createTextChild(name);this.containerElement=this.element.createChild('div','settings-container-wrapper').createChild('div','settings-tab settings-content settings-container');}
_appendSection(name){const block=this.containerElement.createChild('div','settings-block');if(name){UI.ARIAUtils.markAsGroup(block);const title=block.createChild('div','settings-section-title');title.textContent=name;UI.ARIAUtils.markAsHeading(title,2);UI.ARIAUtils.setAccessibleName(block,name);}
return block;}}
export class GenericSettingsTab extends SettingsTab{constructor(){super(Common.UIString.UIString('Preferences'),'preferences-tab-content');const explicitSectionOrder=['','Appearance','Sources','Elements','Network','Performance','Console','Extensions'];this._nameToSection=new Map();for(const sectionName of explicitSectionOrder){this._sectionElement(sectionName);}
self.runtime.extensions('setting').forEach(this._addSetting.bind(this));self.runtime.extensions(UI.SettingsUI.SettingUI).forEach(this._addSettingUI.bind(this));this._appendSection().appendChild(UI.UIUtils.createTextButton(Common.UIString.UIString('Restore defaults and reload'),restoreAndReload));function restoreAndReload(){self.Common.settings.clearAll();Components.Reload.reload();}}
static isSettingVisible(extension){const descriptor=extension.descriptor();if(!('title'in descriptor)){return false;}
if(!('category'in descriptor)){return false;}
return true;}
_addSetting(extension){if(!GenericSettingsTab.isSettingVisible(extension)){return;}
const sectionElement=this._sectionElement(extension.descriptor()['category']);const setting=self.Common.settings.moduleSetting(extension.descriptor()['settingName']);const settingControl=UI.SettingsUI.createControlForSetting(setting);if(settingControl){sectionElement.appendChild(settingControl);}}
_addSettingUI(extension){const descriptor=extension.descriptor();const sectionName=descriptor['category']||'';extension.instance().then(appendCustomSetting.bind(this));function appendCustomSetting(object){const settingUI=(object);const element=settingUI.settingElement();if(element){this._sectionElement(sectionName).appendChild(element);}}}
_sectionElement(sectionName){let sectionElement=this._nameToSection.get(sectionName);if(!sectionElement){const uiSectionName=sectionName&&Common.UIString.UIString(sectionName);sectionElement=this._appendSection(uiSectionName);this._nameToSection.set(sectionName,sectionElement);}
return sectionElement;}}
export class ExperimentsSettingsTab extends SettingsTab{constructor(){super(Common.UIString.UIString('Experiments'),'experiments-tab-content');const experiments=Root.Runtime.experiments.allConfigurableExperiments().sort();const unstableExperiments=experiments.filter(e=>e.unstable);const stableExperiments=experiments.filter(e=>!e.unstable);if(stableExperiments.length){const experimentsSection=this._appendSection();const warningMessage=Common.UIString.UIString('These experiments could be dangerous and may require restart.');experimentsSection.appendChild(this._createExperimentsWarningSubsection(warningMessage));for(const experiment of stableExperiments){experimentsSection.appendChild(this._createExperimentCheckbox(experiment));}}
if(unstableExperiments.length){const experimentsSection=this._appendSection();const warningMessage=Common.UIString.UIString('These experiments are particularly unstable. Enable at your own risk.');experimentsSection.appendChild(this._createExperimentsWarningSubsection(warningMessage));for(const experiment of unstableExperiments){experimentsSection.appendChild(this._createExperimentCheckbox(experiment));}}}
_createExperimentsWarningSubsection(warningMessage){const subsection=createElement('div');const warning=subsection.createChild('span','settings-experiments-warning-subsection-warning');warning.textContent=Common.UIString.UIString('WARNING:');subsection.createTextChild(' ');const message=subsection.createChild('span','settings-experiments-warning-subsection-message');message.textContent=warningMessage;return subsection;}
_createExperimentCheckbox(experiment){const label=UI.UIUtils.CheckboxLabel.create(Common.UIString.UIString(experiment.title),experiment.isEnabled());const input=label.checkboxElement;input.name=experiment.name;function listener(){experiment.setEnabled(input.checked);}
input.addEventListener('click',listener,false);const p=createElement('p');p.className=experiment.unstable&&!experiment.isEnabled()?'settings-experiment-unstable':'';p.appendChild(label);return p;}}
export class ActionDelegate{handleAction(context,actionId){switch(actionId){case'settings.show':SettingsScreen._showSettingsScreen();return true;case'settings.documentation':Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab('https://developers.google.com/web/tools/chrome-devtools/');return true;case'settings.shortcuts':SettingsScreen._showSettingsScreen(Common.UIString.UIString('Shortcuts'));return true;}
return false;}}
export class Revealer{reveal(object){console.assert(object instanceof Common.Settings.Setting);const setting=(object);let success=false;self.runtime.extensions('setting').forEach(revealModuleSetting);self.runtime.extensions(UI.SettingsUI.SettingUI).forEach(revealSettingUI);self.runtime.extensions('view').forEach(revealSettingsView);return success?Promise.resolve():Promise.reject();function revealModuleSetting(extension){if(!GenericSettingsTab.isSettingVisible(extension)){return;}
if(extension.descriptor()['settingName']===setting.name){Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();SettingsScreen._showSettingsScreen();success=true;}}
function revealSettingUI(extension){const settings=extension.descriptor()['settings'];if(settings&&settings.indexOf(setting.name)!==-1){Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();SettingsScreen._showSettingsScreen();success=true;}}
function revealSettingsView(extension){const location=extension.descriptor()['location'];if(location!=='settings-view'){return;}
const settings=extension.descriptor()['settings'];if(settings&&settings.indexOf(setting.name)!==-1){Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();SettingsScreen._showSettingsScreen(extension.descriptor()['id']);success=true;}}}}