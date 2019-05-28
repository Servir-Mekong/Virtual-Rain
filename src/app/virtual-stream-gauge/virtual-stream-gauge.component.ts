import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';

import { Observable } from 'rxjs';

import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';

import { DataService } from '../services/data.service';
import { ApiService } from '../services/api.service';

import { loadModules } from 'esri-loader';
import { geojsonToArcGIS } from '@esri/arcgis-to-geojson-utils';
import esri = __esri;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-virtual-stream-gauge',
  templateUrl: './virtual-stream-gauge.component.html',
  styleUrls: ['./virtual-stream-gauge.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class VirtualStreamGaugeComponent implements OnInit, OnChanges {

  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    public dialog: MatDialog
  ) { }

  @Input() map$: Observable<esri.Map>;
  @Input() mapView$: Observable<esri.MapView>;
  @Input() streamGaugeTabSelected$: Observable<esri.KMLLayer>;

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
    { value: 'sentinel-3a', viewValue: 'Sentinel 3A' },
    // { value: 'sentinel-3b', viewValue: 'Sentinel 3B' }
  ];

  /**************************************************
   * Define the specification for each field to create
   * in the layer
   **************************************************/
  private jasonStationsFields = [
    {
      'name': 'objectID',
      'alias': 'ObjectID',
      'type': 'oid'
    },
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

  private sentinel3AStationsFields = [
    {
      'name': 'objectID',
      'alias': 'ObjectID',
      'type': 'oid'
    },
    {
      name: 'Country',
      alias: 'Country',
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

  private jasonTrackFields = [
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
  private stationsRenderer = {
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
  private jasonStationsPopupTemplate = {
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
      /*{
        type: 'text',
        text: 'This is next one'
      }*/
    ]
  };

  private sentinel3AStationsPopupTemplate = {
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
      }
    ]
  };

  private jasonTrackPopupTemplate = {
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

  map: esri.Map;
  mapView: esri.MapView;
  jasonStationLayer: esri.FeatureLayer;
  sentinel3AStationLayer: esri.FeatureLayer;
  jasonTrackLayer: esri.FeatureLayer;
  showGaugeList: boolean = false;
  selectedCountry: string;
  selectedSatellite: string;
  selectedGauge: string;
  selectedStartDate;
  selectedEndDate;
  jasonStations = this.dataService.getJasonStations();
  gaugeList;
  minDate: Date;
  maxDate: Date;

  hideStations = (satellite: string) => {
    if ((satellite === 'jason' || satellite === 'all') && this.jasonStationLayer) {
      //this.map.layers.remove(this.jasonStationLayer);
      this.jasonStationLayer.visible = false;
    }

    if ((satellite === 'sentinel-3a' || satellite === 'all') && this.sentinel3AStationLayer) {
      this.sentinel3AStationLayer.visible = false;
    }
  };

  showStations = (satellite: string) => {
    if ((satellite === 'jason' || satellite === 'all') && this.jasonStationLayer) {
      //this.map.layers.remove(this.jasonStationLayer);
      this.jasonStationLayer.visible = true;
    }

    if ((satellite === 'sentinel-3a' || satellite === 'all') && this.sentinel3AStationLayer) {
      this.sentinel3AStationLayer.visible = true;
    }
  };

  hideTracks = (satellite: string) => {
    if ((satellite === 'jason' || satellite === 'all') && this.jasonTrackLayer) {
      this.jasonTrackLayer.visible = false;
    }
  };

  showTracks = (satellite: string) => {
    if ((satellite === 'jason' || satellite === 'all') && this.jasonTrackLayer) {
      this.jasonTrackLayer.visible = true;
    }
  };

  countrySelectionChange = () => {
    if (this.selectedSatellite === 'jason2' || 'jason3') {
      this.gaugeList = this.jasonStations[this.selectedCountry]
    }
    this.showGaugeList = true;
  };

  satelliteSelectionChange = () => {
    if (this.selectedSatellite === 'jason2' || this.selectedSatellite === 'jason3') {
      this.hideStations('sentinel-3a');
      this.loadStationsAndTracks('jason');
    } else if (this.selectedSatellite === 'sentinel-3a') {
      this.hideStations('jason');
      this.hideTracks('jason');
      this.loadStationsAndTracks('sentinel-3a');
    }

    if (this.selectedSatellite === 'jason2') {
      this.minDate = new Date(2008, 7, 1);
      this.maxDate = new Date(2016, 10, 0);
    } else if (this.selectedSatellite === 'jason3') {
      this.minDate = new Date(2016, 2, 12);
      this.maxDate = new Date();
      this.maxDate.setDate(this.maxDate.getDate() - 3)
    }
  };

  openGraphDialog = (chartTitle: string, seriesName: string, yAxisTitle: string, data) => {

    // this.dataService.setDialogTitle(dialogTitle);
    this.dataService.setDialogContentOptions(chartTitle, seriesName, yAxisTitle, data);
    const dialogRef = this.dialog.open(GraphDialogComponent,{
      height: '70vh',
      width: '70vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      console.log('Dialog closed');
    });
  };

  visualizeVRGData = () => {
    if (!this.selectedGauge && !this.selectedStartDate && !this.selectedEndDate) {
      return
    }

    this.apiService.getStreamData({
      satellite: this.selectedSatellite,
      station: this.selectedGauge,
      start: moment(this.selectedStartDate).format('YYYY-MM-DD'),
      end: moment(this.selectedEndDate).format('YYYY-MM-DD')
    })
    .subscribe(response => {
      let graphData = [];
      for (let index of Object.keys(response)) {
        graphData.push([Date.parse(response[index]['date']), response[index]['water_level']])
      }
      this.openGraphDialog('Timeseries of Water Height', 'Water Height',  'Water Height w.r.t WGS-84 (m)', graphData);
    });
  };

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.streamGaugeTabSelected$.currentValue === true) {
      // do nothing
      console.log('switched to VSG tab');
      console.log('closing animation slider as well!');
      this.dataService.changeAnimationValue('close');
    } else {
      this.hideStations('all');
      this.hideTracks('jason');
    }
  };

  loadStationsAndTracks = (satellite: string) => {
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

      const trackRenderer = {
        type: 'simple-line', // autocasts as new SimpleLineSymbol()
        color: 'red',
        width: '3px',
        style: 'solid'
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
      const createStationGraphics = (satellite, response) => {

        let attributes;

        // raw GeoJSON data
        var geoJson = response.data;

        // Create an array of Graphics from each GeoJSON feature
        return geoJson.features.map(function(feature, index) {
          // add an object id to each feature
          feature.properties.objectID = index;
          if (satellite === 'jason') {
            // select only the attributes you care about
            attributes = {
              objectID: feature.properties.objectID,
              VSG_Name: feature.properties.VSG_Name,
              Country: feature.properties.Country,
              Stream: feature.properties.Stream,
              Pass_Number: feature.properties.Pass_Number,
              Lon: feature.properties.Lon,
              Lat: feature.properties.Lat
            }
          } else if (satellite === 'sentinel-3a') {
            attributes = {
              objectID: feature.properties.objectID,
              Country: feature.properties.Country,
              Lon: feature.properties.Lon,
              Lat: feature.properties.Lat
            }
          }

          return {
            geometry: new Point({
              x: feature.geometry.coordinates[0],
              y: feature.geometry.coordinates[1]
            }),
            attributes: attributes
          };
        });
      };

      const createTrackGraphics = (response) => {
        const esriJson = geojsonToArcGIS(response.data);

        return esriJson.map(function(feature, index) {
          // add an object id to each feature
          feature.attributes.objectID = index;
          var polyline = new Polyline(feature.geometry);
          return new Graphic({
            geometry: polyline,
            symbol: trackRenderer,
            attributes: feature.attributes
          });
        });
      };

      /**************************************************
       * Create a FeatureLayer with the array of graphics
       **************************************************/
      const createStationLayer = (satellite, graphics) => {

        const layer = new FeatureLayer({
          source: graphics, // autocast as an array of esri/Graphic
          // create an instance of esri/layers/support/Field for each field object\
          fields: satellite === 'jason' ? this.jasonStationsFields : satellite === 'sentinel-3a' ? this.sentinel3AStationsFields : undefined, // This is required when creating a layer from Graphics
          objectIdField: 'objectID', //'VSG_Name', // This must be defined when creating a layer from Graphics
          renderer: this.stationsRenderer, // set the visualization on the layer
          spatialReference: {
            wkid: 4326
          },
          geometryType: 'point', // Must be set when creating a layer from Graphics
          popupTemplate: satellite === 'jason' ? this.jasonStationsPopupTemplate : satellite === 'sentinel-3a' ? this.sentinel3AStationsPopupTemplate : undefined
        });

        if (satellite === 'jason') {
          this.jasonStationLayer = layer;
          this.map.layers.add(this.jasonStationLayer);
        } else if (satellite === 'sentinel-3a') {
          this.sentinel3AStationLayer = layer;
          this.map.layers.add(this.sentinel3AStationLayer);
        }
      };

      const createTrackPathLayer = (featureArray) => {

        const featureCollection = {
          source: featureArray,
          geometryType: 'polyline',
          objectIdField: 'objectID',
          fields: this.jasonTrackFields,
          renderer: trackRenderer, // set the visualization on the layer
          spatialReference: {
            wkid: 4326
          },
          popupTemplate: this.jasonTrackPopupTemplate
        };
        this.jasonTrackLayer = new FeatureLayer(featureCollection);
        this.map.layers.add(this.jasonTrackLayer);
      };

      if (satellite === 'jason') {
        if (this.jasonStationLayer) {
          this.showStations(satellite);
        } else {
          getData('assets/data/jason-stations.geojson').then(createStationGraphics.bind(null, satellite)).then(createStationLayer.bind(null, satellite));
        }

        if (this.jasonTrackLayer) {
          this.showTracks(satellite);
        } else {
          getData('assets/data/jason-track.geojson').then(createTrackGraphics).then(createTrackPathLayer);
        }
      } else if (satellite === 'sentinel-3a') {
        if (this.sentinel3AStationLayer) {
          this.showStations(satellite)
        } else {
          getData('assets/data/sentinel-3a-stations.geojson').then(createStationGraphics.bind(null, satellite)).then(createStationLayer.bind(null, satellite));
        }
      }

    })
    .catch(err => {
      console.error(err);
    });
  };

}
