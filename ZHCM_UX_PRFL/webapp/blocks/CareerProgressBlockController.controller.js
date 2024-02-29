/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/Sorter","com/sedef/hcm/ux/myprofile/utils/reuseHandler","sap/suite/ui/commons/Timeline","sap/ui/core/format/DateFormat"],function(e,t,r,o,s,i,a,n){"use strict";return e.extend("com.sedef.hcm.ux.myprofile.blocks.CareerProgressBlockController",{onInit:function(){var e=i.getOwnerComponent().getModel("appProperties"),n=e.getProperty("/applicationController"),l=n.getAppNavProperties(),p=n.getAppEntities(),m=this.byId("careerProgressTimeline"),u=this.byId("careerProgressTemplateItem"),d=new t({busy:false});this.setModel(d,"CareerProgressView");this.oApplicationController=n;this.sEmployeeNumber=e.getProperty("/employeeId");if(a.getMetadata().hasProperty("groupByType")){m.setGroupByType(sap.suite.ui.commons.TimelineGroupType.Year)}m.addDependent(u);if(!n.navPropertyExists(p.EMPLOYEEDETAIL,l.CAREERPROGRESS)){sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile","employeeIdChanged",this.onEmployeeIdChange,this);m.bindAggregation("content",{path:"/CareerProgressSet",template:u,templateShareable:true,filters:new r("EmployeeNumber",o.EQ,this.sEmployeeNumber),sorter:new s("BeginDate",true),events:{dataRequested:this.onDataRequested.bind(this),dataReceived:this.onDataReceived.bind(this)}})}},onExit:function(){sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile","employeeIdChanged",this.onEmployeeIdChange,this)},onEmployeeIdChange:function(e,t,s){var i=this.byId("careerProgressTimeline").getBinding("content");i.filter(new r("EmployeeNumber",o.EQ,s.EmployeeId),sap.ui.model.FilterType.Application)},onDataRequested:function(){var e=this.getModel("CareerProgressView");this.oApplicationController.whenMetadataLoaded(function(){e.setProperty("/busy",true)})},onDataReceived:function(e){var t=this.getModel("CareerProgressView"),r=e.getParameter("data"),o=this.oApplicationController.getEmployeeDataModelForEmployeeId(this.sEmployeeNumber);o.setProperty("/bCareerProgressExist",!r.results||r.results&&r.results.length===0);t.setProperty("/busy",false)},formatDate:function(e){if(!e){e=new Date}var t=n.getDateInstance({style:"long"});return t.format(e)}})});
//# sourceMappingURL=CareerProgressBlockController.controller.js.map