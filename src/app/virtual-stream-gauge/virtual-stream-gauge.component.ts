import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Observable } from 'rxjs';
import esri = __esri;

@Component({
  selector: 'app-virtual-stream-gauge',
  templateUrl: './virtual-stream-gauge.component.html',
  styleUrls: ['./virtual-stream-gauge.component.css']
})
export class VirtualStreamGaugeComponent implements OnInit, OnChanges {

  countries = [
    { value: 'cambodia', viewValue: 'Cambodia' },
    { value: 'lao', viewValue: 'Lao PDR' },
    { value: 'myanmar', viewValue: 'Myanmar' },
    { value: 'thailand', viewValue: 'Thailand' },
    { value: 'vietnam', viewValue: 'Vietnam' }
  ];

  satellites = [
    { value: 'jason', viewValue: 'Jason-2/3' },
    { value: 'sentinel', viewValue: 'Sentinel' }
  ];

  constructor() { }

  @Input() map$: Observable<esri.Map>;
  @Input() mapView$: Observable<esri.MapView>;
  @Input() streamGaugeTabSelected$: Observable<esri.KMLLayer>;

  map: esri.Map;
  mapView: esri.MapView;
  stationLayer: esri.FeatureLayer;

  ngOnInit() {
    this.map$.subscribe(map => {
      if (!(map == null)) {
        this.map = map;
      }
    });

    this.mapView$.subscribe(mapView => {
      if (!(mapView == null)) {
        this.mapView = mapView;
      }
    });
  }

  clearStations = () => {
    if (this.map && this.stationLayer) {
      this.map.layers.remove(this.stationLayer);
    }
  };

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.streamGaugeTabSelected$.currentValue === true) {
      this.loadStations();
    } else {
      this.clearStations();
    }
  }

  loadStations = () => {
    loadModules([
      'esri/layers/FeatureLayer',
      'esri/geometry/Point',
      'esri/request'
    ])
    .then(([
      FeatureLayer,
      Point,
      esriRequest
    ]) => {

      /**************************************************
       * Define the specification for each field to create
       * in the layer
       **************************************************/
      const fields = [
        {
          name: 'Basin',
          alias: 'Basin',
          type: 'string'
        },
        {
          name: 'Country',
          alias: 'Country',
          type: 'string'
        },
        {
          name: 'River',
          alias: 'River',
          type: 'string'
        },
        {
          name: 'Lat',
          alias: 'Latitude',
          type: 'double'
        },
        {
          name: 'Lon',
          alias: 'Longitude',
          type: 'double'
        }
      ];

      /**************************************************
       * Define the renderer for symbolizing stations
       **************************************************/
      const stationsRenderer = {
        type: 'simple',  // autocasts as new SimpleRenderer()
        symbol: {
          type: 'picture-marker',  // autocasts as new PictureMarkerSymbol()
          url: 'assets/images/marker.png',
          width: '40px',
          height: '40px'
        }
      };

      /**************************************************
       * Set up popup template for the layer
       **************************************************/
      var pTemplate = {
        //title: '{title}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              {
                fieldName: 'Country',
                label: 'Country',
                visible: true
              },
              {
                fieldName: 'River',
                label: 'River',
                visible: true
              },
              {
                fieldName: 'Lat',
                label: 'Latitude',
                visible: true
              },
              {
                fieldName: 'Lon',
                label: 'Longitude',
                visible: true
              }
            ]
          },
          {
            type: 'text',
            text: 'This is next one'
          }
        ],
      };

      /**************************************************
       * Get Geojson data
       **************************************************/
      const getData = () => {
        var url =  'assets/data/stations.geojson';

        return esriRequest(url, {
          responseType: 'json'
        });
      };

      /**************************************************
       * Create graphics with returned geojson data
       **************************************************/
      const createGraphics = (response) => {
        // raw GeoJSON data
        var geoJson = response.data;

        // Create an array of Graphics from each GeoJSON feature
        return geoJson.features.map(function(feature) {
          return {
            geometry: new Point({
              x: feature.geometry.coordinates[0],
              y: feature.geometry.coordinates[1]
            }),
            // select only the attributes you care about
            attributes: {
              Basin: feature.properties.Basin,
              Country: feature.properties.Country,
              River: feature.properties.River,
              Lon: feature.properties.Lon,
              Lat: feature.properties.Lat
            }
          };
        });
      };

      /**************************************************
       * Create a FeatureLayer with the array of graphics
       **************************************************/
      const createLayer = (graphics) => {

        this.stationLayer = new FeatureLayer({
          source: graphics, // autocast as an array of esri/Graphic
          // create an instance of esri/layers/support/Field for each field object
          fields: fields, // This is required when creating a layer from Graphics
          objectIdField: 'Basin', // This must be defined when creating a layer from Graphics
          renderer: stationsRenderer, // set the visualization on the layer
          spatialReference: {
            wkid: 4326
          },
          geometryType: 'point', // Must be set when creating a layer from Graphics
          popupTemplate: pTemplate
        });
        this.map.layers.add(this.stationLayer);
      };

      getData().then(createGraphics).then(createLayer);

    })
    .catch(err => {
      console.error(err);
    });
  };

}
