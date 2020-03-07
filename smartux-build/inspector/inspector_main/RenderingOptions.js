import*as Common from'../common/common.js';import*as UI from'../ui/ui.js';export class RenderingOptionsView extends UI.Widget.VBox{constructor(){super(true);this.registerRequiredCSS('inspector_main/renderingOptions.css');this._appendCheckbox(ls`Paint flashing`,ls`Highlights areas of the page (green) that need to be repainted. May not be suitable for people prone to photosensitive epilepsy.`,self.Common.settings.moduleSetting('showPaintRects'));this._appendCheckbox(ls`Layout Shift Regions`,ls`Highlights areas of the page (blue) that were shifted. May not be suitable for people prone to photosensitive epilepsy.`,self.Common.settings.moduleSetting('showLayoutShiftRegions'));this._appendCheckbox(ls`Layer borders`,ls`Shows layer borders (orange/olive) and tiles (cyan).`,self.Common.settings.moduleSetting('showDebugBorders'));this._appendCheckbox(ls`FPS meter`,ls`Plots frames per second, frame rate distribution, and GPU memory.`,self.Common.settings.moduleSetting('showFPSCounter'));this._appendCheckbox(ls`Scrolling performance issues`,ls`Highlights elements (teal) that can slow down scrolling, including touch & wheel event handlers and other main-thread scrolling situations.`,self.Common.settings.moduleSetting('showScrollBottleneckRects'));this._appendCheckbox(ls`Highlight ad frames`,ls`Highlights frames (red) detected to be ads.`,self.Common.settings.moduleSetting('showAdHighlights'));this._appendCheckbox(ls`Hit-test borders`,ls`Shows borders around hit-test regions.`,self.Common.settings.moduleSetting('showHitTestBorders'));this.contentElement.createChild('div').classList.add('panel-section-separator');this._appendSelect(ls`Forces media type for testing print and screen styles`,self.Common.settings.moduleSetting('emulatedCSSMedia'));this._appendSelect(ls`Forces CSS prefers-color-scheme media feature`,self.Common.settings.moduleSetting('emulatedCSSMediaFeaturePrefersColorScheme'));this._appendSelect(ls`Forces CSS prefers-reduced-motion media feature`,self.Common.settings.moduleSetting('emulatedCSSMediaFeaturePrefersReducedMotion'));}
_appendCheckbox(label,subtitle,setting){const checkboxLabel=UI.UIUtils.CheckboxLabel.create(label,false,subtitle);UI.SettingsUI.bindCheckbox(checkboxLabel.checkboxElement,setting);this.contentElement.appendChild(checkboxLabel);}
_appendSelect(label,setting){const control=UI.SettingsUI.createControlForSetting(setting,label);if(control){this.contentElement.appendChild(control);}}}