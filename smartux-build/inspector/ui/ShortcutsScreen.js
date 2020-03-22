import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as ARIAUtils from'./ARIAUtils.js';import{Descriptor,KeyboardShortcut,Keys,Modifiers}from'./KeyboardShortcut.js';import{createDocumentationLink}from'./UIUtils.js';import{Widget}from'./Widget.js';export class ShortcutsScreen{constructor(){this._sections={};}
static registerShortcuts(){const elementsSection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Elements Panel'));const navigate=ElementsPanelShortcuts.NavigateUp.concat(ElementsPanelShortcuts.NavigateDown);elementsSection.addRelatedKeys(navigate,Common.UIString.UIString('Navigate elements'));const expandCollapse=ElementsPanelShortcuts.Expand.concat(ElementsPanelShortcuts.Collapse);elementsSection.addRelatedKeys(expandCollapse,Common.UIString.UIString('Expand/collapse'));elementsSection.addAlternateKeys(ElementsPanelShortcuts.EditAttribute,Common.UIString.UIString('Edit attribute'));elementsSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('elements.hide-element'),Common.UIString.UIString('Hide element'));elementsSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('elements.edit-as-html'),Common.UIString.UIString('Toggle edit as HTML'));const stylesPaneSection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Styles Pane'));const nextPreviousProperty=ElementsPanelShortcuts.NextProperty.concat(ElementsPanelShortcuts.PreviousProperty);stylesPaneSection.addRelatedKeys(nextPreviousProperty,Common.UIString.UIString('Next/previous property'));stylesPaneSection.addRelatedKeys(ElementsPanelShortcuts.IncrementValue,Common.UIString.UIString('Increment value'));stylesPaneSection.addRelatedKeys(ElementsPanelShortcuts.DecrementValue,Common.UIString.UIString('Decrement value'));stylesPaneSection.addAlternateKeys(ElementsPanelShortcuts.IncrementBy10,Common.UIString.UIString('Increment by %f',10));stylesPaneSection.addAlternateKeys(ElementsPanelShortcuts.DecrementBy10,Common.UIString.UIString('Decrement by %f',10));stylesPaneSection.addAlternateKeys(ElementsPanelShortcuts.IncrementBy100,Common.UIString.UIString('Increment by %f',100));stylesPaneSection.addAlternateKeys(ElementsPanelShortcuts.DecrementBy100,Common.UIString.UIString('Decrement by %f',100));stylesPaneSection.addAlternateKeys(ElementsPanelShortcuts.IncrementBy01,Common.UIString.UIString('Increment by %f',0.1));stylesPaneSection.addAlternateKeys(ElementsPanelShortcuts.DecrementBy01,Common.UIString.UIString('Decrement by %f',0.1));const consoleSection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Console'));consoleSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('console.clear'),Common.UIString.UIString('Clear console'));consoleSection.addRelatedKeys(ConsolePanelShortcuts.AcceptSuggestion,Common.UIString.UIString('Accept suggestion'));consoleSection.addAlternateKeys(ConsolePanelShortcuts.ClearConsolePrompt,Common.UIString.UIString('Clear console prompt'));consoleSection.addRelatedKeys(ConsolePanelShortcuts.NextPreviousLine,Common.UIString.UIString('Next/previous line'));if(Host.Platform.isMac()){consoleSection.addRelatedKeys(ConsolePanelShortcuts.NextPreviousCommand,Common.UIString.UIString('Next/previous command'));}
consoleSection.addKey(ConsolePanelShortcuts.ExecuteCommand,Common.UIString.UIString('Execute command'));const debuggerSection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Debugger'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.toggle-pause'),Common.UIString.UIString('Pause/ Continue'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.step-over'),Common.UIString.UIString('Step over'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.step-into'),Common.UIString.UIString('Step into'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.step-out'),Common.UIString.UIString('Step out'));const nextAndPrevFrameKeys=self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.next-call-frame').concat(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.previous-call-frame'));debuggerSection.addRelatedKeys(nextAndPrevFrameKeys,Common.UIString.UIString('Next/previous call frame'));debuggerSection.addAlternateKeys(SourcesPanelShortcuts.EvaluateSelectionInConsole,Common.UIString.UIString('Evaluate selection in console'));debuggerSection.addAlternateKeys(SourcesPanelShortcuts.AddSelectionToWatch,Common.UIString.UIString('Add selection to watch'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.toggle-breakpoint'),Common.UIString.UIString('Toggle breakpoint'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.toggle-breakpoint-enabled'),Common.UIString.UIString('Toggle breakpoint enabled'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.toggle-breakpoints-active'),Common.UIString.UIString('Toggle all breakpoints'));debuggerSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('debugger.breakpoint-input-window'),ls`Open breakpoint editor`);const editingSection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Text Editor'));editingSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('sources.go-to-member'),Common.UIString.UIString('Go to member'));editingSection.addAlternateKeys(SourcesPanelShortcuts.ToggleAutocompletion,Common.UIString.UIString('Autocompletion'));editingSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('sources.go-to-line'),Common.UIString.UIString('Go to line'));editingSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('sources.jump-to-previous-location'),Common.UIString.UIString('Jump to previous editing location'));editingSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('sources.jump-to-next-location'),Common.UIString.UIString('Jump to next editing location'));editingSection.addAlternateKeys(SourcesPanelShortcuts.ToggleComment,Common.UIString.UIString('Toggle comment'));editingSection.addAlternateKeys(SourcesPanelShortcuts.IncreaseCSSUnitByOne,Common.UIString.UIString('Increment CSS unit by 1'));editingSection.addAlternateKeys(SourcesPanelShortcuts.DecreaseCSSUnitByOne,Common.UIString.UIString('Decrement CSS unit by 1'));editingSection.addAlternateKeys(SourcesPanelShortcuts.IncreaseCSSUnitByTen,Common.UIString.UIString('Increment CSS unit by 10'));editingSection.addAlternateKeys(SourcesPanelShortcuts.DecreaseCSSUnitByTen,Common.UIString.UIString('Decrement CSS unit by 10'));editingSection.addAlternateKeys(SourcesPanelShortcuts.SelectNextOccurrence,Common.UIString.UIString('Select next occurrence'));editingSection.addAlternateKeys(SourcesPanelShortcuts.SoftUndo,Common.UIString.UIString('Soft undo'));editingSection.addAlternateKeys(SourcesPanelShortcuts.GotoMatchingBracket,Common.UIString.UIString('Go to matching bracket'));editingSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('sources.close-editor-tab'),Common.UIString.UIString('Close editor tab'));editingSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('sources.switch-file'),Common.UIString.UIString('Switch between files with the same name and different extensions.'));const performanceSection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Performance Panel'));performanceSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.toggle-recording'),Common.UIString.UIString('Start/stop recording'));performanceSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.record-reload'),Common.UIString.UIString('Record page reload'));performanceSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.save-to-file'),Common.UIString.UIString('Save profile'));performanceSection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.load-from-file'),Common.UIString.UIString('Load profile'));performanceSection.addRelatedKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.jump-to-previous-frame').concat(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.jump-to-next-frame')),Common.UIString.UIString('Jump to previous/next frame'));performanceSection.addRelatedKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.show-history'),Common.UIString.UIString('Pick a recording from history'));performanceSection.addRelatedKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.previous-recording').concat(self.UI.shortcutRegistry.shortcutDescriptorsForAction('timeline.next-recording')),Common.UIString.UIString('Show previous/next recording'));const memorySection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Memory Panel'));memorySection.addAlternateKeys(self.UI.shortcutRegistry.shortcutDescriptorsForAction('profiler.heap-toggle-recording'),Common.UIString.UIString('Start/stop recording'));const layersSection=self.UI.shortcutsScreen.section(Common.UIString.UIString('Layers Panel'));layersSection.addAlternateKeys(LayersPanelShortcuts.ResetView,Common.UIString.UIString('Reset view'));layersSection.addAlternateKeys(LayersPanelShortcuts.PanMode,Common.UIString.UIString('Switch to pan mode'));layersSection.addAlternateKeys(LayersPanelShortcuts.RotateMode,Common.UIString.UIString('Switch to rotate mode'));layersSection.addAlternateKeys(LayersPanelShortcuts.TogglePanRotate,Common.UIString.UIString('Temporarily toggle pan/rotate mode while held'));layersSection.addAlternateKeys(LayersPanelShortcuts.ZoomIn,Common.UIString.UIString('Zoom in'));layersSection.addAlternateKeys(LayersPanelShortcuts.ZoomOut,Common.UIString.UIString('Zoom out'));layersSection.addRelatedKeys(LayersPanelShortcuts.Up.concat(LayersPanelShortcuts.Down),Common.UIString.UIString('Pan or rotate up/down'));layersSection.addRelatedKeys(LayersPanelShortcuts.Left.concat(LayersPanelShortcuts.Right),Common.UIString.UIString('Pan or rotate left/right'));}
section(name){let section=this._sections[name];if(!section){this._sections[name]=section=new ShortcutsSection(name);}
return section;}
createShortcutsTabView(){const orderedSections=[];for(const section in this._sections){orderedSections.push(this._sections[section]);}
function compareSections(a,b){return a.order-b.order;}
orderedSections.sort(compareSections);const widget=new Widget();widget.element.className='settings-tab-container';widget.element.createChild('header').createChild('h1').createTextChild(ls`Shortcuts`);const scrollPane=widget.element.createChild('div','settings-container-wrapper');const container=scrollPane.createChild('div');container.className='settings-content settings-container';for(let i=0;i<orderedSections.length;++i){orderedSections[i].renderSection(container);}
const note=scrollPane.createChild('p','settings-footnote');note.appendChild(createDocumentationLink('iterate/inspect-styles/shortcuts',Common.UIString.UIString('Full list of DevTools keyboard shortcuts and gestures')));return widget;}}
class ShortcutsSection{constructor(name){this.name=name;this._lines=([]);this.order=++ShortcutsSection._sequenceNumber;}
addKey(key,description){this._addLine(this._renderKey(key),description);}
addRelatedKeys(keys,description){this._addLine(this._renderSequence(keys,'/'),description);}
addAlternateKeys(keys,description){this._addLine(this._renderSequence(keys,Common.UIString.UIString('or')),description);}
_addLine(keyElement,description){this._lines.push({key:keyElement,text:description});}
renderSection(container){const parent=container.createChild('div','settings-block');const headLine=parent.createChild('div','settings-line');headLine.createChild('div','settings-key-cell');headLine.createChild('div','settings-section-title settings-cell').textContent=this.name;ARIAUtils.markAsHeading(headLine,2);for(let i=0;i<this._lines.length;++i){const line=parent.createChild('div','settings-line');const keyCell=line.createChild('div','settings-key-cell');keyCell.appendChild(this._lines[i].key);keyCell.appendChild(this._createSpan('settings-key-delimiter',':'));line.createChild('div','settings-cell').textContent=this._lines[i].text;}}
_renderSequence(sequence,delimiter){const delimiterSpan=this._createSpan('settings-key-delimiter',delimiter);return this._joinNodes(sequence.map(this._renderKey.bind(this)),delimiterSpan);}
_renderKey(key){const keyName=key.name;const plus=this._createSpan('settings-combine-keys','+');return this._joinNodes(keyName.split(' + ').map(this._createSpan.bind(this,'settings-key')),plus);}
_createSpan(className,textContent){const node=createElement('span');node.className=className;node.textContent=textContent;return node;}
_joinNodes(nodes,delimiter){const result=createDocumentFragment();for(let i=0;i<nodes.length;++i){if(i>0){result.appendChild(delimiter.cloneNode(true));}
result.appendChild(nodes[i]);}
return result;}}
ShortcutsSection._sequenceNumber=0;const ElementsPanelShortcuts={NavigateUp:[KeyboardShortcut.makeDescriptor(Keys.Up)],NavigateDown:[KeyboardShortcut.makeDescriptor(Keys.Down)],Expand:[KeyboardShortcut.makeDescriptor(Keys.Right)],Collapse:[KeyboardShortcut.makeDescriptor(Keys.Left)],EditAttribute:[KeyboardShortcut.makeDescriptor(Keys.Enter)],NextProperty:[KeyboardShortcut.makeDescriptor(Keys.Tab)],PreviousProperty:[KeyboardShortcut.makeDescriptor(Keys.Tab,Modifiers.Shift)],IncrementValue:[KeyboardShortcut.makeDescriptor(Keys.Up)],DecrementValue:[KeyboardShortcut.makeDescriptor(Keys.Down)],IncrementBy10:[KeyboardShortcut.makeDescriptor(Keys.PageUp),KeyboardShortcut.makeDescriptor(Keys.Up,Modifiers.Shift)],DecrementBy10:[KeyboardShortcut.makeDescriptor(Keys.PageDown),KeyboardShortcut.makeDescriptor(Keys.Down,Modifiers.Shift)],IncrementBy100:[KeyboardShortcut.makeDescriptor(Keys.PageUp,Modifiers.Shift)],DecrementBy100:[KeyboardShortcut.makeDescriptor(Keys.PageDown,Modifiers.Shift)],IncrementBy01:[KeyboardShortcut.makeDescriptor(Keys.Up,Modifiers.Alt)],DecrementBy01:[KeyboardShortcut.makeDescriptor(Keys.Down,Modifiers.Alt)]};const ConsolePanelShortcuts={AcceptSuggestion:[KeyboardShortcut.makeDescriptor(Keys.Tab),KeyboardShortcut.makeDescriptor(Keys.Right)],ClearConsolePrompt:[KeyboardShortcut.makeDescriptor('u',Modifiers.Ctrl)],ExecuteCommand:KeyboardShortcut.makeDescriptor(Keys.Enter),NextPreviousLine:[KeyboardShortcut.makeDescriptor(Keys.Down),KeyboardShortcut.makeDescriptor(Keys.Up)],NextPreviousCommand:[KeyboardShortcut.makeDescriptor('N',Modifiers.Alt),KeyboardShortcut.makeDescriptor('P',Modifiers.Alt)],};export const SourcesPanelShortcuts={SelectNextOccurrence:[KeyboardShortcut.makeDescriptor('d',Modifiers.CtrlOrMeta)],SoftUndo:[KeyboardShortcut.makeDescriptor('u',Modifiers.CtrlOrMeta)],GotoMatchingBracket:[KeyboardShortcut.makeDescriptor('m',Modifiers.Ctrl)],ToggleAutocompletion:[KeyboardShortcut.makeDescriptor(Keys.Space,Modifiers.Ctrl)],IncreaseCSSUnitByOne:[KeyboardShortcut.makeDescriptor(Keys.Up,Modifiers.Alt)],DecreaseCSSUnitByOne:[KeyboardShortcut.makeDescriptor(Keys.Down,Modifiers.Alt)],IncreaseCSSUnitByTen:[KeyboardShortcut.makeDescriptor(Keys.PageUp,Modifiers.Alt)],DecreaseCSSUnitByTen:[KeyboardShortcut.makeDescriptor(Keys.PageDown,Modifiers.Alt)],EvaluateSelectionInConsole:[KeyboardShortcut.makeDescriptor('e',Modifiers.Shift|Modifiers.Ctrl)],AddSelectionToWatch:[KeyboardShortcut.makeDescriptor('a',Modifiers.Shift|Modifiers.Ctrl)],ToggleComment:[KeyboardShortcut.makeDescriptor(Keys.Slash,Modifiers.CtrlOrMeta)],};export const LayersPanelShortcuts={ResetView:[KeyboardShortcut.makeDescriptor('0')],PanMode:[KeyboardShortcut.makeDescriptor('x')],RotateMode:[KeyboardShortcut.makeDescriptor('v')],TogglePanRotate:[KeyboardShortcut.makeDescriptor(Keys.Shift)],ZoomIn:[KeyboardShortcut.makeDescriptor(Keys.Plus,Modifiers.Shift),KeyboardShortcut.makeDescriptor(Keys.NumpadPlus)],ZoomOut:[KeyboardShortcut.makeDescriptor(Keys.Minus,Modifiers.Shift),KeyboardShortcut.makeDescriptor(Keys.NumpadMinus)],Up:[KeyboardShortcut.makeDescriptor(Keys.Up),KeyboardShortcut.makeDescriptor('w')],Down:[KeyboardShortcut.makeDescriptor(Keys.Down),KeyboardShortcut.makeDescriptor('s')],Left:[KeyboardShortcut.makeDescriptor(Keys.Left),KeyboardShortcut.makeDescriptor('a')],Right:[KeyboardShortcut.makeDescriptor(Keys.Right),KeyboardShortcut.makeDescriptor('d')]};