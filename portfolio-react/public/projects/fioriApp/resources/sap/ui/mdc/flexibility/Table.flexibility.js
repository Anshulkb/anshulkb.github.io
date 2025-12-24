/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./SortFlex","./ColumnFlex","./ConditionFlex","./GroupFlex","./AggregateFlex","./xConfigFlex"],(e,o,r,t,n,d)=>{"use strict";return{hideControl:"default",unhideControl:"default",addColumn:o.addColumn,removeColumn:o.removeColumn,moveColumn:o.moveColumn,removeSort:e.removeSort,addSort:e.addSort,moveSort:e.moveSort,addCondition:r.addCondition,removeCondition:r.removeCondition,removeGroup:t.removeGroup,addGroup:t.addGroup,moveGroup:t.moveGroup,removeAggregate:n.removeAggregate,addAggregate:n.addAggregate,setColumnWidth:d.createSetChangeHandler({aggregation:"columns",property:"width"}),setShowDetails:d.createSetChangeHandler({aggregation:"type",property:"showDetails"}),setFixedColumnCount:d.createSetChangeHandler({aggregation:"type",property:"fixedColumnCount"})}});
//# sourceMappingURL=Table.flexibility.js.map