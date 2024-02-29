/*global ApexCharts*/

sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";
  var E = Control.extend("com.sedef.hcm.ux.myprofile.controls.SmodApexChart", {
    _apexChart: null,
    _isRendered: false,
    metadata: {
      properties: {
        options: {
          type: "object",
          bindable: true,
        },
      },
    },
    _renderApex: function () {
      var that = this;
      var oOptions = $.extend(true, {}, that.getOptions());

      if (oOptions.hasOwnProperty("chart")) {
        oOptions.chart.locales = [
          {
            name: "tr",
            options: {
              months: [
                "Ocak",
                "Şubat",
                "Mart",
                "Nisan",
                "Mayıs",
                "Haziran",
                "Temmuz",
                "Ağustos",
                "Eylül",
                "Ekim",
                "Kasım",
                "Aralık",
              ],
              shortMonths: [
                "Oca",
                "Şub",
                "Mar",
                "Nis",
                "May",
                "Haz",
                "Tem",
                "Ağu",
                "Eyl",
                "Eki",
                "Kas",
                "Ara",
              ],
              days: [
                "Pazar",
                "Pazartesi",
                "Salı",
                "Çarşamba",
                "Perşembe",
                "Cuma",
                "Cumartesi",
              ],
              shortDays: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
              toolbar: {
                exportToSVG: "SVG İndir",
                exportToPNG: "PNG İndir",
                exportToCSV: "CSV İndir",
                menu: "Menü",
                selection: "Seçim",
                selectionZoom: "Seçim Yakınlaştır",
                zoomIn: "Yakınlaştır",
                zoomOut: "Uzaklaştır",
                pan: "Kaydır",
                reset: "Yakınlaştırmayı Sıfırla",
              },
            },
          },
        ];
        oOptions.chart.defaultLocale = "tr";
      }

      that.ChartOptions = oOptions;

      if (that?._apexChart && that._apexChart?.el) {
        try {
          that._apexChart?.destroy ? that._apexChart.destroy() : null;
          that._apexChart = null;
        } catch (x) {
          that._apexChart = null;
        }
      }

      // if (!that._apexChart) {
      that._apexChart = new ApexCharts.default(
        $(".smodApexChart")[0],
        this.ChartOptions
      );
      
      if(that._apexChart?.el){
        that._isRendered = true;
        try {
          that._apexChart.render();
        } catch (e) {}
      }else{
        this.rerender();
      }
      // } else {
      //   that._apexChart.updateOptions(
      //     {
      //       xaxis: _.cloneDeep(this.ChartOptions.xaxis),
      //       series: _.cloneDeep(this.ChartOptions.series),
      //     },
      //     true,
      //     false,
      //     true
      //   );
      // }
      // oControl._apexChart = new ApexCharts.default(
      //   document.querySelector("#" + this.getId()),
      //   this.ChartOptions
      // );
    },
    onAfterRendering: function () {
      var that = this;
      try {
        window.setTimeout(function () {
          that._renderApex(that);
        }, 1000);
      } catch (e) {}
    },

    init: function () {
      //initialization code, in this case, ensure css is imported
    },

    renderer: function (oRM, oControl) {
      // console.log("Rendering...");
      oControl._isRendered = false;
      try {
        //Tab content begin
        oRM.openStart("div", oControl)
           .class("smodApexChart")
           .openEnd()
           .close("div");
        // oRM.writeControlData(oControl);
        // oRM.addClass("smodApexChart");
        // oRM.writeClasses();
        // oRM.write(">");
        // oRM.write("</div>");
        //Profile content
      } catch (ex) {
        jQuery.sap.log.info("render failed!");
      }
    },
  });

  return E;
});
