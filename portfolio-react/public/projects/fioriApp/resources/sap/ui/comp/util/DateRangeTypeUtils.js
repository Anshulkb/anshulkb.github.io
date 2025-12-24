/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/config/condition/DateRangeType"],function(e){"use strict";var t={_calculateDateRangeValues:function({columnKey:t,dateFormatSettings:n,conditionTypeInfo:i,fieldViewMetadata:o}){const a=Object.assign({},o,{ui5Type:o.modelType});if(!i){return null}const l={_oDateFormatSettings:n||{UTC:true},_getType:()=>a.ui5Type,_createFilterControlId:()=>"fakeFilterControlId"},u=new e(t,l,a);u.getControls=()=>{};u.initialize({items:[],value:null});u.setCondition(i);const r=u.getFilterRanges();if(r&&r.length>0){return{oValue1:r[0].value1,oValue2:r[0].value2}}u?.destroy?.();return null}};return t});
//# sourceMappingURL=DateRangeTypeUtils.js.map