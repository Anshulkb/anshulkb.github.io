/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],()=>{"use strict";const e={apiVersion:2};e.CSS_CLASS="sapUiMdcFilterBarBase";e.render=function(t,r){t.openStart("div",r);t.class(e.CSS_CLASS);if(r.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar")&&r.getProperty("_useFixedWidth")){t.style("width",r.getWidth())}t.openEnd();r.getAggregation("invisibleTexts")?.forEach(e=>t.renderControl(e));const i=r.getAggregation("layout")?r.getAggregation("layout").getInner():null;t.renderControl(i);t.close("div")};return e},true);
//# sourceMappingURL=FilterBarBaseRenderer.js.map