import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Highcharts from 'highcharts';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  animationValue$: BehaviorSubject<string> = new BehaviorSubject<string>('animate_close');

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
    { value: 'animate_chirps_30min', viewValue: 'Latest CHIRPS 30 min' },
    { value: 'animate_close', viewValue: 'Close Animation' }
  ];

  private jasonStations = {
    cambodia: [
      { value: 'j2vsg1', viewValue: 'J2VSG-1' },
      { value: 'j2vsg2', viewValue: 'J2VSG-2' }
    ],
    lao: [ { value: 'j2vsg3', viewValue: 'J2VSG-3' } ],
    thailand: [ { value: 'j2vsg3', viewValue: 'J2VSG-3' } ],
    myanmar: [
      { value: 'j2vsg4', viewValue: 'J2VSG-4' },
      { value: 'j2vsg5', viewValue: 'J2VSG-5' },
      { value: 'j2vsg6', viewValue: 'J2VSG-6' },
      { value: 'j2vsg7', viewValue: 'J2VSG-7' },
      { value: 'j2vsg8', viewValue: 'J2VSG-8' },
      { value: 'j2vsg9', viewValue: 'J2VSG-9' },
      { value: 'j2vsg10', viewValue: 'J2VSG-10' },
      { value: 'j2vsg11', viewValue: 'J2VSG-11' },
      { value: 'j2vsg12', viewValue: 'J2VSG-12' },
      { value: 'j2vsg13', viewValue: 'J2VSG-13' },
      { value: 'j2vsg14', viewValue: 'J2VSG-14' },
      { value: 'j2vsg15', viewValue: 'J2VSG-15' }
    ],
    vietnam: [
      { value: 'j2vsg16', viewValue: 'J2VSG-16' },
      { value: 'j2vsg17', viewValue: 'J2VSG-17' },
      { value: 'j2vsg18', viewValue: 'J2VSG-18' },
      { value: 'j2vsg19', viewValue: 'J2VSG-19' },
      { value: 'j2vsg20', viewValue: 'J2VSG-20' },
      { value: 'j2vsg21', viewValue: 'J2VSG-21' },
      { value: 'j2vsg22', viewValue: 'J2VSG-22' }
    ]
  };

  private geoserverURL = 'http://localhost:8080'
  private geoserverBaseURL = this.geoserverURL + '/geoserver/mekong-admin/wms';

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

  getGeoserverBaseURL = function () {
    return this.geoserverBaseURL;
  };

  getJasonStations = function () {
    return this.jasonStations;
  };

}
