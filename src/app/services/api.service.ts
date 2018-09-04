import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { HttpErrorHandler, HandleError } from './http-error-handler.service';

import { environment } from './../../environments/environment';

const headers = new HttpHeaders({
  'Content-Type': 'application/json'
});

export interface StreamData {
  satellite: string,
  station: string;
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

  getStreamData (streamData: StreamData) {
    const satellite = streamData.satellite;
    delete streamData.satellite;
    let httpParams = new HttpParams();
    Object.keys(streamData).forEach(function (key) {
      httpParams = httpParams.set(key, streamData[key]);
    });
    return this.http.get(environment.server_base_api + 'stream-gauge/' + satellite + '/', { params: httpParams, headers: headers })
      .pipe(
        catchError(this.handleError('getStreamTimeSeries', streamData))
      );
  }
}
