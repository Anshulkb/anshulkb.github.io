/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Lib","sap/ui/VersionInfo","sap/ui/core/Core","sap/ui/base/Object"],(i,t,a,n)=>{"use strict";const e={};e.checkValidationExceptions=function(){if(this.bValidationException===null||this.bValidationException===undefined){this.bValidationException=this._checkValidationExceptions()}return this.bValidationException};e._checkValidationExceptions=function(){const t=["sap.fe.core","sap.fe.macros","sap.sac.df"];const n=t.filter(t=>i.isLoaded(t));const e=window["sap-ui-mdc-config"]&&window["sap-ui-mdc-config"].disableStrictPropertyInfoValidation;const o=new URLSearchParams(window.location.search).get("sap-ui-xx-disableStrictPropertyValidation")=="true";const c=n.includes("sap.fe.core")||n.includes("sap.fe.macros");const s=n.includes("sap.sac.df");const r=new URLSearchParams(window.location.search).get("sap-ui-xx-enableStrictPropertyValidation")=="true";const d="attachInit"in a;return(e||o||c||s)&&!r&&d};return e});
//# sourceMappingURL=PropertyHelperUtil.js.map