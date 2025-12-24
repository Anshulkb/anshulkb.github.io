/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library"],e=>{"use strict";const n={apiVersion:2};n.CSS_CLASS="sapUiMDCGeomap";n.render=function(e,t){e.openStart("div",t);e.class(n.CSS_CLASS);e.style("height",t.getHeight());e.style("width",t.getWidth());e.openEnd();const r=t.getHeader();if(r){e.openStart("div",t.getId()+"-header");e.openEnd();e.text(r);e.close("div")}n.renderInternalGeomap(e,t);e.close("div")};n.renderInternalGeomap=function(e,n){e.openStart("div",n.getId()+"-internal");e.class("sapUiMDCGeomapInternal");e.openEnd();e.renderControl(n.getAggregation("_geomap"));e.close("div")};n.renderContent=function(e,n){e.openStart("div",n.getId()+"-content");e.class("sapUiMDCGeomapInternal");e.openEnd();e.renderControl(n.getAggregation("content"));e.close("div")};n.renderInnerStructure=function(e,n){e.renderControl(n)};return n},true);
//# sourceMappingURL=GeomapRenderer.js.map