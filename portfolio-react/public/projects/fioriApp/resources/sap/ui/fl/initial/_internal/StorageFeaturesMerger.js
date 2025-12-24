/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge","sap/ui/fl/Layer","sap/base/Log"],function(e,n,i){"use strict";function r(e){var i={};var r=!!e.features.isVersioningEnabled;if(e?.layers&&(e.layers.includes(n.CUSTOMER)||e.layers.includes("ALL"))){i[n.CUSTOMER]=r}return i}return{mergeResults(s){var a={};s.forEach(function(s){Object.keys(s.features).forEach(function(e){if(e==="isKeyUser"&&s.features.isKeyUser!==undefined&&![n.CUSTOMER,"ALL"].some(e=>s.layers.includes(e))){i.warning("removed a layer specific setting from a connector not configure for the specific layer");return}if(e!=="isVersioningEnabled"){a[e]=s.features[e]}});a.versioning=e(a.versioning||{},r(s));if(s.isContextSharingEnabled!==undefined){a.isContextSharingEnabled=s.isContextSharingEnabled}});return a}}});
//# sourceMappingURL=StorageFeaturesMerger.js.map