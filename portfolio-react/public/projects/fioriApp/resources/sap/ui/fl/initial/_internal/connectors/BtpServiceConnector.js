/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge","sap/ui/fl/initial/_internal/connectors/KeyUserConnector","sap/ui/fl/initial/_internal/connectors/Utils","sap/ui/fl/Layer"],function(e,n,t,a){"use strict";var i="/flex/all";var s="/v3";const r=`${i}${s}`;const l=e({},n,{layers:[a.CUSTOMER,a.PUBLIC,a.USER],ROOT:r,ROUTES:{DATA:`${r}/data`,VARIANTDATA:`${r}/variantdata`,SETTINGS:`${r}/settings`},loadFeatures(e){return n.loadFeatures.call(this,e).then(function(e){e.isCondensingEnabled=e.isCondensingEnabledOnBtp;delete e.isCondensingEnabledOnBtp;e.isLocalResetEnabled=e.isLocalResetEnabledOnBtp;delete e.isLocalResetEnabledOnBtp;return e})},loadFlVariant(e){const n={id:e.variantReference,version:e.version};if(this.isLanguageInfoRequired){t.addLanguageInfo(n)}const a=t.getUrl(this.ROUTES.VARIANTDATA,e,n);return t.sendRequest(a,"GET",{initialConnector:this}).then(function(e){return e.response})}});return l});
//# sourceMappingURL=BtpServiceConnector.js.map