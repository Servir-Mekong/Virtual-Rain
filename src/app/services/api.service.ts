import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { HttpErrorHandler, HandleError } from './http-error-handler.service';

import { environment } from './../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

export interface StreamTimeSeriesData {
  gauge: string;
  start: string;
  end: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {

  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler
  ) { 
    this.handleError = httpErrorHandler.createHandleError('ApiService');
  }

  getStreamTimeSeries (streamTimeSeriesData: StreamTimeSeriesData) {
    httpOptions['params'] = new HttpParams().set('action', 'timeseries');

    return this.http.post(environment.server_base_api + 'stream-gauge/', streamTimeSeriesData, httpOptions)
      .pipe(
        catchError(this.handleError('getStreamTimeSeries', streamTimeSeriesData))
      );
  }
}
