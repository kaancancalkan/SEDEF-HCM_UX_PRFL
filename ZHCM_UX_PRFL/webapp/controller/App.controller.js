/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.controller.App", {

		onInit: function() {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			//--Add custom icon fonts
			sap.ui.core.IconPool.addIcon("circle_0", "customfont", "smodfont", "e900");
			sap.ui.core.IconPool.addIcon("circle_90", "customfont", "smodfont", "e901");
			sap.ui.core.IconPool.addIcon("circle_180", "customfont", "smodfont", "e902");
			sap.ui.core.IconPool.addIcon("circle_270", "customfont", "smodfont", "e903");
			sap.ui.core.IconPool.addIcon("circle_360", "customfont", "smodfont", "e904");
		}
	});

});