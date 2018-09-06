import { Component, OnInit, Input } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
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
      'esri/geometry/SpatialReference',
      'esri/layers/WMSLayer'
    ])
    .then(([
      esriConfig,
      SpatialReference,
      WMSLayer
    ]) => {

      const wmsBaseURL = this.dataService.getGeoserverURL() + 'mekong-admin/wms';
      esriConfig.request.corsEnabledServers.push(this.dataService.getGeoserverURL());
      const wmsOptions = {
        url: wmsBaseURL,
        id: event.value,
        opacity: 0.8,
        spatialReference: new SpatialReference({ wkid: 4326 }),
        version: '1.1.0'
      };
      let mapHasLayer: boolean = false;

      const loadAndAddLayer = (layers: string, title: string, mapId) => {
        wmsOptions['customParameters'] = {
          layers: layers
        };
        wmsOptions['title'] = title;
        const layer = new WMSLayer(wmsOptions);
        this.map.layers.add(layer, mapId);
      };

      const checkForLayers = (mapId) => {
        this.map.layers.forEach((layer) => {
          if (layer.id === mapId) {
            layer.visible = true;
            mapHasLayer = true;
          } else {
            layer.visible = false;
          }
        });
      };

      if (event.value === 'country') {
        checkForLayers(event.value);
        if (!mapHasLayer) {
          loadAndAddLayer('mekong-admin:country', 'Country Layer', event.value);
        }
      } else if (event.value === 'admin-layer-1') {
        checkForLayers(event.value);
        if (!mapHasLayer) {
          loadAndAddLayer('mekong-admin:admin1', 'Admin 1 Layer', event.value);
        }
      } else if (event.value === 'admin-layer-2') {
        checkForLayers(event.value);
        if (!mapHasLayer) {
          loadAndAddLayer('mekong-admin:admin2', 'Admin 2 Layer', event.value);
        }
      } else if (event.value === 'close-admin') {
        this.map.layers.forEach((layer) => {
          if (['country', 'admin-layer-1', 'admin-layer-2'].includes(layer.id)) {
            layer.visible = false;
          }
        });
      }

    })
    .catch(err => {
      console.error(err);
    });

  }

}
