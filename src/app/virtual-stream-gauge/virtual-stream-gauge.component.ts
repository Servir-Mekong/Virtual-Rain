import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { geojsonToArcGIS } from '@esri/arcgis-to-geojson-utils';
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
    { value: 'jason2', viewValue: 'Jason 2' },
    { value: 'jason3', viewValue: 'Jason 3' },
    { value: 'sentinel', viewValue: 'Sentinel' }
  ];

  constructor(private dataService: DataService) { }

  @Input() map$: Observable<esri.Map>;
  @Input() mapView$: Observable<esri.MapView>;
  @Input() streamGaugeTabSelected$: Observable<esri.KMLLayer>;

  map: esri.Map;
  mapView: esri.MapView;
  stationLayer: esri.FeatureLayer;
  satelliteTrackLayer: esri.FeatureLayer;
  showGaugeList: boolean = false;
  selectedCountry: string;
  selectedSatellite: string;
  selectedGauge: string;
  jasonStations = this.dataService.getJasonStations();
  gaugeList;

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

  countrySelectionChange = () => {
    if (this.selectedSatellite === 'jason2' || 'jason3') {
      this.gaugeList = this.jasonStations[this.selectedCountry]
    }
    this.showGaugeList = true;
  };

  satelliteSelectionChange = () => {
    if (this.selectedSatellite === 'jason2' || 'jason3') {
      this.loadJasonLayers();
    }
  };

  visualizeVRGData = () => {
    alert("hey they clicked me!")
  };

  clearStations = () => {
    if (this.map && this.stationLayer) {
      this.map.layers.remove(this.stationLayer);
    }
  };

  clearSatelliteTracks = () => {
    if (this.map && this.satelliteTrackLayer) {
      this.map.layers.remove(this.satelliteTrackLayer);
    }
  };

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.streamGaugeTabSelected$.currentValue === true) {
      // do nothing
      //this.loadJasonLayers();
      console.log('switched to VSG tab');
    } else {
      this.clearStations();
      this.clearSatelliteTracks();
    }
  };

  loadJasonLayers = () => {
    loadModules([
      'esri/layers/FeatureLayer',
      'esri/Graphic',
      'esri/geometry/Point',
      'esri/geometry/Polyline',
      'esri/request'
    ])
    .then(([
      FeatureLayer,
      Graphic,
      Point,
      Polyline,
      esriRequest
    ]) => {

      /**************************************************
       * Define the specification for each field to create
       * in the layer
       **************************************************/
      const StationsFields = [
        {
          name: 'VSG_Name',
          alias: 'Virtual Stream Gauge Name',
          type: 'string'
        },
        {
          name: 'Stream',
          alias: 'Stream Name',
          type: 'string'
        },
        {
          name: 'Country',
          alias: 'Country',
          type: 'string'
        },
        {
          name: 'Pass_Number',
          alias: 'Pass Number',
          type: 'single',
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

      const satelliteFields = [
        {
          'name': 'objectID',
          'alias': 'ObjectID',
          'type': 'oid'
        },
        {
          'name': 'Name',
          'alias': 'Name',
          'type': 'string'
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

      const satelliteRenderer = {
        type: 'simple-line', // autocasts as new SimpleLineSymbol()
        color: 'red',
        width: '3px',
        style: 'solid'
      };

      /**************************************************
       * Set up popup template for the layer
       **************************************************/
      const stationPopupTemplate = {
        //title: '{title}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              {
                fieldName: 'Stream',
                label: 'Stream Name',
                visible: true
              },
              {
                fieldName: 'Country',
                label: 'Country',
                visible: true
              },
              {
                fieldName: 'Pass_Number',
                label: 'Pass Number',
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
        ]
      };

      const satellitePopupTemplate = {
        content: [
          {
            type: 'fields',
            fieldInfos: [
              {
                fieldName: 'Name',
                label: 'Track',
                visible: true
              }
            ]
          }
        ]
      };

      /**************************************************
       * Get Geojson data
       **************************************************/
      const getData = (url: string) => {
        return esriRequest(url, {
          responseType: 'json'
        });
      };

      /**************************************************
       * Create graphics with returned geojson data
       **************************************************/
      const createStationGraphics = (response) => {
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
              VSG_Name: feature.properties.VSG_Name,
              Country: feature.properties.Country,
              Stream: feature.properties.Stream,
              Pass_Number: feature.properties.Pass_Number,
              Lon: feature.properties.Lon,
              Lat: feature.properties.Lat
            }
          };
        });
      };

      const createSatellitePathGraphics = (response) => {
        const esriJson = geojsonToArcGIS(response.data);

        return esriJson.map(function(feature, index) {
          // add an object id to each feature
          feature.attributes.objectID = index;
          var polyline = new Polyline(feature.geometry);
          return new Graphic({
            geometry: polyline,
            symbol: satelliteRenderer,
            attributes: feature.attributes
          });
        });
      };

      /**************************************************
       * Create a FeatureLayer with the array of graphics
       **************************************************/
      const createStationLayer = (graphics) => {
        this.stationLayer = new FeatureLayer({
          source: graphics, // autocast as an array of esri/Graphic
          // create an instance of esri/layers/support/Field for each field object
          fields: StationsFields, // This is required when creating a layer from Graphics
          objectIdField: 'VSG_Name', // This must be defined when creating a layer from Graphics
          renderer: stationsRenderer, // set the visualization on the layer
          spatialReference: {
            wkid: 4326
          },
          geometryType: 'point', // Must be set when creating a layer from Graphics
          popupTemplate: stationPopupTemplate
        });
        this.map.layers.add(this.stationLayer);
      };

      const createSatellitePathLayer = (featureArray) => {

        const featureCollection = {
          source: featureArray,
          geometryType: 'polyline',
          objectIdField: 'objectID',
          fields: satelliteFields,
          renderer: satelliteRenderer, // set the visualization on the layer
          spatialReference: {
            wkid: 4326
          },
          popupTemplate: satellitePopupTemplate
        };
        this.satelliteTrackLayer = new FeatureLayer(featureCollection);
        this.map.layers.add(this.satelliteTrackLayer);
      };

      getData('assets/data/stations.geojson').then(createStationGraphics).then(createStationLayer);
      getData('assets/data/satellite-track.geojson').then(createSatellitePathGraphics).then(createSatellitePathLayer);

    })
    .catch(err => {
      console.error(err);
    });
  };

}
