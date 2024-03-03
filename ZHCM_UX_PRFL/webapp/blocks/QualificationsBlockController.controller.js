/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"sap/ui/Device",
	"sap/ui/core/format/DateFormat"
], function(BaseController, Filter, FilterOperator, JSONModel, Sorter, reuseHandler, Device, DateFormat) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.QualificationsBlockController", {

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oContainer = this.byId("qualiContainer"),
				oTemplate = this.byId("qualiCustItem"),
				oApplicationModel = reuseHandler.getOwnerComponent().getModel("appProperties"),
				oApplicationController = oApplicationModel.getProperty("/applicationController"),
				mNavProps = oApplicationController.getAppNavProperties(),
				mEntities = oApplicationController.getAppEntities(),
				oViewModel = new JSONModel({
					qualificationsExist: true,
					busy: false
				});
			this.setModel(oViewModel, "QualificationsView");
			this.oResourceBundle = reuseHandler.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oApplicationController = oApplicationController;
			this.sEmployeeNumber = oApplicationModel.getProperty("/employeeId");
			this.sAggregationName = Device.system.phone ? "pages" : "content";

			this.oView.addDependent(oTemplate);

			if (!oApplicationController.navPropertyExists(mEntities.EMPLOYEEDETAIL, mNavProps.QUALIFICATIONS)) {
				// register event handler for the "employeeIdChanged" event
				sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);
				
				oContainer.bindAggregation(this.sAggregationName, {
					path: "/QualificationSet",
					template: oTemplate,
					templateShareable: true,
					filters: new Filter("EmployeeNumber", FilterOperator.EQ, this.sEmployeeNumber),
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
			var oBinding = this.byId("qualiContainer").getBinding(this.sAggregationName);
			oBinding.filter(new Filter("EmployeeNumber", FilterOperator.EQ, oData.EmployeeId), sap.ui.model.FilterType.Application);
		},

		onDataRequested: function() {
			var oViewModel = this.getModel("QualificationsView");

			this.oApplicationController.whenMetadataLoaded(function() {
				oViewModel.setProperty("/busy", true);
			});
		},

		onDataReceived: function(oData) {
			var oViewModel = this.getModel("QualificationsView"),
				oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(this.sEmployeeNumber),
				data = oData.getParameter("data");

			oEmployeeDataModel.setProperty("/bQualificationsExist", (!data.results || (data.results && data.results.length === 0)));

			oViewModel.setProperty("/busy", false);
		},

		formatNoQualificationsText: function(sText) {
			var oConfig = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/oConfigData");
			if (oConfig.QualificationsDuration) {
				var oDateFormat = DateFormat.getDateInstance({
						style: "long"
					}),
					oDate = reuseHandler.calculateDateFromDuration(oConfig.QualificationsDuration, "-");
				return jQuery.sap.formatMessage(sText, [oDateFormat.format(oDate)]);
			}
			return this.oResourceBundle.getText("noQualificationsTxt");
		}
	});
});