/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/changes/UIChangesState","sap/ui/fl/initial/_internal/ManifestUtils","sap/ui/fl/Utils"],function(n,e,t){"use strict";function i(t){const i=t.oContainer.getComponentInstance();const a=e.getFlexReferenceForControl(i);return n.getAllUIChanges(a)}return async function(n){if(!n){const n=await t.getUShellService("AppLifeCycle");return i(n.getCurrentApplication().componentInstance)}return i(n)}});
//# sourceMappingURL=getAllUIChanges.js.map