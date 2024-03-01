/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*global _*/
sap.ui.define(
    [
      "com/sedef/hcm/ux/myprofile/controller/BaseController",
      "com/sedef/hcm/ux/myprofile/utils/reuseHandler",
      "sap/m/MessageToast",
      "sap/m/MessageBox",
      "sap/ui/model/json/JSONModel",
      "com/sedef/hcm/ux/myprofile/utils/formatter",
    ],
    function (
      BaseController,
      reuseHandler,
      MessageToast,
      MessageBox,
      JSONModel,
      formatter
    ) {
      "use strict";
  
      return BaseController.extend(
        "com.sedef.hcm.ux.myprofile.blocks.CourseBlockController",
        {
          reuseHandler: reuseHandler,
          formatter: formatter,
  
          /**
           * Called when the controller is instantiated.
           * @public
           */
          onInit: function () {
            this.oApplicationController = reuseHandler
              .getOwnerComponent()
              .getModel("appProperties")
              .getProperty("/applicationController");
            this.oODataModel = reuseHandler.getOwnerComponent().getModel();
  
            var oViewModel = new JSONModel({
              changeRequest: {},
              editRequest: false,
              busy: false,
            });
  
            this.setModel(oViewModel, "courseModel");
  
            var oEventBus = sap.ui.getCore().getEventBus();
  
            oEventBus.subscribe("Course", "Create", this.onAddCourse, this);
          },
  
          onAddCourse: function () {
            var that = this;
            var oViewModel = this.getModel("courseModel");
  
            oViewModel.setProperty("/editRequest", false);
            oViewModel.setProperty("/changeRequest", {});
            var oDialog = sap.ui.getCore().byId("idCourseChangeRequestDialog");
            if (oDialog) {
              oDialog.destroy();
            }
            that._oCourseDialog = sap.ui.xmlfragment(
              "com.sedef.hcm.ux.myprofile.blocks.fragments.CourseChangeRequest",
              that
            );
            that.getView().addDependent(that._oCourseDialog);
            that._oCourseDialog.open();
          },
          onBeforeDialogOpen: function () {},
          onCloseDialog: function () {
            if (this._oCourseDialog) {
              this._oCourseDialog.close();
            }
          },
          onAfterDialogClose: function () {
            this._oCourseDialog.destroy();
            delete this._oCourseDialog;
          },
          onSaveChange: function () {
            var that = this;
            var oApplicationModel = reuseHandler
              .getOwnerComponent()
              .getModel("appProperties");
            var oViewModel = this.getModel("courseModel");
            var oModel = this.getModel();
            var bEdit = oViewModel.getProperty("/editRequest");
  
            var oReq = {
              Operation: bEdit ? "MOD" : "INS",
              OperationId: Date.now().toString(),
              EntityName: "Course",
              toCourse: _.cloneDeep(oViewModel.getProperty("/changeRequest")),
              toReturn: {},
            };
  
            if (!bEdit) {
              oReq.toCourse.EmployeeNumber =
                oApplicationModel.getProperty("/employeeId");
            }
  
            if (!oReq.toCourse.BeginDate) {
              oReq.toCourse.BeginDate = oReq.toCourse.CourseDate;
              oReq.toCourse.EndDate = new Date("9999-12-31");
            }
  
            oReq.toCourse.BeginDate.setHours(9);
            oReq.toCourse.CourseDate.setHours(9);
            oReq.toCourse.EndDate.setHours(9);
  
            that.setBusy(true);
            oModel.create("/InfotypeOperationSet", oReq, {
              success: function (oData) {
                if (oData.toReturn.Type === "E") {
                  MessageBox.error(oData.toReturn.Message);
                } else {
                  MessageToast.show("Kayıt başarılı");
                  that._refreshProfileView();
                }
  
                that.setBusy(false);
              },
              error: function (oError) {
                that.setBusy(false);
                jQuery.sap.log.error(oError);
              },
            });
          },
          onDeleteRecord: function (oEvent) {
            var oSource = oEvent.getSource();
            var oRecord = oSource.getBindingContext().getObject();
            var that = this;
            var oModel = this.getModel();
  
            var doDelete = function () {
              var oReq = {
                Operation: "DEL",
                OperationId: Date.now().toString(),
                EntityName: "Course",
                toCourse: _.cloneDeep(oRecord),
                toReturn: {},
              };
  
              oReq.toCourse.BeginDate.setHours(9);
              oReq.toCourse.EndDate.setHours(9);
  
              that.setBusy(true);
              oModel.create("/InfotypeOperationSet", oReq, {
                success: function (oData) {
                  if (oData.toReturn.Type === "E") {
                    MessageBox.error(oData.toReturn.Message);
                  } else {
                    MessageToast.show("Kayıt silme başarılı");
                    that._refreshProfileView();
                  }
  
                  that.setBusy(false);
                },
                error: function (oError) {
                  that.setBusy(false);
                  jQuery.sap.log.error(oError);
                },
              });
            };
  
            var oDeleteDialog = new sap.m.Dialog({
              title: "Silme Onayı",
              type: "Message",
              state: "Warning",
              content: new sap.m.VBox({
                items: [
                  new sap.m.Text({
                    text: "Bu işlem sonucunda kayıt silinecektir.",
                  }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({
                    text: "Devam etmek istiyor musunuz?",
                  }),
                ],
              }),
              beginButton: new sap.m.Button({
                type: sap.m.ButtonType.Reject,
                text: "Sil",
                press: function () {
                  doDelete();
                  oDeleteDialog.close();
                },
              }),
              endButton: new sap.m.Button({
                text: "İptal",
                press: function () {
                  oDeleteDialog.close();
                },
              }),
              afterClose: function () {
                oDeleteDialog.destroy();
              },
            });
  
            oDeleteDialog.open();
          },
          onEditRecord: function (oEvent) {
            var oSource = oEvent.getSource();
            var oRecord = oSource.getBindingContext().getObject();
            var oViewModel = this.getModel("courseModel");
            var that = this;
  
            oViewModel.setProperty("/editRequest", true);
            oViewModel.setProperty("/changeRequest", _.cloneDeep(oRecord));
  
            that._oCourseDialog = sap.ui.xmlfragment(
              "com.sedef.hcm.ux.myprofile.blocks.fragments.CourseChangeRequest",
              that
            );
            that.getView().addDependent(that._oCourseDialog);
            that._oCourseDialog.open();
          },
          setBusy: function (bBusy) {
            var oViewModel = this.getModel("courseModel");
  
            oViewModel.setProperty("/busy", bBusy);
          },
          _refreshProfileView: function () {
            var oView = reuseHandler.getView();
  
            this.onCloseDialog();
  
            oView.getElementBinding().refresh(true);
          },
        }
      );
    }
  );
  