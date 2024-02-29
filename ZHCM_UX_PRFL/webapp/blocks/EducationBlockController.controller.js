/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController","com/sedef/hcm/ux/myprofile/utils/reuseHandler"],function(e,t){"use strict";var o={SLART:"SchoolType",SLARX:"SchoolTypeText",INSTI:"InstitutionName",SLAND:"Country",AUSBI:"Department",AUSBX:"DepartmentName",SLABS:"Slabs",FACCD:"FacultyCode",FACUX:"FacultyName",ZBEGDA:"SchoolBeginDate",ZENDDA:"SchoolEndDate"};return e.extend("com.sedef.hcm.ux.myprofile.blocks.EducationBlockController",{reuseHandler:t,onInit:function(){this.oApplicationController=t.getOwnerComponent().getModel("appProperties").getProperty("/applicationController");this.oODataModel=t.getOwnerComponent().getModel()},onNavToCommunicationDataPress:function(){this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYCOMMUNICATIONDATA.target)},getVisibility:function(e,t,o){if(!t){return true}if(!o){return false}return true}})});
//# sourceMappingURL=EducationBlockController.controller.js.map