/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Renderer"],function(e){"use strict";return e.extend("sap.ui.comp.p13n.P13nFilterPanelRenderer",{apiVersion:2,render:function(e,n){e.openStart("section",n);e.class("sapMFilterPanel");e.openEnd();e.openStart("div");e.class("sapMFilterPanelContent");e.class("sapMFilterPanelBG");e.openEnd();n.getAggregation("content").forEach(function(n){e.renderControl(n)});e.close("div");e.close("section")}})});
//# sourceMappingURL=P13nFilterPanelBaseRenderer.js.map