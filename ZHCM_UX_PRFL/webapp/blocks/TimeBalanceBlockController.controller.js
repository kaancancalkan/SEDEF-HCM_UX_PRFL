/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/formatter",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"com/sedef/hcm/ux/myprofile/controller/ErrorHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, formatter, reuseHandler, ErrorHandler, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.TimeBalanceBlockController", {

		formatter: formatter,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oView = this.getView(),
				oOwnerComponent = reuseHandler.getOwnerComponent(),
				oApplicationModel = oOwnerComponent.getModel("appProperties"),
				sEmployeeNumber = oApplicationModel.getProperty("/employeeId"),
				oApplicationController = oApplicationModel.getProperty("/applicationController"),
				mNavProps = oApplicationController.getAppNavProperties(),
				mEntities = oApplicationController.getAppEntities(),
				oViewModel = new JSONModel({
					busy: false
				});

			this.setModel(oViewModel, "TimeBalanceView");
			this.oApplicationController = oApplicationController;

			if (oApplicationController.navPropertyExists(mEntities.EMPLOYEEDETAIL, mNavProps.TIMEBALANCE)) {
				oView.bindElement(mNavProps.TIMEBALANCE);

			} else {
				// register event handler for the "employeeIdChanged" event
				sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);

				oApplicationController.whenMetadataLoaded(function() {
					oViewModel.setProperty("/busy", true);

					this._bindView(sEmployeeNumber);
				}.bind(this));
			}
		},

		onExit: function() {
			sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);
		},

		onEmployeeIdChange: function(sChannelId, sEventId, oData) {
			this._bindView(oData.EmployeeId);
		},

		onNavToMyTimeEvents: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().TIMEEVENTS.target);
		},

		formatTimeBalanceStatusText: function(fBalance) {
			var oResourceBundle = reuseHandler.getOwnerComponent().getModel("i18n").getResourceBundle();

			if (parseFloat(fBalance) < 0) {
				//flextime deficit
				return oResourceBundle.getText("timeBalMissing");
			} else if (parseFloat(fBalance) > 0) {
				//flextime excess
				return oResourceBundle.getText("timeBalPositiveTxt");
			} else {
				//balanced flextime
				return oResourceBundle.getText("timeBalComplete");
			}
		},

		formatTimeBalanceStatus: function(fBalance) {
			if (parseFloat(fBalance) < 0) {
				//flextime deficit (warning)
				return sap.ui.core.ValueState.Warning;
			} else {
				//flextime excess or balanced flextime
				return sap.ui.core.ValueState.Success;
			}
		},

		_bindView: function(sEmployeeNumber) {
			var oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(sEmployeeNumber),
				oView = this.getView(),
				oViewModel = this.getModel("TimeBalanceView"),
				aFilters = [new Filter("EmployeeNumber", FilterOperator.EQ, sEmployeeNumber)],
				fnSuccess = function(oData) {
					if (!oData.results || (oData.results && oData.results.length === 0)) {
						oEmployeeDataModel.setProperty("/bTimeBalanceExists", false);
					} else {
						oEmployeeDataModel.setProperty("/bTimeBalanceExists", true);

						//take the first result item and bind view
						oView.setModel(new JSONModel({
							TimeBalance: oData.results[0]
						}));
						oView.bindElement("/TimeBalance");
					}
					oViewModel.setProperty("/busy", false);
				};

			this.oApplicationController.getODataHelper().read("/TimeBalanceSet", fnSuccess, aFilters);
		}
	});
});