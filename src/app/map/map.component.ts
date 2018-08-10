import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri;
import { MapService } from '../services/map.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @Input() map$: BehaviorSubject <esri.Map>;
  @Input() mapView$: BehaviorSubject <esri.MapView>;

  // Private vars with default values
  private _zoom = 4;
  private _center = [121.472, 10.898];
  private _basemap = 'topo';

  // Variables
  showSlider = false;

  // Global object
  map: esri.Map;
  mapView: esri.MapView;

  get zoom(): number {
    return this._zoom;
  }

  get center(): any[] {
    return this._center;
  }

  get basemap(): string {
    return this._basemap;
  }

  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('map') private mapViewEl: ElementRef;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    loadModules([
      'esri/Map',
      'esri/views/MapView'
    ])
    .then(([
      Map,
      MapView
    ]) => {

      this.map = new Map({
        basemap: this._basemap
      });
      this.map$.next(this.map);

      this.mapView = new MapView({
        container: this.mapViewEl.nativeElement,
        center: this._center,
        zoom: this._zoom,
        map: this.map
      });
      this.mapView.ui.move(['zoom'], 'top-right');
      this.mapView$.next(this.mapView);

      this.mapView.when(() => {
        console.log('map loaded!');
      }, err => {
        console.error(err);
      });
    })
    .catch(err => {
      console.error(err);
    });
  }

}
