/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../../GeomapDelegate","sap/ui/mdc/odata/v4/TypeMap"],(e,t)=>{"use strict";const r=Object.assign({},e);r.getTypeMap=function(e){return t};r._createMDCChartItem=function(e,t,r){return this._getPropertyInfosByName(e,t).then(e=>{if(!e){return null}return this._createMDCItemFromProperty(e,t.getId(),r)})};return r});
//# sourceMappingURL=GeomapDelegate.js.map