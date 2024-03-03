/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/uxap/BlockBase"
], function(BlockBase) {
	"use strict";

	return BlockBase.extend("com.sedef.hcm.ux.myprofile.blocks.CareerProgressBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sedef.hcm.ux.myprofile.blocks.CareerProgressBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sedef.hcm.ux.myprofile.blocks.CareerProgressBlock",
					type: "XML"
				}
			},
			events: {}
		}
	});
});