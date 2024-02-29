/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController","com/sedef/hcm/ux/myprofile/utils/formatter","com/sedef/hcm/ux/myprofile/utils/reuseHandler","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/Device","sap/ui/core/format/DateFormat"],function(e,t,o,i,n,r,a,s){"use strict";return e.extend("com.sedef.hcm.ux.myprofile.blocks.TrainingsBlockController",{formatter:t,onInit:function(){var e=this.byId("trainingsContainer"),t=this.byId("trainingTemplateItem"),s=o.getOwnerComponent().getModel("appProperties"),l=s.getProperty("/applicationController"),p=l.getAppNavProperties(),u=l.getAppEntities(),g=s.getProperty("/employeeId"),m=new i({busy:false,sDateRangeStyle:"long",sDateRangeFormat:"yMMMMEEEEd"});this.setModel(m,"TrainingView");this.oResourceBundle=o.getOwnerComponent().getModel("i18n").getResourceBundle();this.oApplicationModel=s;this.oApplicationController=l;this.sEmployeeNumber=g;this.sAggregationName=a.system.phone?"pages":"content";e.addDependent(t);if(!l.navPropertyExists(u.EMPLOYEEDETAIL,p.TRAININGS)){sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile","employeeIdChanged",this.onEmployeeIdChange,this);e.bindAggregation(this.sAggregationName,{path:"/TrainingSet",template:t,templateShareable:true,filters:new n("EmployeeNumber",r.EQ,g),events:{dataRequested:this.onDataRequested.bind(this),dataReceived:this.onDataReceived.bind(this)}})}},onExit:function(){sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile","employeeIdChanged",this.onEmployeeIdChange,this)},onEmployeeIdChange:function(e,t,o){var i=this.byId("trainingsContainer").getBinding(this.sAggregationName);i.filter(new n("EmployeeNumber",r.EQ,o.EmployeeId),sap.ui.model.FilterType.Application)},onDataRequested:function(){var e=this.getModel("TrainingView");this.oApplicationController.whenMetadataLoaded(function(){e.setProperty("/busy",true)})},onDataReceived:function(e){var t=this.getModel("TrainingView"),o=this.oApplicationController.getEmployeeDataModelForEmployeeId(this.sEmployeeNumber),i=e.getParameter("data");o.setProperty("/bTrainingsExist",!i.results||i.results&&i.results.length===0);t.setProperty("/busy",false)},formatNoTrainingsText:function(e){var t=this.oApplicationModel.getProperty("/oConfigData");if(t.TrainingsDuration){var i=s.getDateInstance({style:"long"}),n=o.calculateDateFromDuration(t.TrainingsDuration,"+");return jQuery.sap.formatMessage(e,[i.format(n)])}return this.oResourceBundle.getText("noTrainingsTxt")}})});
//# sourceMappingURL=TrainingsBlockController.controller.js.map