/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController","com/sedef/hcm/ux/myprofile/utils/formatter","com/sedef/hcm/ux/myprofile/utils/reuseHandler","com/sedef/hcm/ux/myprofile/controller/ErrorHandler","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/format/DateFormat"],function(e,t,o,r,n,s,i,a){"use strict";return e.extend("com.sedef.hcm.ux.myprofile.blocks.AbsenceBlockController",{formatter:t,onInit:function(){var e=this.getView(),t=o.getOwnerComponent(),r=t.getModel("appProperties"),s=r.getProperty("/employeeId"),i=r.getProperty("/applicationController"),a=i.getAppNavProperties(),l=i.getAppEntities(),p=new n({busy:false,sDateRangeStyle:"long",sDateRangeFormat:"yMMMMd"});this.setModel(p,"AbsenceView");this.oApplicationController=i;this.oResourceBundle=o.getOwnerComponent().getModel("i18n").getResourceBundle();if(i.navPropertyExists(l.EMPLOYEEDETAIL,a.ABSENCE)){e.bindElement(a.ABSENCE)}else{sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile","employeeIdChanged",this.onEmployeeIdChange,this);i.whenMetadataLoaded(function(){p.setProperty("/busy",true);this._bindView(s)}.bind(this))}},onExit:function(){sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile","employeeIdChanged",this.onEmployeeIdChange,this)},onEmployeeIdChange:function(e,t,o){this._bindView(o.EmployeeId)},onNavToMyLeave:function(){this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().LEAVEREQUEST.target)},formatAbsenceDateRangeSecondStat:function(e,r,n,s){if(!e){var i=o.getOwnerComponent().getModel("appProperties").getProperty("/oConfigData");if(i.AbsenceDuration){var l=a.getDateInstance({style:"long"}),p=o.calculateDateFromDuration(i.AbsenceDuration,"+");return jQuery.sap.formatMessage(s,[l.format(p)])}return""}else{var c=this.getModel("AbsenceView");return t.formatDateRange(r,n,c.getProperty("/sDateRangeStyle"),c.getProperty("/sDateRangeFormat"))}},_bindView:function(e){var t=this.oApplicationController.getEmployeeDataModelForEmployeeId(e),o=this.getView(),r=this.getModel("AbsenceView"),a=[new s("EmployeeNumber",i.EQ,e)],l=function(e){if(!e.results||e.results&&e.results.length===0){t.setProperty("/bAbsenceExists",false)}else{t.setProperty("/bAbsenceExists",true);o.setModel(new n({AbsenceData:e.results[0]}));o.bindElement("/AbsenceData")}r.setProperty("/busy",false)};this.oApplicationController.getODataHelper().read("/AbsenceSet",l,a)}})});
//# sourceMappingURL=AbsenceBlockController.controller.js.map