import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import esri = __esri;

@Component({
  selector: 'app-mapviewer',
  templateUrl: './mapviewer.component.html',
  styleUrls: ['./mapviewer.component.css']
})
export class MapviewerComponent implements OnInit {

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
