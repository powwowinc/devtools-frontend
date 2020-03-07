import*as Common from'../common/common.js';import*as PlayerEventsView from'./EventDisplayTable.js';import*as PlayerPropertiesView from'./PlayerPropertiesView.js';import*as UI from'../ui/ui.js';import*as MediaModel from'./MediaModel.js';export const PlayerDetailViewTabs={Events:'events',Properties:'properties',};export class PlayerDetailView extends UI.TabbedPane.TabbedPane{constructor(){super();const eventView=new PlayerEventsView.PlayerEventsView();const propertyView=new PlayerPropertiesView.PlayerPropertiesView();this._panels=new Map([[MediaModel.MediaChangeTypeKeys.Property,[propertyView]],[MediaModel.MediaChangeTypeKeys.Event,[eventView]]]);this.appendTab(PlayerDetailViewTabs.Properties,Common.UIString.UIString('Properties'),propertyView,Common.UIString.UIString('Player properties'));this.appendTab(PlayerDetailViewTabs.Events,Common.UIString.UIString('Events'),eventView,Common.UIString.UIString('Player events'));}
renderChanges(playerID,changes,changeType){for(const panel of this._panels.get(changeType)){panel.renderChanges(playerID,changes,changeType);}}}