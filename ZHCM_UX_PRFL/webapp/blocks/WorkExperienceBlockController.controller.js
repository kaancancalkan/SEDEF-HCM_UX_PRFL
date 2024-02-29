/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController","com/sedef/hcm/ux/myprofile/utils/reuseHandler","sap/m/MessageToast","sap/m/MessageBox","sap/ui/model/json/JSONModel","com/sedef/hcm/ux/myprofile/utils/formatter"],function(e,t,o,r,n,i){"use strict";return e.extend("com.sedef.hcm.ux.myprofile.blocks.WorkExperienceBlockController",{reuseHandler:t,formatter:i,onInit:function(){this.oApplicationController=t.getOwnerComponent().getModel("appProperties").getProperty("/applicationController");this.oODataModel=t.getOwnerComponent().getModel();var e=new n({changeRequest:{},editRequest:false,busy:false});this.setModel(e,"workExperienceModel");var o=sap.ui.getCore().getEventBus();o.subscribe("WorkExperience","Create",this.onAddWorkExperience,this)},onAddWorkExperience:function(){var e=this;var t=this.getModel("workExperienceModel");t.setProperty("/editRequest",false);t.setProperty("/changeRequest",{});var o=sap.ui.getCore().byId("idWorkExperienceChangeRequestDialog");if(o){o.destroy()}e._oWorkExperienceDialog=sap.ui.xmlfragment("com.sedef.hcm.ux.myprofile.blocks.fragments.WorkExperienceChangeRequest",e);e.getView().addDependent(e._oWorkExperienceDialog);e._oWorkExperienceDialog.open()},onBeforeDialogOpen:function(){},onCloseDialog:function(){if(this._oWorkExperienceDialog){this._oWorkExperienceDialog.close()}},onAfterDialogClose:function(){this._oWorkExperienceDialog.destroy();delete this._oWorkExperienceDialog},onSaveChange:function(){var e=this;var n=t.getOwnerComponent().getModel("appProperties");var i=this.getModel("workExperienceModel");var s=this.getModel();var a=i.getProperty("/editRequest");var p={Operation:a?"MOD":"INS",OperationId:Date.now().toString(),EntityName:"WorkExperience",toWorkExperience:_.cloneDeep(i.getProperty("/changeRequest")),toReturn:{}};if(!a){p.toWorkExperience.EmployeeNumber=n.getProperty("/employeeId")}p.toWorkExperience.HireDate.setHours(9);p.toWorkExperience.FireDate.setHours(9);if(p.toWorkExperience.BeginDate){p.toWorkExperience.BeginDate.setHours(9)}if(p.toWorkExperience.EndDate){p.toWorkExperience.EndDate.setHours(9)}e.setBusy(true);s.create("/InfotypeOperationSet",p,{success:function(t){if(t.toReturn.Type==="E"){r.error(t.toReturn.Message)}else{o.show("Kayıt başarılı");e._refreshProfileView()}e.setBusy(false)},error:function(t){e.setBusy(false);jQuery.sap.log.error(t)}})},onDeleteRecord:function(e){var t=e.getSource();var n=t.getBindingContext().getObject();var i=this;var s=this.getModel();var a=function(){var e={Operation:"DEL",OperationId:Date.now().toString(),EntityName:"WorkExperience",toWorkExperience:_.cloneDeep(n),toReturn:{}};e.toWorkExperience.HireDate.setHours(9);e.toWorkExperience.FireDate.setHours(9);e.toWorkExperience.BeginDate.setHours(9);e.toWorkExperience.EndDate.setHours(9);i.setBusy(true);s.create("/InfotypeOperationSet",e,{success:function(e){if(e.toReturn.Type==="E"){r.error(e.toReturn.Message)}else{o.show("Kayıt silme başarılı");i._refreshProfileView()}i.setBusy(false)},error:function(e){i.setBusy(false);jQuery.sap.log.error(e)}})};var p=new sap.m.Dialog({title:"Silme Onayı",type:"Message",state:"Warning",content:new sap.m.VBox({items:[new sap.m.Text({text:"Bu işlem sonucunda kayıt silinecektir."}).addStyleClass("sapUiTinyMarginBottom"),new sap.m.Text({text:"Devam etmek istiyor musunuz?"})]}),beginButton:new sap.m.Button({type:sap.m.ButtonType.Reject,text:"Sil",press:function(){a();p.close()}}),endButton:new sap.m.Button({text:"İptal",press:function(){p.close()}}),afterClose:function(){p.destroy()}});p.open()},onEditRecord:function(e){var t=e.getSource();var o=t.getBindingContext().getObject();var r=this.getModel("workExperienceModel");var n=this;r.setProperty("/editRequest",true);r.setProperty("/changeRequest",_.cloneDeep(o));n._oWorkExperienceDialog=sap.ui.xmlfragment("com.sedef.hcm.ux.myprofile.blocks.fragments.WorkExperienceChangeRequest",n);n.getView().addDependent(n._oWorkExperienceDialog);n._oWorkExperienceDialog.open()},setBusy:function(e){var t=this.getModel("workExperienceModel");t.setProperty("/busy",e)},_refreshProfileView:function(){var e=t.getView();this.onCloseDialog();e.getElementBinding().refresh(true)}})});
//# sourceMappingURL=WorkExperienceBlockController.controller.js.map