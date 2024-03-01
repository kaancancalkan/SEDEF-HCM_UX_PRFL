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
	"sap/ui/Device",
	"sap/ui/core/format/DateFormat",
	"sap/m/GroupHeaderListItem"
], function(BaseController, JSONModel, Filter, FilterOperator, Sorter, reuseHandler, Device, DateFormat, GroupHeaderListItem) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.PaystubsBlockController", {

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oContainer = this.byId("paystubsContainer"),
				oTemplate = this.byId("paystubTemplateItem"),
				oListTemplate = this.byId("paystubListTemplate"),

				bIsCollapsedView = this.oView.sViewName.indexOf("PaystubsBlockCollapsed") !== -1 ? true : false,
				bIsExpandedListView = this.oView.sViewName.indexOf("PaystubsBlockExpandedList") !== -1 ? true : false,
				oApplicationModel = reuseHandler.getOwnerComponent().getModel("appProperties"),
				oApplicationController = oApplicationModel.getProperty("/applicationController"),
				mNavProps = oApplicationController.getAppNavProperties(),
				oViewModel = new JSONModel({
					busy: false
				});

			this.setModel(oViewModel, "PaystubsView");
			this.oResourceBundle = reuseHandler.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oApplicationController = oApplicationController;
			this.sEmployeeNumber = oApplicationModel.getProperty("/employeeId");
			this.sAggregationName = Device.system.phone ? "pages" : "content";

			if (bIsCollapsedView) {
				oContainer.addDependent(oTemplate);
			}

			if (!oApplicationController.navPropertyExists(oApplicationController.getAppEntities().EMPLOYEEDETAIL, mNavProps.PAYSTUBS)) {
				// register event handler for the "employeeIdChanged" event
				sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);

				oContainer.bindAggregation(this.sAggregationName, {
					path: "/PaystubSet",
					length: bIsCollapsedView ? 4 : null,
					template: oTemplate,
					templateShareable: true,
					filters: new Filter("EmployeeNumber", FilterOperator.EQ, this.sEmployeeNumber),
					events: {
						dataRequested: this.onDataRequested.bind(this),
						dataReceived: this.onDataReceived.bind(this)
					}
				});
			} else {
				if (!bIsCollapsedView && bIsExpandedListView) {
					this.byId("paystubsTable").bindItems({
						path: mNavProps.PAYSTUBS,
						template: oListTemplate,
						sorter: new Sorter("PayDate", true, this._oGroupFunctions.PayrollYear.bind(this)),
						filters: new Filter("EmployeeNumber", FilterOperator.EQ, this.sEmployeeNumber),
						groupHeaderFactory: this._createGroupHeader.bind(this)
					});
				}
			}
		},

		onExit: function() {
			sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);
		},

		onEmployeeIdChange: function(sChannelId, sEventId, oData) {
			var oBinding = this.byId("paystubsContainer").getBinding(this.sAggregationName);
			oBinding.filter(new Filter("EmployeeNumber", FilterOperator.EQ, oData.EmployeeId), sap.ui.model.FilterType.Application);
		},

		onDataRequested: function() {
			var oViewModel = this.getModel("PaystubsView");

			this.oApplicationController.whenMetadataLoaded(function() {
				oViewModel.setProperty("/busy", true);
			});
		},

		onDataReceived: function(oData) {
			var oViewModel = this.getModel("PaystubsView"),
				data = oData.getParameter("data"),
				oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(this.sEmployeeNumber);

			oEmployeeDataModel.setProperty("/bPaystubsExist", (!data.results || (data.results && data.results.length === 0)));

			oViewModel.setProperty("/busy", false);
		},

		onNavToPaystubsPress: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().PAYSTUBS.target);
		},

		formatNoPaystubsText: function(sText) {
			var oConfig = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/oConfigData");
			if (oConfig.PaystubsDuration) {
				var oDateFormat = DateFormat.getDateInstance({
						style: "long"
					}),
					oDate = reuseHandler.calculateDateFromDuration(oConfig.PaystubsDuration, "-");
				return jQuery.sap.formatMessage(sText, [oDateFormat.format(oDate)]);
			}
			return this.oResourceBundle.getText("noPaystubsTxt");
		},

		_createGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},

		_getDefaultGroup: function(oContext) {
			var fGrouper = this._oGroupFunctions.PayrollYear.bind(this);
			return fGrouper(oContext);
		},

		// The group functions are called during grouping for each item in the list. They determine which group
		// each list item belongs to. Items with the same key form a group. A new key
		// means a new group. The returned text is used as the label of the group item header.
		_oGroupFunctions: {
			// Grouping function for grouping by Payroll Year
			PayrollYear: function(oListItemContext) {
				var oPayDate = oListItemContext.getProperty("PayDate"),
					sKey = oPayDate.getFullYear().toString(),
					sText = this.oResourceBundle.getText("groupingLabel", ["Payroll Year", sKey]);
				return {
					key: sKey,
					text: sText
				};
			}
		},

		// This is a generic grouping function for columns that contain strings. For those columns, the property's value is
		// used as the grouping key and the group header text is built using the column's label and the property's value.
		_getGroup: function(sName, oListItemContext) {
			var sKey = oListItemContext.getProperty(sName);
			var sLabel = "Payroll Year"; //reuseHandler.getOwnerComponent().getModel().getProperty("/#Paystub/" + sName + "/@sap:label");

			var sText = this.oResourceBundle.getText("groupingLabel", [sLabel, sKey]);
			return {
				key: sKey,
				text: sText
			};
		}
	});
});