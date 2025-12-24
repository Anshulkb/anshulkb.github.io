/*
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ODataV4Selection","./PluginBase","../utils/TableUtils","../library"],function(t,e,i,o){"use strict";const n=t.extend("sap.ui.table.plugins.ODataV4SingleSelection",{metadata:{library:"sap.ui.table"}});n.findOn=e.findOn;n.prototype.onActivate=function(e){t.prototype.onActivate.apply(this,arguments);e.setProperty("selectionMode",o.SelectionMode.Single)};n.prototype.onDeactivate=function(e){t.prototype.onDeactivate.apply(this,arguments);e.setProperty("selectionMode",o.SelectionMode.None)};n.prototype.setSelected=function(t,e,o){const n=i.getBindingContextOfRow(t);if(!this.isActive()||!n||!this.isContextSelectable(n)||this.isSelected(t)===e){return}if(e){this.clearSelection()}n.setSelected(e)};n.prototype.validateSelection=function(e){t.prototype.validateSelection.apply(this,arguments);if(this.getSelectedCount()>1){throw new Error("Multiple contexts selected")}};n.prototype.getSelectedContext=function(){return this.getSelectedContexts()[0]};return n});
//# sourceMappingURL=ODataV4SingleSelection.js.map