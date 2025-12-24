//@ui5-bundle sap/ui/mdc/designtime/library-preload.designtime.js
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/Util", [],()=>{"use strict";function e(){return{actions:{},aggregations:{},description:"{description}",name:"{name}",properties:{}}}function t(e,t,i){const n=e.includes(t);const r=n&&i[t]||{};if(!Object.keys(r).length){r[t]={ignore:!n};Object.assign(i,r)}}return{getDesignTime:function(i,n,r,s){s=s?s:e();s.actions=s.actions?s.actions:{};s.properties=s.properties?s.properties:{};s.aggregations=s.aggregations?s.aggregations:{};n=n?n:[];r=r?r:[];const g=i.getMetadata(),o=Object.keys(g.getAllProperties()).concat(Object.keys(g.getAllPrivateProperties())),a=Object.keys(g.getAllAggregations()).concat(Object.keys(g.getAllPrivateAggregations()));o.forEach(e=>{t(n,e,s.properties)});a.forEach(e=>{t(r,e,s.aggregations)});return s}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/actiontoolbar/ActionToolbar.designtime", ["sap/ui/mdc/ActionToolbar","sap/m/p13n/Engine","../Util"],(n,t,e)=>{"use strict";const a={description:"{description}",name:"{name}",aggregations:{between:{propagateMetadata:function(n){if(n.isA("sap.ui.fl.variants.VariantManagement")){return null}return{actions:"not-adaptable"}}},actions:{propagateRelevantContainer:true}},properties:{},actions:{settings:{"sap.ui.mdc":{name:"actiontoolbar.RTA_SETTINGS_NAME",handler:function(n,e){return t.getInstance().getRTASettingsActionHandler(n,e,"actionsKey").then(n=>n)},CAUTION_variantIndependent:true}}}},i=["actions","between"],r=[];return e.getDesignTime(n,r,i,a)});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/actiontoolbar/ActionToolbarAction.designtime", ["sap/ui/mdc/actiontoolbar/ActionToolbarAction","../Util","sap/m/designtime/MenuButton.designtime"],(e,n,t)=>{"use strict";const i={description:"{description}",name:"{name}",aggregations:{action:{propagateMetadata:function(e){if(e.isA("sap.m.MenuButton")){return{actions:{remove:null,reveal:null,split:{CAUTION_variantIndependent:true},combine:{CAUTION_variantIndependent:true}}}}return{actions:{rename:{changeType:"rename",domRef:function(e){return e.$()},CAUTION_variantIndependent:true},remove:null,reveal:null,combine:{CAUTION_variantIndependent:true}}}}}},properties:{},actions:{}};const a=["action"];const r=[];return n.getDesignTime(e,r,a,i)});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/chart/Chart.designtime", ["sap/m/p13n/Engine","sap/ui/mdc/Chart","../Util"],(e,n,t)=>{"use strict";const i={actions:{settings:{"sap.ui.mdc":function(n){return e.getInstance()._runWithPersistence(n,n=>({name:"p13nDialog.VIEW_SETTINGS",handler:function(n,t){const i=n.getP13nMode();const r=i.indexOf("Type");if(r>-1){i.splice(r,1)}if(n.isPropertyHelperFinal()){return e.getInstance().getRTASettingsActionHandler(n,t,i)}else{return n.finalizePropertyHelper().then(()=>e.getInstance().getRTASettingsActionHandler(n,t,i))}},CAUTION_variantIndependent:n}))}}},aggregations:{_toolbar:{propagateMetadata:function(e){return null}}}};const r=["_toolbar"],a=["headerLevel","headerVisible"];return t.getDesignTime(n,a,r,i)});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/field/Field.designtime", ["sap/ui/core/Element","sap/ui/fl/Utils","sap/ui/fl/apply/api/FlexRuntimeInfoAPI","sap/m/p13n/Engine","sap/ui/core/Lib"],(e,t,n,o,r)=>{"use strict";const i=r.getResourceBundleFor("sap.ui.mdc");return{properties:{value:{ignore:true},additionalValue:{ignore:true}},getStableElements:function(n){if(!n?.getFieldInfo()){return[]}const o=n.getFieldInfo();let r=typeof o.getSourceControl()==="string"?e.getElementById(o.getSourceControl()):o.getSourceControl();if(!r){r=n}const i=t.getAppComponentForControl(r)||t.getAppComponentForControl(n);const l=o.getControlDelegate().getPanelId(o);return[{id:l,appComponent:i}]},actions:{settings:{"sap.ui.mdc":{name:i.getText("info.POPOVER_DEFINE_LINKS"),isEnabled:e=>!!e.getFieldInfo(),handler:function(e,r){const i=e.getFieldInfo();return i.getContent().then(l=>{i.addDependent(l);return n.waitForChanges({element:l}).then(()=>{r.fnAfterClose=function(){l.destroy()};const i=function(){return o.getInstance().getRTASettingsActionHandler(l,r,"LinkItems").then(n=>{n.forEach(n=>{const o=n.selectorElement;delete n.selectorElement;const r=t.getAppComponentForControl(e);n.selectorControl={id:typeof o==="string"?o:o.getId(),controlType:o===l?l.getMetadata().getName():"sap.ui.mdc.link.PanelItem",appComponent:r}});return n})};const s=l.getItems();if(s.length>0){return n.waitForChanges({selectors:s}).then(()=>i())}else{return i()}})})},CAUTION_variantIndependent:true}}},tool:{start:function(e){e.getFieldInfo()?.setEnablePersonalization(false)},stop:function(e){e.getFieldInfo()?.setEnablePersonalization(true)}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/field/FieldBase.designtime", ["sap/ui/mdc/field/FieldBase","../Util"],(e,i)=>{"use strict";const s={};const t=[],n=[];return i.getDesignTime(e,n,t,s)});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/field/FilterField.designtime", [],()=>{"use strict";return{properties:{operators:{ignore:true},defaultOperator:{ignore:true}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/field/MultiValueField.designtime", [],()=>{"use strict";return{properties:{delegate:{ignore:true}},aggregations:{items:{ignore:true}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/filterbar/FilterBar.designtime", ["sap/m/p13n/Engine"],e=>{"use strict";return{actions:{settings:{"sap.ui.mdc":function(t){return e.getInstance()._runWithPersistence(t,t=>({name:"filterbar.ADAPT_TITLE",handler:function(t,n){return t.initializedWithMetadata().then(()=>e.getInstance().getRTASettingsActionHandler(t,n,"Item"))},CAUTION_variantIndependent:t}))}}},aggregations:{layout:{ignore:true},basicSearchField:{ignore:true},filterItems:{ignore:true}},properties:{showAdaptFiltersButton:{ignore:false},showClearButton:{ignore:false},p13nMode:{ignore:false}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/filterbar/FilterBarBase.designtime", [],()=>{"use strict";return{properties:{showGoButton:{ignore:false},delegate:{ignore:true},liveMode:{ignore:false},showMessages:{ignore:false},filterConditions:{ignore:true},propertyInfo:{ignore:true},suspendSelection:{ignore:true}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/geomap/Geomap.designtime", ["sap/ui/mdc/Geomap","../Util"],(e,i)=>{"use strict";const s={actions:{},aggregations:{}};const t=["items"],a=["header","zoom"];return i.getDesignTime(e,a,t,s)});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/library.designtime", [],()=>{"use strict";return{}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/mdc/designtime/table/Table.designtime", ["sap/m/p13n/Engine","sap/ui/mdc/Table","../Util"],(e,t,n)=>{"use strict";const i={name:"{name}",description:"{description}",actions:{settings:{"sap.ui.mdc":function(t){return e.getInstance()._runWithPersistence(t,t=>({name:"p13nDialog.VIEW_SETTINGS",handler:function(t,n){return t.finalizePropertyHelper().then(()=>e.getInstance().getRTASettingsActionHandler(t,n,t.getActiveP13nModes()))},CAUTION_variantIndependent:t}))}}},properties:{},aggregations:{_content:{domRef:":sap-domref",propagateMetadata:function(e){if(e.isA("sap.ui.fl.variants.VariantManagement")||e.isA("sap.ui.mdc.ActionToolbar")||e.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")||e.isA("sap.ui.mdc.Field")||e.getParent()&&(e.getParent().isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")||e.getParent().isA("sap.ui.mdc.Field"))){return null}return{actions:"not-adaptable"}}}}};const a=["width","headerLevel","header","headerVisible","showRowCount","threshold","enableExport","busyIndicatorDelay","enableColumnResize","showPasteButton","multiSelectMode"],o=["_content"];return n.getDesignTime(t,a,o,i)});
//# sourceMappingURL=library-preload.designtime.js.map
