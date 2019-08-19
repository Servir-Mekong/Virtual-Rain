import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { HttpErrorHandler, HandleError } from './http-error-handler.service';

import { environment } from './../../environments/environment';

const headers = new HttpHeaders({
    'Content-Type': 'application/json'
});

export interface dataInput {
    location: any;
    satellite: string,
    layer_id: string,
    lat: number,
    lng: number
}

@Injectable({
    providedIn: 'root'
})
export class DownloadApiService {

    private handleError: HandleError;

    constructor(
        private http: HttpClient,
        httpErrorHandler: HttpErrorHandler
    ) {
        this.handleError = httpErrorHandler.createHandleError('DownloadApiService');
    }

    getData (dataInput: dataInput) {
        const satellite = dataInput.satellite;
        const layer_id = dataInput.layer_id;
        const lat = dataInput.lat;
        const lng = dataInput.lng;
        const bbox_minlat = Number(lat) - 0.01;
        const bbox_maxlat = Number(lat) + 0.01;
        const bbox_minlng = Number(lng) - 0.01;
        const bbox_maxlng = Number(lng) + 0.01;

        const wmsurl = 'https://geoserver.adpc.net/geoserver/'+ satellite +'/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&TRANSPARENT=true&QUERY_LAYERS='+ satellite +'%3A'+ layer_id +'&STYLES&LAYERS='+ satellite +'%3A'+ layer_id +'&INFO_FORMAT=application/json&FEATURE_COUNT=1&X=50&Y=50&SRS=EPSG:4326&WIDTH=101&HEIGHT=101&BBOX='+ bbox_minlng +','+ bbox_minlat +','+ bbox_maxlng +','+ bbox_maxlat+'';
        return this.http.get(wmsurl)
        .pipe(
            catchError(this.handleError('getRainfallValue', dataInput))
        );
    }
}
