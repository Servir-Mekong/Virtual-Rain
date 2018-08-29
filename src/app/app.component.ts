import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import esri = __esri;
//import { MapService } from './services/map.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  map$: BehaviorSubject<esri.Map> = new BehaviorSubject<esri.Map>(null);
  mapView$: BehaviorSubject <esri.MapView> = new BehaviorSubject<esri.MapView>(null);
  @Input() streamGaugeTabSelected$: Boolean;

  /*constructor (private mapService: MapService) {}*/

  constructor () {}

  ngOnInit() {
    // this.mapService.test().toPromise().then().catch();
  }

  OnTabChange = (event: MatTabChangeEvent) => {
    if (event.index === 1) {
      this.streamGaugeTabSelected$ = true;
    } else {
      this.streamGaugeTabSelected$ = false;
    }
  }
}
