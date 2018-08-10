import { Injectable } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri;
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }

  test() {
    return this.http.get( environment.server_base_api + 'test/hello/');
  }

}
