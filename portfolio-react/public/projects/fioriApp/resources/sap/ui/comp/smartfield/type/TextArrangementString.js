/*
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/smartfield/type/TextArrangement","sap/ui/comp/smartfield/type/StringNullable","sap/ui/model/ValidateException"],function(t,e,r){"use strict";var i=t.extend("sap.ui.comp.smartfield.type.TextArrangementString");i.prototype.getName=function(){return"sap.ui.comp.smartfield.type.TextArrangementString"};i.prototype.validateValue=function(e){var i=this.oConstraints||{},n=i.maxLength,a=e[0],o=!a&&this.oSmartField&&this.oSmartField.getMandatory();if(this.oFormatOptions?.textArrangement==="descriptionOnly"&&(o||a?.length>n)){throw new r(this.getResourceBundleText("ENTER_A_VALID_VALUE"))}return t.prototype.validateValue.apply(this,arguments)};i.prototype.getPrimaryType=function(){return e};return i});
//# sourceMappingURL=TextArrangementString.js.map