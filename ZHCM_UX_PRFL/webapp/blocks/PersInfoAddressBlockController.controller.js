/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*global _*/
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"com/sedef/hcm/ux/myprofile/utils/formatter"
], function(BaseController, reuseHandler, MessageToast, MessageBox, JSONModel, formatter) {
	"use strict";

	// mapping between Attribute Names and technical fieldnames in metadata
	var mFieldMapping = {
		AEDTM: "ChangedOn",
		UNAME: "ChangedBy",
		SPRTX: "LockIndicatorText",
		ANSSA: "AddressRecordType",
		STEXT: "SubtypeText",
		NAME2: "ContactName",
		STRAS: "Street",
		HSNMR: "HouseNumber",
		POSTA: "AppartementId",
		LOCAT: "SupplementalAddressLine",
		PSTLZ: "PostalCode",
		ORT01: "City",
		ORT02: "District",
		STATE: "StateId",
		BEZEI: "StateText",
		LAND1: "CountryId",
		LANDX: "CountryText",
		LANDX50: "CountryTextLong",
		TELNR: "TelephoneNumber",
		ZZTELNR: "MobilePhoneNumber",
		ENTKM: "WorkDistance",
		ENTKM_SIGN: "WorkDistanceUnit",
		WKWNG: "CompanyHousing",
		BUSRT: "BusRoute"
	};

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoAddressBlockController", {
		formatter: formatter,
		reuseHandler: reuseHandler,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			this.oApplicationModel = reuseHandler.getOwnerComponent().getModel("appProperties");
			this.oApplicationController = this.oApplicationModel.getProperty("/applicationController");
			this.oODataModel = reuseHandler.getOwnerComponent().getModel();

			var oViewModel = new JSONModel({
				changeRequest: null,
				attachments: [],
				editRequest: false,
				busy: false
			});

			this.setModel(oViewModel, "addressChangeModel");
		},

		onNavToAddressesPress: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYADDRESSES.target);
		},

		getVisibility: function(sFieldName, aFieldMetaData, sFieldValue) {
			if (!aFieldMetaData) {
				return true;
			}
			return reuseHandler.getPersInfoFieldVisibility(sFieldName, aFieldMetaData, mFieldMapping, sFieldValue);
		},

		formatPostalCodeCityLabel: function(sPlaceholderText, sPostalCodePropertyName, sCityPropertyName, aFieldMetaData) {
			return reuseHandler.getPostalCodeCityLabel(sPlaceholderText, this.oApplicationController.getAppEntities().ADDRESS,
				sPostalCodePropertyName, sCityPropertyName,
				aFieldMetaData, mFieldMapping);
		},

		getPersinfoLabel: function(sPropertyName, aFieldMetaData, sFallbackText) {
			return reuseHandler.getPersinfoLabel(sPropertyName, aFieldMetaData, mFieldMapping, sFallbackText);
		},
		getAddressRequestButtonIcon: function(sStatus) {
			return sStatus === "P" ? "sap-icon://display" : "sap-icon://add";
		},
		getAddressRequestButtonType: function(sStatus) {
			return sStatus === "P" ? sap.m.ButtonType.Accept : sap.m.ButtonType.Emphasized;
		},

		setBusy: function(bBusy) {
			var oViewModel = this.getModel("addressChangeModel");

			oViewModel.setProperty("/busy", bBusy);
		},

		onChangeRequest: function(oEvent) {
			var oModel = this.getModel();
			var oViewModel = this.getModel("addressChangeModel");
			var that = this;
			var oObject = oEvent.getSource().getBindingContext().getObject();
			var oUrlParameters = {};

			var oCR = oEvent.getSource().data("changeRequest");
			
			
			oViewModel.setProperty("/editRequest", false);
			
			if (oCR["RequestId"]) {
				oViewModel.setProperty("/changeRequest", _.clone(oCR));
				if (oCR.toAttachments.__list.length > 0) {
					oViewModel.setProperty("/attachments", [_.clone(oModel.getProperty("/" + oCR.toAttachments.__list))]);
				} else {
					oViewModel.setProperty("/attachments", []);
					
				}
				that._oAddressChangeDialog = sap.ui.xmlfragment("com.sedef.hcm.ux.myprofile.blocks.fragments.PersInfoAddressChangeRequest",
					that);
				that.getView().addDependent(that._oAddressChangeDialog);
				that._oAddressChangeDialog.open();
			} else {

				var aKeys = [
					"EmployeeNumber",
					"InfotypeId",
					"SubtypeId",
					"ObjectId",
					"LockIndicator",
					"EndDate",
					"BeginDate",
					"SequenceNumber"
				];

				$.each(aKeys, function(i, sKey) {
					oUrlParameters[sKey] = oObject[sKey];
				});

				oViewModel.setProperty("/changeRequest", null);
				oViewModel.setProperty("/attachments", []);

				this.oApplicationModel.setProperty("/isAppBusy", true);
				oModel.callFunction("/GetAddressChangeRequest", {
					method: "GET",
					urlParameters: oUrlParameters,
					success: function(oData) {
						oViewModel.setProperty("/changeRequest", oData);
						that._oAddressChangeDialog = sap.ui.xmlfragment("com.sedef.hcm.ux.myprofile.blocks.fragments.PersInfoAddressChangeRequest",
							that);
						that.getView().addDependent(that._oAddressChangeDialog);
						that._oAddressChangeDialog.open();
						that.oApplicationModel.setProperty("/isAppBusy", false);
					},
					error: function() {
						that.oApplicationModel.setProperty("/isAppBusy", false);
					}
				});
			}

		},

		onCloseAddressDialog: function() {
			if (this._oAddressChangeDialog) {
				this._oAddressChangeDialog.close();
			}
		},
		onAfterCloseAddressDialog: function() {
			this._oAddressChangeDialog.destroy();
			delete this._oAddressChangeDialog;
		},
		onSendAddressChange: function() {
			var oModel = this.getModel();
			var oViewModel = this.getModel("addressChangeModel");
			var oReq = _.assignIn(_.cloneDeep(oViewModel.getProperty("/changeRequest")), {
				"toReturn": {},
				"toAttachments": []
			});
			var that = this;

			var aUpload = this._checkFileSelectedForUpload();

			if (aUpload[0]) {
				that.setBusy(true);
				oModel.create("/AddressChangeRequestSet", oReq, {
					success: function(oData) {
						that.setBusy(false);
						if (oData.toReturn.Type === "E") {
							MessageBox.error(oData.toReturn.Message);
						} else {
							
							//--Reflect changes to model
							oViewModel.setProperty("/changeRequest", oData);
							that.onStartUpload();
						}
					},
					error: function(oError) {
						that.setBusy(false);
						jQuery.sap.log.error(oError);
					}
				});
			} else {
				MessageToast.show("Onaya göndermek için ek dosya eklemesiniz!");
			}
		},

		onDeleteAddressChange: function() {
			var oModel = this.getModel();
			var oViewModel = this.getModel("addressChangeModel");
			var oReq = oViewModel.getProperty("/changeRequest");
			var sPath = oModel.createKey("/AddressChangeRequestSet", {
				"RequestId": oReq.RequestId,
				"ApprovalNo": oReq.ApprovalNo
			});

			var that = this;
			
			var doDelete = function(){
				that.setBusy(true);
				oModel.remove(sPath, {
					success: function(oData) {
						that.setBusy(false);
						that._refreshProfileView();
					},
					error: function(oError) {
						that.setBusy(false);
						jQuery.sap.log.error(oError);
					}
				});
			};
			
			var oDeleteDialog = new sap.m.Dialog({
				title: "Silme Onayı",
				type: "Message",
				state: "Warning",
				content: new sap.m.VBox({
					items: [
						new sap.m.Text({ text: "Bu işlem sonucunda talep silinecektir." }).addStyleClass("sapUiTinyMarginBottom"),
						new sap.m.Text({ text: "Devam etmek istiyor musunuz?" })
					]
				}),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Reject,
					text: "Sil",
					press: function () {
						doDelete();
						oDeleteDialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "İptal",
					press: function () {
						oDeleteDialog.close();
					}
				}),
				afterClose: function() {
					oDeleteDialog.destroy();
				}
			});
			
			oDeleteDialog.open();
			

		},
		onStartUpload: function() {
			var aUpload = this._checkFileSelectedForUpload();

			if (aUpload[0]) {
				this.oApplicationModel.setProperty("/isAppBusy", true);
				aUpload[1].upload();
			}
		},
		onBeforeUploadStarts: function(oEvent) {
			var oUploadSet = oEvent.getSource();
			var oViewModel = this.getModel("addressChangeModel");
			var oReq = oViewModel.getProperty("/changeRequest");
			var oItemToUpload = oEvent.getParameter("item");
			var oCustomerHeaderToken = new sap.ui.core.Item({
				key: "x-csrf-token",
				text: this.getModel().getSecurityToken()
			});

			// Header Slug
			var oCustomerHeaderSlug = new sap.ui.core.Item({
				key: "slug",
				text: btoa(unescape(encodeURIComponent(oItemToUpload.getFileName() + ";" + oReq.RequestId + ";" + oReq.ApprovalNo)))
			});

			oUploadSet.removeAllHeaderFields();
			oUploadSet.addHeaderField(oCustomerHeaderToken);
			oUploadSet.addHeaderField(oCustomerHeaderSlug);

			this.setBusy(true);
		},
		onUploadCompleted: function() {
			this.setBusy(false);
			MessageToast.show("Talep oluşturuldu ve onaya gönderildi");
			this._refreshProfileView();
		},
		
		onItemRemoved: function(){
			var oViewModel = this.getModel("addressChangeModel");
			
			oViewModel.setProperty("/attachments", []);
		},
		
		onActivateEditRequest: function(){
			var oViewModel = this.getModel("addressChangeModel");
			
			oViewModel.setProperty("/editRequest", true);	
			oViewModel.setProperty("/attachments", []);	
		},

		_checkFileSelectedForUpload: function() {
			var oUploadSet = sap.ui.getCore().byId("idUploadAddresAttachment") || this.getView().byId("idUploadAddresAttachment");
			var cFiles = oUploadSet ? oUploadSet.getIncompleteItems().length : 0;

			return [cFiles > 0, oUploadSet];
		},
		_refreshProfileView: function() {
			var oView = reuseHandler.getView();

			this.onCloseAddressDialog();

			oView.getElementBinding().refresh(true);
		}

	});
});