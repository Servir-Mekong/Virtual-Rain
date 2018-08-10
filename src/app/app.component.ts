import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import esri = __esri;
import { MapService } from './services/map.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  map$: BehaviorSubject<esri.Map> = new BehaviorSubject<esri.Map>(null);
  mapView$: BehaviorSubject <esri.MapView> = new BehaviorSubject<esri.MapView>(null);
  constructor (private mapService: MapService) {

  }

  ngOnInit() {
    // this.mapService.test().toPromise().then().catch();
  }
}
