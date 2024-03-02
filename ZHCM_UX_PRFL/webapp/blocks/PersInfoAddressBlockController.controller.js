/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController","com/sedef/hcm/ux/myprofile/utils/reuseHandler","sap/m/MessageToast","sap/m/MessageBox","sap/ui/model/json/JSONModel","com/sedef/hcm/ux/myprofile/utils/formatter"],function(e,t,s,o,r,n){"use strict";var a={AEDTM:"ChangedOn",UNAME:"ChangedBy",SPRTX:"LockIndicatorText",ANSSA:"AddressRecordType",STEXT:"SubtypeText",NAME2:"ContactName",STRAS:"Street",HSNMR:"HouseNumber",POSTA:"AppartementId",LOCAT:"SupplementalAddressLine",PSTLZ:"PostalCode",ORT01:"City",ORT02:"District",STATE:"StateId",BEZEI:"StateText",LAND1:"CountryId",LANDX:"CountryText",LANDX50:"CountryTextLong",TELNR:"TelephoneNumber",ZZTELNR:"MobilePhoneNumber",ENTKM:"WorkDistance",ENTKM_SIGN:"WorkDistanceUnit",WKWNG:"CompanyHousing",BUSRT:"BusRoute"};return e.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoAddressBlockController",{formatter:n,reuseHandler:t,onInit:function(){this.oApplicationModel=t.getOwnerComponent().getModel("appProperties");this.oApplicationController=this.oApplicationModel.getProperty("/applicationController");this.oODataModel=t.getOwnerComponent().getModel();var e=new r({changeRequest:null,attachments:[],editRequest:false,busy:false});this.setModel(e,"addressChangeModel")},onNavToAddressesPress:function(){this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYADDRESSES.target)},getVisibility:function(e,s,o){if(!s){return true}return t.getPersInfoFieldVisibility(e,s,a,o)},formatPostalCodeCityLabel:function(e,s,o,r){return t.getPostalCodeCityLabel(e,this.oApplicationController.getAppEntities().ADDRESS,s,o,r,a)},getPersinfoLabel:function(e,s,o){return t.getPersinfoLabel(e,s,a,o)},getAddressRequestButtonIcon:function(e){return e==="P"?"sap-icon://display":"sap-icon://add"},getAddressRequestButtonType:function(e){return e==="P"?sap.m.ButtonType.Accept:sap.m.ButtonType.Emphasized},setBusy:function(e){var t=this.getModel("addressChangeModel");t.setProperty("/busy",e)},onChangeRequest:function(e){var t=this.getModel();var s=this.getModel("addressChangeModel");var o=this;var r=e.getSource().getBindingContext().getObject();var n={};var a=e.getSource().data("changeRequest");s.setProperty("/editRequest",false);if(a["RequestId"]){s.setProperty("/changeRequest",_.clone(a));if(a.toAttachments.__list.length>0){s.setProperty("/attachments",[_.clone(t.getProperty("/"+a.toAttachments.__list))])}else{s.setProperty("/attachments",[])}o._oAddressChangeDialog=sap.ui.xmlfragment("com.sedef.hcm.ux.myprofile.blocks.fragments.PersInfoAddressChangeRequest",o);o.getView().addDependent(o._oAddressChangeDialog);o._oAddressChangeDialog.open()}else{var i=["EmployeeNumber","InfotypeId","SubtypeId","ObjectId","LockIndicator","EndDate","BeginDate","SequenceNumber"];$.each(i,function(e,t){n[t]=r[t]});s.setProperty("/changeRequest",null);s.setProperty("/attachments",[]);this.oApplicationModel.setProperty("/isAppBusy",true);t.callFunction("/GetAddressChangeRequest",{method:"GET",urlParameters:n,success:function(e){s.setProperty("/changeRequest",e);o._oAddressChangeDialog=sap.ui.xmlfragment("com.sedef.hcm.ux.myprofile.blocks.fragments.PersInfoAddressChangeRequest",o);o.getView().addDependent(o._oAddressChangeDialog);o._oAddressChangeDialog.open();o.oApplicationModel.setProperty("/isAppBusy",false)},error:function(){o.oApplicationModel.setProperty("/isAppBusy",false)}})}},onCloseAddressDialog:function(){if(this._oAddressChangeDialog){this._oAddressChangeDialog.close()}},onAfterCloseAddressDialog:function(){this._oAddressChangeDialog.destroy();delete this._oAddressChangeDialog},onSendAddressChange:function(){var e=this.getModel();var t=this.getModel("addressChangeModel");var r=_.assignIn(_.cloneDeep(t.getProperty("/changeRequest")),{toReturn:{},toAttachments:[]});var n=this;var a=this._checkFileSelectedForUpload();if(a[0]){n.setBusy(true);e.create("/AddressChangeRequestSet",r,{success:function(e){n.setBusy(false);if(e.toReturn.Type==="E"){o.error(e.toReturn.Message)}else{t.setProperty("/changeRequest",e);n.onStartUpload()}},error:function(e){n.setBusy(false);jQuery.sap.log.error(e)}})}else{s.show("Onaya göndermek için ek dosya eklemesiniz!")}},onDeleteAddressChange:function(){var e=this.getModel();var t=this.getModel("addressChangeModel");var s=t.getProperty("/changeRequest");var o=e.createKey("/AddressChangeRequestSet",{RequestId:s.RequestId,ApprovalNo:s.ApprovalNo});var r=this;var n=function(){r.setBusy(true);e.remove(o,{success:function(e){r.setBusy(false);r._refreshProfileView()},error:function(e){r.setBusy(false);jQuery.sap.log.error(e)}})};var a=new sap.m.Dialog({title:"Silme Onayı",type:"Message",state:"Warning",content:new sap.m.VBox({items:[new sap.m.Text({text:"Bu işlem sonucunda talep silinecektir."}).addStyleClass("sapUiTinyMarginBottom"),new sap.m.Text({text:"Devam etmek istiyor musunuz?"})]}),beginButton:new sap.m.Button({type:sap.m.ButtonType.Reject,text:"Sil",press:function(){n();a.close()}}),endButton:new sap.m.Button({text:"İptal",press:function(){a.close()}}),afterClose:function(){a.destroy()}});a.open()},onStartUpload:function(){var e=this._checkFileSelectedForUpload();if(e[0]){this.oApplicationModel.setProperty("/isAppBusy",true);e[1].upload()}},onBeforeUploadStarts:function(e){var t=e.getSource();var s=this.getModel("addressChangeModel");var o=s.getProperty("/changeRequest");var r=e.getParameter("item");var n=new sap.ui.core.Item({key:"x-csrf-token",text:this.getModel().getSecurityToken()});var a=new sap.ui.core.Item({key:"slug",text:btoa(unescape(encodeURIComponent(r.getFileName()+";"+o.RequestId+";"+o.ApprovalNo)))});t.removeAllHeaderFields();t.addHeaderField(n);t.addHeaderField(a);this.setBusy(true)},onUploadCompleted:function(){this.setBusy(false);s.show("Talep oluşturuldu ve onaya gönderildi");this._refreshProfileView()},onItemRemoved:function(){var e=this.getModel("addressChangeModel");e.setProperty("/attachments",[])},onActivateEditRequest:function(){var e=this.getModel("addressChangeModel");e.setProperty("/editRequest",true);e.setProperty("/attachments",[])},_checkFileSelectedForUpload:function(){var e=sap.ui.getCore().byId("idUploadAddresAttachment")||this.getView().byId("idUploadAddresAttachment");var t=e?e.getIncompleteItems().length:0;return[t>0,e]},_refreshProfileView:function(){var e=t.getView();this.onCloseAddressDialog();e.getElementBinding().refresh(true)}})});
//# sourceMappingURL=PersInfoAddressBlockController.controller.js.map