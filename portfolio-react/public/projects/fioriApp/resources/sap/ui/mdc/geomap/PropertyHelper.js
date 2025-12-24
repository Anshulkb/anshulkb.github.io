/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../util/PropertyHelper","sap/ui/core/Lib"],(t,e)=>{"use strict";const p=t.extend("sap.ui.mdc.geomap.PropertyHelper",{constructor:function(e,p){t.call(this,e,p,{propertyInfos:true})}});p.prototype.prepareProperty=function(e,p){if(!e.path&&e.propertyPath){e.path=e.propertyPath}if(!e.typeConfig&&e.dataType){const t=e.formatOptions?e.formatOptions:null;const p=e.constraints?e.constraints:{};e.typeConfig=this.getParent().getTypeMap().getTypeConfig(e.dataType,t,p)}t.prototype.prepareProperty.apply(this,arguments);e.isAggregatable=function(){if(e){return e.isComplex()?false:e.aggregatable}}};return p});
//# sourceMappingURL=PropertyHelper.js.map