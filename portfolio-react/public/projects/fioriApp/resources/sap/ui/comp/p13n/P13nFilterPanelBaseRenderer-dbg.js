
/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(['sap/ui/core/Renderer'], function (Renderer) {
	"use strict";
	return Renderer.extend("sap.ui.comp.p13n.P13nFilterPanelRenderer", {
		apiVersion: 2,
		render: function (oRm, oControl) {
			oRm.openStart("section", oControl);
			oRm.class("sapMFilterPanel");
			oRm.openEnd();
			oRm.openStart("div");
			oRm.class("sapMFilterPanelContent");
			oRm.class("sapMFilterPanelBG");
			oRm.openEnd();
			oControl.getAggregation("content").forEach(function (oChildren) {
				oRm.renderControl(oChildren);
			});
			oRm.close("div");
			oRm.close("section");
		}
	});
});
