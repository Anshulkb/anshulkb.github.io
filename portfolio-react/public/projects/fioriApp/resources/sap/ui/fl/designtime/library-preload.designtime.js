//@ui5-bundle sap/ui/fl/designtime/library-preload.designtime.js
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/library.designtime", [],function(){"use strict";return{}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/util/IFrame.designtime", ["sap/ui/fl/designtime/util/editIFrame"],function(e){"use strict";return{actions:{settings(){return{icon:"sap-icon://write-new",name:"CTX_EDIT_IFRAME",isEnabled:true,handler:e}},remove:{changeType:"hideControl"},reveal:{changeType:"unhideControl"}},properties:{url:{ignore:true},width:{ignore:true},height:{ignore:true},title:{ignore:true},asContainer:{ignore:true},renameInfo:{ignore:true},advancedSettings:{ignore:true},_settings:{ignore:true}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/util/editIFrame", ["sap/base/util/restricted/_isEqual","sap/base/util/deepClone","sap/ui/core/Element","sap/ui/rta/plugin/iframe/AddIFrameDialog"],function(e,t,i,a){"use strict";return async function n(r){const s=new a;const d=r.get_settings();const c=r.getRenameInfo();if(c){const e=i.getElementById(c.sourceControlId);d.title=e.getProperty(c.propertyName)}const l=await a.buildUrlBuilderParametersFor(r);const o={parameters:l,frameUrl:d.url,frameWidth:d.width,frameHeight:d.height,title:d.title,asContainer:!!d.title,advancedSettings:t(d.advancedSettings),updateMode:true};const h=await s.open(o,r);if(!h){return[]}const u=[];let g=false;const f={url:d.url,height:d.height,width:d.width,advancedSettings:d.advancedSettings};if(h.frameHeight+h.frameHeightUnit!==d.height){g=true;f.height=h.frameHeight+h.frameHeightUnit}if(h.frameWidth+h.frameWidthUnit!==d.width){g=true;f.width=h.frameWidth+h.frameWidthUnit}if(h.frameUrl!==d.url){g=true;f.url=h.frameUrl}if(!e(h.advancedSettings,d.advancedSettings)){g=true;f.advancedSettings=h.advancedSettings}if(g){u.push({selectorControl:r,changeSpecificData:{changeType:"updateIFrame",content:f}})}if(h.title!==d.title){const e={selectorControl:i.getElementById(c.selectorControlId),changeSpecificData:{changeType:"rename",content:{value:h.title}}};u.push(e)}return u}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/variants/VariantManagement.designtime", ["sap/ui/core/Lib","sap/ui/fl/apply/api/ControlVariantApplyAPI","sap/ui/fl/Utils"],function(e,t,r){"use strict";async function a(e,a){var o=r.getAppComponentForControl(e);var n=e.getId();var i=o.getModel(t.getVariantModelName());var s=o.getLocalId(n)||n;if(!i){return}if(a){await e.waitForInit();i.setModelPropertiesForControl(s,a,e);i.checkUpdate(true)}else{i.setModelPropertiesForControl(s,a,e);i.checkUpdate(true)}}return{annotations:{},properties:{showSetAsDefault:{ignore:false},inErrorState:{ignore:false},editable:{ignore:false},modelName:{ignore:false},updateVariantInURL:{ignore:true},resetOnContextChange:{ignore:true},executeOnSelectionForStandardDefault:{ignore:false},displayTextForExecuteOnSelectionForStandardVariant:{ignore:false},headerLevel:{ignore:false}},variantRenameDomRef(e){return e.getTitle().getDomRef("inner")},customData:{},tool:{start(e){var t=true;a(e,t);e.enteringDesignMode()},stop(e){var t=false;a(e,t);e.leavingDesignMode()}},actions:{controlVariant(t){return{validators:["noEmptyText",{validatorFunction(e){return!t.getVariants().some(function(r){if(r.getKey()===t.getCurrentVariantKey()){return false}return e.toLowerCase()===r.getTitle().toLowerCase()&&r.getVisible()})},errorMessage:e.getResourceBundleFor("sap.m").getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE")}]}}}}});
//# sourceMappingURL=library-preload.designtime.js.map
