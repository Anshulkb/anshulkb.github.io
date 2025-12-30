/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Lib"],function(e){"use strict";var i=e.init({name:"sap.ui.export",apiVersion:2,dependencies:["sap.ui.core"],types:["sap.ui.export.Destination","sap.ui.export.EdmType","sap.ui.export.FileType","sap.ui.export.Status"],interfaces:[],controls:[],elements:[],version:"1.142.0"});i.EdmType={BigNumber:"BigNumber",Boolean:"Boolean",Currency:"Currency",Date:"Date",DateTime:"DateTime",Enumeration:"Enumeration",Number:"Number",Percentage:"Percentage",String:"String",Time:"Time",Timezone:"Timezone"};i.FileType={CSV:"CSV",GSHEET:"GSHEET",PDF:"PDF",XLSX:"XLSX"};i.Destination={LOCAL:"LOCAL",REMOTE:"REMOTE"};i.Status={FINISHED:"FINISHED",UPDATE:"UPDATE"};sap.ui.loader.config({shim:{"sap/ui/export/js/XLSXBuilder":{amd:true,exports:"XLSXBuilder"},"sap/ui/export/js/CSVBuilder":{amd:true,exports:"CSVBuilder"}}});return i});
//# sourceMappingURL=library.js.map