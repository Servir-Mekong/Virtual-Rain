import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  animationValue$: BehaviorSubject<string> = new BehaviorSubject<string>('animate_close');

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

}
