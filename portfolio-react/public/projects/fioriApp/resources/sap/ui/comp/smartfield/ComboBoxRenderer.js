/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/m/ComboBoxRenderer","sap/ui/core/Renderer"],function(e,t){"use strict";const n=t.extend(e);n.apiVersion=2;const r=new RegExp("^0*$");n.writeInnerValue=function(e,t){let n=t.getValue();if(r.test(n)){n=""}e.attr("value",n)};return n},true);
//# sourceMappingURL=ComboBoxRenderer.js.map