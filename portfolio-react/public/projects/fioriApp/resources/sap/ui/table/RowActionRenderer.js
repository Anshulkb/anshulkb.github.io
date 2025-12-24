/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library"],function(e){"use strict";const t={apiVersion:2};t.render=function(t,i){t.openStart("div",i);t.class("sapUiTableAction");if(!i.getRow()){t.style("display","none")}if(!i.getVisible()){t.class("sapUiTableActionHidden")}const o=i.getTooltip_AsString();if(o){t.attr("title",o)}t.openEnd();const s=[];const l=[];i._getVisibleItems().forEach(t=>{t.getType()===e.RowActionType.Navigation?l.push(t):s.push(t)});if(i._getSize()>=s.length+l.length){s.forEach(e=>{n(t,e)});l.forEach(e=>{n(t,e)})}else{const e=Math.max(0,i._getSize()-l.length-1);for(let i=0;i<e;i++){n(t,s[i])}const o=i._getOverflowIcon(s,l,e);t.renderControl(o);for(let e=0;e<Math.min(l.length,i._getSize()-1);e++){n(t,l[e])}}t.close("div")};function n(e,t){const n=t._getIcon();n.addStyleClass("sapUiTableActionIcon");e.renderControl(n)}return t},true);
//# sourceMappingURL=RowActionRenderer.js.map