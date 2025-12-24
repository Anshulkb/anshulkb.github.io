/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define([
	'sap/m/ComboBoxRenderer',
	'sap/ui/core/Renderer'
	],
	function(
		ComboBoxBaseRenderer,
		Renderer
	) {
		"use strict";

		/**
		 * Defines a custom renderer for the <code>ComboBox</code> control.
		 *
		 * @namespace sap.ui.comp.smartfield.ComboBoxRenderer
		 */
		const ComboBoxRenderer = Renderer.extend(ComboBoxBaseRenderer);
		ComboBoxRenderer.apiVersion = 2;

		const rZero = new RegExp("^0*$");

		ComboBoxRenderer.writeInnerValue = function (oRm, oControl) {
			let sValue = oControl.getValue();

			// SNOW: DINC0496338 We should not show zeroes as a value
			if (rZero.test(sValue)) {
				sValue = "";
			}

			oRm.attr("value", sValue);
		};

		return ComboBoxRenderer;

	}, /* bExport= */ true);
