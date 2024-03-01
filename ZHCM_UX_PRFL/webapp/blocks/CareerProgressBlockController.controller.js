/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"sap/suite/ui/commons/Timeline",
	"sap/ui/core/format/DateFormat"
], function(BaseController, JSONModel, Filter, FilterOperator, Sorter, reuseHandler, Timeline,DateFormat) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.CareerProgressBlockController", {

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oApplicationModel = reuseHandler.getOwnerComponent().getModel("appProperties"),
				oApplicationController = oApplicationModel.getProperty("/applicationController"),
				mNavProps = oApplicationController.getAppNavProperties(),
				mEntities = oApplicationController.getAppEntities(),
				oTimeline = this.byId("careerProgressTimeline"),
				oTemplate = this.byId("careerProgressTemplateItem"),
				oViewModel = new JSONModel({
					busy: false
				});
			this.setModel(oViewModel, "CareerProgressView");

			this.oApplicationController = oApplicationController;
			this.sEmployeeNumber = oApplicationModel.getProperty("/employeeId");
			
			if (Timeline.getMetadata().hasProperty("groupByType")) {
				oTimeline.setGroupByType(sap.suite.ui.commons.TimelineGroupType.Year);
			}
			
			oTimeline.addDependent(oTemplate);

			if (!oApplicationController.navPropertyExists(mEntities.EMPLOYEEDETAIL, mNavProps.CAREERPROGRESS)) {
				// register event handler for the "employeeIdChanged" event
				sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);

				oTimeline.bindAggregation("content", {
					path: "/CareerProgressSet",
					template: oTemplate,
					templateShareable: true,
					filters: new Filter("EmployeeNumber", FilterOperator.EQ, this.sEmployeeNumber),
					sorter: new Sorter("BeginDate", true),
					events: {
						dataRequested: this.onDataRequested.bind(this),
						dataReceived: this.onDataReceived.bind(this)
					}
				});
			}
		},

		onExit: function() {
			sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);
		},

		onEmployeeIdChange: function(sChannelId, sEventId, oData) {
			var oBinding = this.byId("careerProgressTimeline").getBinding("content");
			oBinding.filter(new Filter("EmployeeNumber", FilterOperator.EQ, oData.EmployeeId), sap.ui.model.FilterType.Application);
		},

		onDataRequested: function() {
			var oViewModel = this.getModel("CareerProgressView");

			this.oApplicationController.whenMetadataLoaded(function() {
				oViewModel.setProperty("/busy", true);
			});
		},

		onDataReceived: function(oData) {
			var oViewModel = this.getModel("CareerProgressView"),
				data = oData.getParameter("data"),
				oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(this.sEmployeeNumber);

			oEmployeeDataModel.setProperty("/bCareerProgressExist", (!data.results || (data.results && data.results.length === 0)));

			oViewModel.setProperty("/busy", false);
		},
		formatDate: function(dateTime){
			
			if(!dateTime){
				dateTime = new Date();
			}
			var oDateInstance = DateFormat.getDateInstance({style:"long"});
			return oDateInstance.format(dateTime);
			
		}
	});
});