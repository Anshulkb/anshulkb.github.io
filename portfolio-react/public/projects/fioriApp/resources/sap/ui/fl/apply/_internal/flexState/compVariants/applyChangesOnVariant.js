/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log"],function(e){"use strict";var t={addFavorite(e){e.setFavorite(true)},removeFavorite(e){e.setFavorite(false)},updateVariant(e,t){var n=t.getContent();if(n.executeOnSelection!==undefined){e.setExecuteOnSelection(n.executeOnSelection)}if(n.favorite!==undefined){e.setFavorite(n.favorite)}if(n.contexts){e.setContexts(n.contexts)}if(n.visible!==undefined){e.setVisible(n.visible)}if(n.variantContent){e.setContent(n.variantContent,true)}var i=t.getText("variantName");if(i){e.setName(i,true)}},standardVariant(e,t){e.setExecuteOnSelection(t.getContent().executeOnSelect)}};function n(t,n){e.error(`No change handler for change with the ID '${n.getId()}' and type '${n.getChangeType()}' defined.\n\t\t\tThe variant '${t.getId()}'was not modified'`)}return(e,i=[])=>{i.forEach(function(i){var a=t[i.getChangeType()]||n;a(e,i)})}});
//# sourceMappingURL=applyChangesOnVariant.js.map