/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/formatter",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/format/DateFormat"
], function(BaseController, formatter, reuseHandler, JSONModel, Filter, FilterOperator, Device, DateFormat) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.TrainingsBlockController", {

		formatter: formatter,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oContainer = this.byId("trainingsContainer"),
				oTemplate = this.byId("trainingTemplateItem"),
				oApplicationModel = reuseHandler.getOwnerComponent().getModel("appProperties"),
				oApplicationController = oApplicationModel.getProperty("/applicationController"),
				mNavProps = oApplicationController.getAppNavProperties(),
				mEntities = oApplicationController.getAppEntities(),
				sEmployeeNumber = oApplicationModel.getProperty("/employeeId"),
				oViewModel = new JSONModel({
					busy: false,
					sDateRangeStyle: "long",
					sDateRangeFormat: "yMMMMEEEEd" // show day name as well (only relevant as of SAPUI5 1.48)
				});
			this.setModel(oViewModel, "TrainingView");
			this.oResourceBundle = reuseHandler.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oApplicationModel = oApplicationModel;
			this.oApplicationController = oApplicationController;
			this.sEmployeeNumber = sEmployeeNumber;
			this.sAggregationName = Device.system.phone ? "pages" : "content";

			oContainer.addDependent(oTemplate);

			if (!oApplicationController.navPropertyExists(mEntities.EMPLOYEEDETAIL, mNavProps.TRAININGS)) {
				// register event handler for the "employeeIdChanged" event
				sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);

				oContainer.bindAggregation(this.sAggregationName, {
					path: "/TrainingSet",
					template: oTemplate,
					templateShareable: true,
					filters: new Filter("EmployeeNumber", FilterOperator.EQ, sEmployeeNumber),
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
			var oBinding = this.byId("trainingsContainer").getBinding(this.sAggregationName);
			oBinding.filter(new Filter("EmployeeNumber", FilterOperator.EQ, oData.EmployeeId), sap.ui.model.FilterType.Application);
		},

		onDataRequested: function() {
			var oViewModel = this.getModel("TrainingView");

			this.oApplicationController.whenMetadataLoaded(function() {
				oViewModel.setProperty("/busy", true);
			});
		},

		onDataReceived: function(oData) {
			var oViewModel = this.getModel("TrainingView"),
				oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(this.sEmployeeNumber),
				data = oData.getParameter("data");

			oEmployeeDataModel.setProperty("/bTrainingsExist", (!data.results || (data.results && data.results.length === 0)));

			oViewModel.setProperty("/busy", false);
		},

		formatNoTrainingsText: function(sText) {
			var oConfig = this.oApplicationModel.getProperty("/oConfigData");
			if (oConfig.TrainingsDuration) {
				var oDateFormat = DateFormat.getDateInstance({
						style: "long"
					}),
					oDate = reuseHandler.calculateDateFromDuration(oConfig.TrainingsDuration, "+");
				return jQuery.sap.formatMessage(sText, [oDateFormat.format(oDate)]);
			}
			return this.oResourceBundle.getText("noTrainingsTxt");
		}
	});
});