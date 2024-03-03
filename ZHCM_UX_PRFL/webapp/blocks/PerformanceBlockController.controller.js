/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "com/sedef/hcm/ux/myprofile/controller/BaseController",
      "com/sedef/hcm/ux/myprofile/utils/reuseHandler",
      "com/sedef/hcm/ux/myprofile/utils/formatter",
      "sap/ui/core/format/NumberFormat",
      "sap/viz/ui5/format/ChartFormatter",
      "sap/viz/ui5/controls/common/feeds/FeedItem",
      "sap/viz/ui5/controls/VizFrame",
      "sap/viz/ui5/data/FlattenedDataset",
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
      "sap/m/Carousel",
      "sap/m/MessageStrip",
    ],
    function (
      BaseController,
      reuseHandler,
      formatter,
      NumberFormat,
      ChartFormatter,
      FeedItem,
      VizFrame,
      FlattenedDataset,
      JSONModel,
      Filter,
      FilterOperator,
      Carousel,
      MessageStrip
    ) {
      "use strict";
  
      return BaseController.extend(
        "com.sedef.hcm.ux.myprofile.blocks.PerformanceBlockController",
        {
          formatter: formatter,
  
          /**
           * Called when the controller is instantiated.
           * @public
           */
          onInit: function () {
            var oOwnerComponent = reuseHandler.getOwnerComponent(),
              oApplicationModel = oOwnerComponent.getModel("appProperties"),
              oApplicationController = oApplicationModel.getProperty(
                "/applicationController"
              ),
              sEmployeeNumber = oApplicationModel.getProperty("/employeeId");
  
            this.oApplicationController = oApplicationController;
            this.oResourceBundle = oOwnerComponent
              .getModel("i18n")
              .getResourceBundle();
  
            this.oLayout = this.byId("performanceVertLayout");
            this.oApplicationModel = oApplicationModel;
  
            this.oViewModel = new JSONModel({
              busy: false,
              chartOptions: null,
            });
            this.setModel(this.oViewModel, "PerformanceView");
  
            this._initChartOptions();
  
            // register event handler for the "employeeIdChanged" event
            sap.ui
              .getCore()
              .getEventBus()
              .subscribe(
                "com.sedef.hcm.ux.myprofile",
                "employeeIdChanged",
                this.onEmployeeIdChange,
                this
              );
  
            oApplicationController.whenMetadataLoaded(
              function () {
                this.oViewModel.setProperty("/busy", true);
  
                formatter.registerCustomVizFormat();
  
                this._readPerformanceData(sEmployeeNumber);
              }.bind(this)
            );
          },
  
          onExit: function () {
            sap.ui
              .getCore()
              .getEventBus()
              .unsubscribe(
                "com.sedef.hcm.ux.myprofile",
                "employeeIdChanged",
                this.onEmployeeIdChange,
                this
              );
          },
  
          onEmployeeIdChange: function (sChannelId, sEventId, oData) {
            this._readPerformanceData(oData.EmployeeId);
          },
  
          onPlotAreaDataLabelRenderer: function (sId, oObject) {
            var oVizFrame = this.byId(sId),
              oPerfItem = oVizFrame.getDataset().getModel().getData()
                .PerformanceRatings[oObject.ctx._context_row_number];
            if (oPerfItem.ScaleArt === "M") {
              // Quantity Scale
              var oNumberFormat = {},
                sText = "";
              if (oPerfItem.UnitOfMeasurement === "%") {
                oNumberFormat = NumberFormat.getPercentInstance({
                  style: "short",
                  minFractionDigits: 0,
                  maxFractionDigits: 2,
                });
                sText = oNumberFormat.format(oPerfItem.PerformanceRating / 100);
              } else {
                oNumberFormat = NumberFormat.getFloatInstance({
                  style: "short",
                  minFractionDigits: 0,
                  maxFractionDigits: 2,
                });
                sText =
                  oNumberFormat.format(oPerfItem.PerformanceRating) +
                  " " +
                  oPerfItem.UnitOfMeasurement;
              }
              oObject.text = sText;
            } else {
              // Quality Scale
              oObject.text = oPerfItem.PerformanceRatingText;
            }
          },
  
          _readPerformanceData: function (sEmployeeId) {
            this.oApplicationController
              .getODataHelper()
              .read("/PerformanceSet", this._handleSuccessV2.bind(this), [
                new Filter("EmployeeNumber", FilterOperator.EQ, sEmployeeId),
              ]);
          },
  
          _handleSuccessV2: function (oData) {
            this._adjustChart(oData);
          },
          _handleSuccess: function (oData) {
            // destroy all the content
            this.oLayout.destroyContent();
  
            if (!oData.results || (oData.results && oData.results.length === 0)) {
              var oConfig = this.oApplicationModel.getProperty("/oConfigData"),
                sText = oConfig.PerformanceDuration
                  ? jQuery.sap.formatMessage(
                      this.oResourceBundle.getText("noPerformanceTxtDate"),
                      [oConfig.PerformanceDuration.DurationYears]
                    )
                  : this.oResourceBundle.getText("noPerformanceTxt"),
                oMessageStrip = new MessageStrip(
                  this.createId("noPerformanceStrip"),
                  {
                    tooltip: sText,
                    text: sText,
                    type: sap.ui.core.MessageType.Information,
                    showIcon: true,
                  }
                );
  
              this.oLayout.addContent(oMessageStrip);
            } else {
              var aUniqueScales = this._groupResultItemsPerScale(oData.results);
              if (aUniqueScales.length > 1) {
                var oCarousel = new Carousel(this.createId("perfCarousel"), {
                  loop: false,
                  showPageIndicator: true,
                  arrowsPlacement: sap.m.CarouselArrowsPlacement.Content,
                });
                this.oLayout.addContent(oCarousel);
              }
  
              aUniqueScales.forEach(
                function (uniqueScale, index, array) {
                  // for every unique scale a new VizFrame is added
                  if (oCarousel) {
                    var oVizFrame = this._buildVizFrame(
                      uniqueScale.performanceItems
                    );
                    oCarousel.addPage(oVizFrame);
                    if (index + 1 === array.length) {
                      oCarousel.setActivePage(oVizFrame);
                    }
                  } else {
                    this.oLayout.addContent(
                      this._buildVizFrame(uniqueScale.performanceItems)
                    );
                  }
                }.bind(this)
              );
            }
  
            this.oViewModel.setProperty("/busy", false);
          },
  
          _buildVizFrame: function (aPerformanceItems) {
            var iMaxScaleLevel = Math.max.apply(
                Math,
                aPerformanceItems.map(function (item) {
                  return parseInt(item.MaxScaleLevel, 10);
                })
              ),
              iMinScaleLevel = Math.min.apply(
                Math,
                aPerformanceItems.map(function (item) {
                  return parseInt(item.MinScaleLevel, 10);
                })
              ),
              sScaleText = aPerformanceItems[0].ScaleText;
  
            // put data in local JSON model and add period info
            aPerformanceItems.forEach(function (item) {
              item.Period = formatter.formatPeriod(item.BeginDate, item.EndDate);
            });
  
            var oJSONModel = new JSONModel({
              PerformanceRatings: aPerformanceItems,
            });
  
            var sId = this.createId(
              "perfVizFrame" + aPerformanceItems[0].ScaleId
            );
            var oVizFrame = new VizFrame(sId, {
              uiConfig: {
                applicationSet: "fiori",
              },
              vizType: "line",
              width: "100%",
            });
  
            oVizFrame.setVizProperties({
              plotArea: {
                dataLabel: {
                  showTotal: true,
                  visible: true,
                  hideWhenOverlap: false,
                  renderer: function (oObject) {
                    this.onPlotAreaDataLabelRenderer(sId, oObject);
                  }.bind(this),
                },
                primaryScale: {
                  autoMaxValue: true,
                  autoMinValue: true,
                },
              },
              legend: {
                visible: false,
              },
              valueAxis: {
                visible: true,
                label: {
                  formatString:
                    aPerformanceItems[0].ScaleArt === "M"
                      ? formatter.FIORI_LABEL_PERCENTAGEFORMAT
                      : "",
                },
                title: {
                  text: this.oResourceBundle.getText(
                    "performanceAppraisalRatingMeasure"
                  ),
                  visible: true,
                },
              },
              categoryAxis: {
                visible: true,
                title: {
                  text: this.oResourceBundle.getText(
                    "performancePeriodDimension"
                  ),
                  visible: true,
                },
              },
              title: {
                text: sScaleText,
                visible: true,
              },
              interaction: {
                selectability: {
                  mode: "exclusive",
                  legendSelection: false,
                  axisLabelSelection: false,
                  plotLassoSelection: false,
                  plotStdSelection: true,
                },
              },
            });
  
            oVizFrame.setVizScales([
              {
                feed: "valueAxis",
                max: iMaxScaleLevel,
                min: iMinScaleLevel,
              },
            ]);
  
            var oDataset = new FlattenedDataset({
              dimensions: [
                {
                  name: "Period",
                  value: "{Period}",
                },
              ],
              measures: [
                {
                  name: "PerformanceRating",
                  value: "{PerformanceRating}",
                },
              ],
              data: {
                path: "/PerformanceRatings",
              },
            });
  
            oVizFrame.setDataset(oDataset);
            oVizFrame.setModel(oJSONModel);
  
            var feedValueAxis = new FeedItem({
                uid: "valueAxis",
                type: "Measure",
                values: ["PerformanceRating"],
              }),
              feedCategoryAxis = new FeedItem({
                uid: "categoryAxis",
                type: "Dimension",
                values: ["Period"],
              });
            oVizFrame.addFeed(feedValueAxis);
            oVizFrame.addFeed(feedCategoryAxis);
  
            return oVizFrame;
          },
  
          _groupResultItemsPerScale: function (aResult) {
            // analyze result and group result items per ScaleId
            var GroupPerScale = aResult.reduce(function (obj, item) {
              obj[item.ScaleId] = obj[item.ScaleId] || [];
              obj[item.ScaleId].push(item);
              return obj;
            }, {});
  
            var aGroupedItems = Object.keys(GroupPerScale).map(function (key) {
              return {
                scaleId: key,
                performanceItems: GroupPerScale[key],
              };
            });
  
            return aGroupedItems;
          },
          _rerenderGraph: function () {
            this.byId("idPerformanceGraph").rerender();
          },
          _adjustChart: function (oData) {
            var that = this;
  
            that._initChartOptions();
  
            var oCO = this.oViewModel.getProperty("/chartOptions");
  
            var bN = _.find(oData.results, ["ScaleId", "00000100"]) ? true : false;
            var bU = _.find(oData.results, ["ScaleId", "00000101"]) ? true : false;
            if (bU) {
  
              oCO.colors.push("#FEB019");
              
  
              oCO.series.push({
                name: "Sendikalı",
                type: "bar",
                data: [],
              });
              oCO.yaxis.push({
                seriesName: "Sendikalı",
                showForNullSeries: false,
                opposite: false,
                axisTicks: {
                  show: false,
                },
                axisBorder: {
                  show: true,
                },
                labels: {
                  formatter: function (value) {
                    if (value >= 0) {
                      switch (value) {
                        case 1:
                          return "Beklenenin Altında -";
                        case 2:
                          return "Beklenenin altında";
                        case 3:
                          return "Gelişim İhtiyacı Olan";
                        case 4:
                          return "Gelişim İhtiyacı Olan +";
                        case 5:
                          return "Beklenen Seviye";
                        case 6:
                          return "Beklenen Seviye +";
                        case 7:
                          return "Beklenenin Üzerinde";
                        default:
                          return null;
                      }
                    } else {
                      return value;
                    }
                  },
                },
                title: {
                  text: "Sendikalı",
                  offsetX: 5,
                  style:{
                    fontSize: "11px"
                  }
                },
                tickAmount: 7,
                min: 0,
                max: 7,
              });
            }
            if (bN) {
              oCO.colors.push("#008FFB");
              oCO.series.push({
                name: "Sendikasız",
                type: "bar",
                data: [],
              });
              oCO.yaxis.push(
                {
                  seriesName: "Sendikasız",
                  showForNullSeries: false,
                  opposite: bU ? true : false,
                  axisTicks: {
                    show: false,
                  },
                  axisBorder: {
                    show: true,
                  },
                  labels: {
                    formatter: function (value) {
                      if (value >= 0) {
                        switch (value) {
                          case 1:
                            return "Beklenenin altında";
                          case 2:
                            return "Beklenen";
                          case 3:
                            return "Beklenenin üzerinde";
                          case 4:
                            return "Beklenenin çok üzerinde";
                          default:
                            return null;
                        }
                      } else {
                        return value;
                      }
                    },
                  },
                  title: {
                    text: "Sendikasız",
                    offsetX: 5,
                    style:{
                      fontSize: "11px"
                    }
                  },
                  tooltip: {
                    enabled: true,
                  },
                  tickAmount: 4,
                  min: 0,
                  max: 4,
                }
              );
            }
  
           
  
            $.each(oData.results, function (i, r) {
              oCO.xaxis.categories.push(parseInt(r.PerformanceYear, 10));
  
              switch(r.ScaleId){
                case "00000101":
                  oCO.series[0].data.push(parseInt(r.PerformanceRating, 10));
                  if(bN) oCO.series[1].data.push(null);
                  break;
                case "00000100":
                  if(bU){
                    oCO.series[0].data.push(null);
                    oCO.series[1].data.push(parseInt(r.PerformanceRating, 10)) ;
                  }else{
                    oCO.series[0].data.push(parseInt(r.PerformanceRating, 10)) ;
                  }
                  // !bN ? oCO.series[0].data.push(parseInt(r.PerformanceRating, 10)) : oCO.series[1].data.push(parseInt(r.PerformanceRating, 10)) ;
                  break;
  
                default:
              }
  
              // oCO.series[0].data.push(
              //   r.ScaleId === "00000100"
              //     ? parseInt(r.PerformanceRating, 10)
              //     : null
              // );
              // oCO.series[1].data.push(
              //   r.ScaleId === "00000101"
              //     ? parseInt(r.PerformanceRating, 10)
              //     : null
              // );
            });
  
            this.oViewModel.setProperty("/chartOptions", oCO);
          },
          _initChartOptions: function () {
            var oChartOptions = {
              series: [],
              // theme: {
              //   palette: "palette2", // upto palette10
              // },
              colors:[],
              chart: {
                offsetX: 20,
                width: "90%",
                height: 350,
                type: "bar",
                stacked: true,
                toolbar: {
                  show: false,
                  offsetX: 0,
                  offsetY: 0,
                  tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                    customIcons: [],
                  },
                  autoSelected: "zoom",
                },
              },
              plotOptions: {
                bar: {
                  borderRadius: [3, 3],
                  dataLabels: {
                    position: "top",
                  },
                  columnWidth: "10%",
                },
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                width: [1, 1],
                curve: "smooth",
              },
              title: {
                text: "Performans Değerlendirme Sonuçları",
                align: "center",
              },
              markers: {
                size: 2,
                strokeColors: "#0ee",
                strokeWidth: 2,
                strokeOpacity: 0.9,
              },
              xaxis: {
                categories: [],
              },
              yaxis: [],
              legend: {
                horizontalAlign: "center",
              },
            };
  
            this.oViewModel.setProperty("/chartOptions", oChartOptions);
          },
          _initChartOptionsX: function () {
            var oChartOptions = {
              series: [
                {
                  name: "Sendikasız",
                  type: "bar",
                  data: [],
                },
                {
                  name: "Sendikalı",
                  type: "bar",
                  data: [],
                },
              ],
              theme: {
                palette: "palette2", // upto palette10
              },
              chart: {
                height: 350,
                type: "bar",
                stacked: true,
                toolbar: {
                  show: false,
                  offsetX: 0,
                  offsetY: 0,
                  tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                    customIcons: [],
                  },
                  autoSelected: "zoom",
                },
              },
              plotOptions: {
                bar: {
                  borderRadius: [10, 10],
                  dataLabels: {
                    position: "top",
                  },
                  columnWidth: "15%",
                },
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                width: [1, 1],
                curve: "smooth",
              },
              title: {
                text: "Performans Değerlendirme Sonuçları",
                align: "center",
              },
              markers: {
                size: 2,
                strokeColors: "#0ee",
                strokeWidth: 2,
                strokeOpacity: 0.9,
              },
              xaxis: {
                categories: [],
              },
              yaxis: [
                {
                  seriesName: "Sendikasız",
                  showForNullSeries: false,
                  axisTicks: {
                    show: false,
                  },
                  axisBorder: {
                    show: true,
                  },
                  labels: {
                    formatter: function (value) {
                      if (value >= 0) {
                        switch (value) {
                          case 1:
                            return "Beklenenin altında";
                          case 2:
                            return "Beklenen";
                          case 3:
                            return "Beklenenin üzerinde";
                          case 4:
                            return "Beklenenin çok üzerinde";
                          default:
                            return null;
                        }
                      } else {
                        return value;
                      }
                    },
                  },
                  title: {
                    text: "Sendikasız",
                  },
                  tooltip: {
                    enabled: true,
                  },
                  tickAmount: 4,
                  min: 0,
                  max: 4,
                },
                {
                  seriesName: "Sendikalı",
                  showForNullSeries: false,
                  opposite: true,
                  axisTicks: {
                    show: false,
                  },
                  axisBorder: {
                    show: true,
                  },
                  labels: {
                    formatter: function (value) {
                      if (value >= 0) {
                        switch (value) {
                          case 1:
                            return "Beklenenin Altında -";
                          case 2:
                            return "Beklenenin altında";
                          case 3:
                            return "Gelişim İhtiyacı Olan";
                          case 4:
                            return "Gelişim İhtiyacı Olan +";
                          case 5:
                            return "Beklenen Seviye";
                          case 6:
                            return "Beklenen Seviye +";
                          case 7:
                            return "Beklenenin Üzerinde";
                          default:
                            return null;
                        }
                      } else {
                        return value;
                      }
                    },
                  },
                  title: {
                    text: "Sendikalı",
                  },
                  tickAmount: 7,
                  min: 0,
                  max: 7,
                },
              ],
              legend: {
                horizontalAlign: "center",
              },
            };
  
            this.oViewModel.setProperty("/chartOptions", oChartOptions);
          },
        }
      );
    }
  );
  