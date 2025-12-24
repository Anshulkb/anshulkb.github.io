/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Renderer"],function(n){"use strict";return n.extend("sap.ui.comp.p13n.P13nConditionPanelBaseRenderer",{apiVersion:2,render:function(n,e){n.openStart("section",e);n.class("sapMConditionPanel");n.openEnd();n.openStart("div");n.class("sapMConditionPanelContent");n.class("sapMConditionPanelBG");n.openEnd();e.getAggregation("content").forEach(function(e){n.renderControl(e)});n.close("div");n.close("section")}})});
//# sourceMappingURL=P13nConditionPanelBaseRenderer.js.map