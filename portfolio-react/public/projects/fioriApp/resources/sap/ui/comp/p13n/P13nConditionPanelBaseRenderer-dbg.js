/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

sap.ui.define(['sap/ui/core/Renderer'], function (Renderer) {
    "use strict";

    return Renderer.extend("sap.ui.comp.p13n.P13nConditionPanelBaseRenderer", {
        apiVersion: 2,
        render: function (oRm, oControl) {
            oRm.openStart("section", oControl);
            oRm.class("sapMConditionPanel");
            oRm.openEnd();
            oRm.openStart("div");
            oRm.class("sapMConditionPanelContent");
            oRm.class("sapMConditionPanelBG");
            oRm.openEnd();
            oControl.getAggregation("content").forEach(function (oChildren) {
                oRm.renderControl(oChildren);
            });
            oRm.close("div");
            oRm.close("section");
        }
    });
});
