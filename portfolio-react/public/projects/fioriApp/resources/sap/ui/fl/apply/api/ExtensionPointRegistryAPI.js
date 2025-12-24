/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/extensionPoint/Registry","sap/ui/fl/apply/_internal/init"],function(n){"use strict";var t={getExtensionPointInfo(t){return n.getExtensionPointInfo(t.name,t.view)},getExtensionPointInfoByViewId(t){return n.getExtensionPointInfoByViewId(t.viewId)},getExtensionPointInfoByParentId(t){return n.getExtensionPointInfoByParentId(t.parentId)},addCreatedControlsToExtensionPointInfo(t){n.addCreatedControls(t.name,t.viewId,t.createdControlsIds)}};return t});
//# sourceMappingURL=ExtensionPointRegistryAPI.js.map