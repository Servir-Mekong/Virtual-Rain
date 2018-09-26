import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Highcharts from 'highcharts';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  animationValue$: BehaviorSubject<string> = new BehaviorSubject<string>('close');

  dialogTitle$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  dialogContentOptions$: BehaviorSubject<Highcharts.Options> = new BehaviorSubject<Highcharts.Options>(null);

  getDialogTitle = () => {
    return this.dialogTitle$;
  };

  /*setDialogTitle = (dialogTitle: string) => {
    this.dialogTitle$.next(dialogTitle);
  };*/

  getDialogContentOptions = () => {
    return this.dialogContentOptions$;
  };

  setDialogContentOptions = (chartTitle: string, seriesName: string, chartData) => {
    const contentOptions = {
      xAxis: {
        type: 'datetime'
      },
      rangeSelector: {
          selected: 1
      },
      title: {
        text: chartTitle
      },
      series: [
        {
          name: seriesName,
          data: chartData,
          type: 'spline',
          tooltip: {
            valueDecimals: 3
          }
        }
      ],
      credits: {
        enabled: false
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: [
                "printChart",
                "separator",
                "downloadPNG",
                "downloadJPEG",
                "downloadPDF",
                "downloadSVG",
                "separator",
                "downloadCSV",
                "downloadXLS",
                //"viewData",
                //"openInCloud"
            ]
          }
        }
      }
    };

    this.dialogContentOptions$.next(contentOptions);
  };

  changeAnimationValue = (value: string) => {
    this.animationValue$.next(value);
  };

  private areas: { value: string, viewValue: string } [] = [
    { value: 'country', viewValue: 'Country Layer' },
    { value: 'admin-layer-1', viewValue: 'Administrative Layer 1' },
    { value: 'admin-layer-2', viewValue: 'Administrative Layer 2' },
    { value: 'close-admin', viewValue: 'Close All Admin Layers' }
  ];

  private dataSources: { value: string, viewValue: string } [] = [
    { value: 'chirps', viewValue: 'CHIRPS Rainfall' },
    { value: 'cmorph', viewValue: 'CMORPH' },
    { value: 'gsmap', viewValue: 'GSMAP' },
    { value: 'imerg', viewValue: 'IMERG 1 Day' }
  ];

  private statistics: { value: string, viewValue: string } [] = [
    { value: 'avg', viewValue: 'Average' },
    { value: 'max', viewValue: 'Max' },
    { value: 'min', viewValue: 'Min' }
  ];

  private scopes: { value: string, viewValue: string } [] = [
    { value: 'hourly', viewValue: 'Hourly' },
    { value: 'daily', viewValue: 'Daily' },
    { value: 'monthly', viewValue: 'Monthly' },
    { value: 'yearly', viewValue: 'Yearly' }
  ];

  private animationOptions: { value: string, viewValue: string } [] = [
    { value: 'cmorph', viewValue: 'CMORPH DAILY' },
    { value: 'gsmap', viewValue: 'GSMAP DAILY' },
    { value: 'imerg', viewValue: 'IMERG DAILY' },
    { value: 'trmm', viewValue: 'TRMM DAILY' },
    { value: 'close', viewValue: 'Close Animation' }
  ];

  private jasonStations = {
    cambodia: [
      { value: 'vsg1', viewValue: 'Station 1' },
      { value: 'vsg2', viewValue: 'Station 2' }
    ],
    lao: [ { value: 'vsg3', viewValue: 'Station 3' } ],
    thailand: [ { value: 'vsg3', viewValue: 'Station 3' } ],
    myanmar: [
      { value: 'vsg4', viewValue: 'Station 4' },
      { value: 'vsg5', viewValue: 'Station 5' },
      { value: 'vsg6', viewValue: 'Station 6' },
      { value: 'vsg7', viewValue: 'Station 7' },
      { value: 'vsg8', viewValue: 'Station 8' },
      { value: 'vsg9', viewValue: 'Station 9' },
      { value: 'vsg10', viewValue: 'Station 10' },
      { value: 'vsg11', viewValue: 'Station 11' },
      { value: 'vsg12', viewValue: 'Station 12' },
      { value: 'vsg13', viewValue: 'Station 13' },
      { value: 'vsg14', viewValue: 'Station 14' },
      { value: 'vsg15', viewValue: 'Station 15' }
    ],
    vietnam: [
      { value: 'vsg16', viewValue: 'Station 16' },
      { value: 'vsg17', viewValue: 'Station 17' },
      { value: 'vsg18', viewValue: 'Station 18' },
      { value: 'vsg19', viewValue: 'Station 19' },
      { value: 'vsg20', viewValue: 'Station 20' },
      { value: 'vsg21', viewValue: 'Station 21' },
      { value: 'vsg22', viewValue: 'Station 22' }
    ]
  };

  private geoserverURL = 'http://203.146.112.253:8080/geoserver/';
 // private geoserverURL = 'http://localhost:8080/geoserver/';

  getAreaOptions = function () {
    return this.areas;
  };

  getDataSourcesOptions = function () {
    return this.dataSources;
  };

  getStatisticsOptions = function () {
    return this.statistics;
  };

  getScopeOptions = function () {
    return this.scopes;
  };

  getAnimationOptions = function () {
    return this.animationOptions;
  };

  getGeoserverURL = function () {
    return this.geoserverURL;
  };

  getJasonStations = function () {
    return this.jasonStations;
  };

}
