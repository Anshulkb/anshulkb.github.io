/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/actiontoolbar/ActionToolbarAction","../Util","sap/m/designtime/MenuButton.designtime"],(e,n,t)=>{"use strict";const i={description:"{description}",name:"{name}",aggregations:{action:{propagateMetadata:function(e){if(e.isA("sap.m.MenuButton")){return{actions:{remove:null,reveal:null,split:{CAUTION_variantIndependent:true},combine:{CAUTION_variantIndependent:true}}}}return{actions:{rename:{changeType:"rename",domRef:function(e){return e.$()},CAUTION_variantIndependent:true},remove:null,reveal:null,combine:{CAUTION_variantIndependent:true}}}}}},properties:{},actions:{}};const a=["action"];const r=[];return n.getDesignTime(e,r,a,i)});
//# sourceMappingURL=ActionToolbarAction.designtime.js.map