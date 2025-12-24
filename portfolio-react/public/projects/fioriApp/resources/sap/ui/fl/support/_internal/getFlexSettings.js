/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/initial/_internal/Settings","sap/ui/fl/Utils"],function(t,e){"use strict";async function n(){const e=await t.getInstance();return Object.entries(e.getMetadata().getProperties()).map(function([t,n]){let i=e[n._sGetter]();if(t==="versioning"){i=i.CUSTOMER||i.ALL}return{key:t,value:i}})}return async function(t){if(!t){const t=await e.getUShellService("AppLifeCycle");return n(t.getCurrentApplication().componentInstance)}return n(t)}});
//# sourceMappingURL=getFlexSettings.js.map