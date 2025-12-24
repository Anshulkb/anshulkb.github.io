/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/field/FieldBaseDelegate","sap/ui/mdc/enums/ConditionValidated","sap/base/util/merge"],(i,e,t)=>{"use strict";const a=Object.assign({},i);a.updateItems=function(i,e,t){};a.updateItemsFromConditions=function(i,e){this.updateItems.apply(this,[i.getPayload(),e,i])};a.indexOfCondition=function(a,d,n,s){if(n.validated!==e.Validated){n=t({},n);n.validated=e.Validated}return i.indexOfCondition.call(this,a,d,n,s)};return a});
//# sourceMappingURL=MultiValueFieldDelegate.js.map