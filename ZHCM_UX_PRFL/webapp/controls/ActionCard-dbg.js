sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";
	var E = Control.extend("com.sedef.hcm.ux.myprofile.controls.ActionCard", {
		metadata: {
			properties: {
				containerHeight:{
                	type: "sap.ui.core.CSSSize",
                    defaultValue: "350px"
                }
			},
			aggregations:{
				face: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                actionBar: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
			},
			defaultAggregation: "faces"
		},

		init: function() {
			//initialisation code, in this case, ensure css is imported
			var sLibraryPath = jQuery.sap.getModulePath("com.sedef.hcm.ux.myprofile"); //get the server location of the ui library
			jQuery.sap.includeStyleSheet(sLibraryPath + "/controls/ActionCard.css");
		},

	

		renderer: function(oRM, oControl) {
				var oFace = oControl.getAggregation("face");
				var oActionBar = oControl.getAggregation("actionBar");
				
				//Main Action Cardcar container
				oRM.write("<div");
				oRM.writeControlData(oControl);
				oRM.addClass("smod-action-card-container");
				oRM.writeClasses();
				oRM.addStyle("height", oControl.getContainerHeight());
				oRM.writeStyles();
				oRM.write(">");
				
				
				oRM.write("<div"); //action-card
				oRM.addClass( "smod-action-card");
				oRM.writeClasses();
				oRM.write(">");
				
				oRM.write("<div"); //Inner
				oRM.addClass("smod-action-card-inner");
				oRM.writeClasses();
				oRM.write(">");
				
				oRM.write("<div"); // Front 
				oRM.addClass("smod-action-card-front");
				oRM.writeClasses();
				oRM.write(">");
				
				oRM.renderControl(oFace);
					
				oRM.write("</div>"); // Front 
				
				if(oActionBar){
					oRM.write("<div"); // Back
					oRM.addClass("smod-action-card-bar");
					oRM.writeClasses();
					oRM.write(">");
					oRM.renderControl(oActionBar);
					oRM.write("</div>"); //Back
				}
				oRM.write("</div>");//Inner
				oRM.write("</div>");//Action Card card
				oRM.write("</div>");//Action Card card main
			
		}
	});
	
	

	return E;

});