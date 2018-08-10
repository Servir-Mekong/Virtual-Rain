import { Component, OnInit, Input } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Observable, BehaviorSubject } from 'rxjs';
import { DataService } from '../services/data.service';
import { MapComponent } from '../map/map.component';
import esri = __esri;

@Component({
  selector: 'app-virtual-rain-gauge',
  templateUrl: './virtual-rain-gauge.component.html',
  styleUrls: ['./virtual-rain-gauge.component.css']
})
export class VirtualRainGaugeComponent implements OnInit {

  constructor(private dataService: DataService) { }

  @Input() map$: Observable<esri.Map>;

  map: esri.Map;
  animationValue: string;
  selectedArea: string;

  areas = this.dataService.getAreaOptions();
  dataSources = this.dataService.getDataSourcesOptions();
  statistics = this.dataService.getStatisticsOptions();
  scopes = this.dataService.getScopeOptions();
  animationOptions = this.dataService.getAnimationOptions();

  ngOnInit() {
    this.map$.subscribe(map => {
      if (!(map == null)) {
        this.map = map;
      }
    });

    this.dataService.animationValue$.subscribe(animationValue => {
      this.animationValue = animationValue;
    });
  }

  onFileComplete(data: any) {
    console.log(data); // We just print out data bubbled up from event emitter.
  }

  animationOptionChange (event: any) {
    this.dataService.changeAnimationValue(event.value);
  }

  adminLayerChange(event: any) {

    loadModules([
      'esri/config',
      'esri/layers/WMSLayer'
    ])
    .then(([
      esriConfig,
      WMSLayer
    ]) => {

      const wmsBaseURL = 'http://localhost:8080/geoserver/mekong-admin/wms';
      esriConfig.request.corsEnabledServers.push('localhost:8080');
      const wmsOptions = {
        id: event.value,
        opacity: 0.8,
        // spatialReference: new SpatialReference({ wkid: 4326 }),
        url: wmsBaseURL,
        version: '1.1.0'
      };
      let mapHasLayer: boolean = false;

      if (event.value === 'country') {
        this.map.layers.forEach((layer, index) => {
          if (layer.id === event.value) {
            layer.visible = true;
            mapHasLayer = true;
          } else {
            layer.visible = false;
          }
        });

        if (!mapHasLayer) {
          wmsOptions['customParameters'] = {
            layers: 'mekong-admin:country'
          };
          wmsOptions['title'] = 'Country Layer';
          const layer = new WMSLayer(wmsOptions);
          this.map.layers.add(layer, event.value);
        }
      } else if (event.value === 'admin-layer-1') {
        this.map.layers.forEach((layer, index) => {
          if (layer.id === event.value) {
            layer.visible = true;
            mapHasLayer = true;
          } else {
            layer.visible = false;
          }
        });

        if (!mapHasLayer) {
          wmsOptions ['customParameters'] = {
            layers: 'mekong-admin:admin1'
          };
          wmsOptions['title'] = 'Admin 1 Layer';
          const layer = new WMSLayer(wmsOptions);
          this.map.layers.add(layer, event.value);
        }
      } else if (event.value === 'admin-layer-2') {
        this.map.layers.forEach((layer, index) => {
          if (layer.id === event.value) {
            layer.visible = true;
            mapHasLayer = true;
          } else {
            layer.visible = false;
          }
        });

        if (!mapHasLayer) {
          wmsOptions['customParameters'] = {
            layers: 'mekong-admin:admin2'
          };
          wmsOptions['title'] = 'Admin 2 Layer';
          const layer = new WMSLayer(wmsOptions);
          this.map.layers.add(layer, event.value);
        }
      } else if (event.value === 'close-admin') {
        this.map.layers.forEach((layer, index) => {
          layer.visible = false;
        });
      }

    })
    .catch(err => {
      console.error(err);
    });

  }

}
