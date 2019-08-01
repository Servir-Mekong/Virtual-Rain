import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { loadModules } from 'esri-loader';
import esri = __esri;

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.css']
})
export class TimeSliderComponent implements OnInit {

  constructor(private dataService: DataService) { }

  @Input() map$: Observable<esri.Map>;
  @Input() mapView$: Observable<esri.MapView>;

  geoserverURL: string = this.dataService.getGeoserverURL();
  map: esri.Map;
  mapView: esri.MapView;
  animation;
  animationValue: string;
  // sliderDisplayText: string = 'Day 1';
  sliderValue: number = 1;
  //sliderDisplayText: string = 'Day ' + this.sliderValue;
  startDate: Date = new Date(Date.now() - 24 * 3600 * 1000 * 9); // 10 days ago
  sliderDisplayText: string = this.startDate.getFullYear().toString() + '-' + ((this.startDate.getMonth() + 1) >= 10 ? (this.startDate.getMonth() + 1) : '0' + (this.startDate.getMonth() + 1)) + '-' + this.startDate.getDate().toString();

  ngOnInit() {
    this.map$.subscribe(map => {
      if (map) {
        this.map = map;
      }
    });

    this.mapView$.subscribe(view => {
      if (view) {
        this.mapView = view;
      }
    });

    this.dataService.animationValue$.subscribe(animationValue => {
      if (this.animationValue !== animationValue) {
        // New value changed
        // Reset the slider
        this.sliderValue = 1;
        this.sliderDisplayText = this.startDate.getFullYear().toString() + '-' + ((this.startDate.getMonth() + 1) >= 10 ? (this.startDate.getMonth() + 1) : '0' + (this.startDate.getMonth() + 1)) + '-' + this.startDate.getDate().toString();
        // Reset map layer
        this.resetMapLayer();
      }
      this.animationValue = animationValue;
    });
  }

  resetMapLayer = () => {
    this.map.layers.forEach((layer) => {
      const rainfall_data = ['cmorph', 'imerg', 'gsmap', 'mk_3b42rt_daily'];
      for (let rainfall of rainfall_data) {
        if(layer.id.toLowerCase().indexOf(rainfall) != -1) {
          layer.visible = false;
        }
      }
    });
  };

  /**
   * Toggle animation on/off when user
   * clicks on the play button
   */
  clickPlayButton = (event) => {
    if (event.currentTarget.classList.contains('toggled')) {
      this.stopAnimation(event.currentTarget);
    } else {
      this.startAnimation(event.currentTarget);
    }
  };

  /**
   * Sets the current visualized day.
   */
  setValue = (value) => {
    this.sliderValue = Math.floor(value);
    const d = new Date(this.startDate.getTime() + 24 * 3600 * 1000 * this.sliderValue);
    this.sliderDisplayText = d.getFullYear().toString() + '-' + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + '-' + ((d.getDate()) >= 10 ? (d.getDate()) : '0' + (d.getDate()));
  };

  /**
   * Starts the animation that cycle.
   */
  startAnimation = (target) => {
    this.stopAnimation(target);
    this.animation = this.animate(this.sliderValue, this.startDate);
    target.classList.add('toggled');
  };

  /**
   * Stops the animations
   */
  stopAnimation = (target) => {
    if (!this.animation) {
      return;
    }
    this.animation.remove();
    this.animation = null;
    target.classList.remove('toggled');
  };

  /**
   * Animation Layer
   */
  getAnimationLayer = (date) => {
    console.log(date);
    if (this.mapView) {
      loadModules([
        'esri/config',
        'esri/geometry/SpatialReference',
        'esri/layers/WMSLayer',
      ])
      .then(([
        esriConfig,
        SpatialReference,
        WMSLayer,
      ]) => {
  
        const wmsBaseURL = this.geoserverURL + this.animationValue + '/wms';
        const dateString = date.getFullYear().toString() + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + ((date.getDate()) >= 10 ? (date.getDate()) : '0' + (date.getDate()));
        esriConfig.request.corsEnabledServers.push(this.geoserverURL);
        const wmsOptions = {
          url: wmsBaseURL,
          opacity: 0.8,
          spatialReference: new SpatialReference({ wkid: 4326 }),
          version: '1.1.0'
        };
        let id;
        switch (this.animationValue) {
          case 'cmorph':
              id = 'MK_CMORPH_V0.x_RAW_0.25deg-DLY_00Z_' + dateString;
              break;
          case 'gsmap':
              id = 'MK_gsmap_gauge.' + dateString + '.0.1d.daily.00Z-23Z';
              break;
          case 'imerg':
              id = 'MK_3B-DAY-E.MS.MRG.3IMERG.' + dateString + '-S000000-E235959.V05';
              break;
          case 'trmm':
              id = 'MK_3B42RT_daily.' + date.getFullYear().toString() + '.' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '.' + date.getDate().toString() + '.7';
              break;
        }
        wmsOptions['id'] = id;
        wmsOptions['customParameters'] = {
          layers: id,
          styles: 'virtual_rain_style',
          transparent: true
        };

        this.resetMapLayer();

        const checkLayer = this.map.findLayerById(id);
        if (checkLayer) {
          checkLayer.visible = true;
        } else {
          const layer = new WMSLayer(wmsOptions);
          this.map.layers.add(layer, date.getFullYear().toString() + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + date.getDate().toString());
        }

      })
      .catch(err => {
        console.error(err);
      });
    }
  };

  /**
   * Animates the layer
   */
  animate = (startValue, startDate) => {
    let animating: boolean = true;
    let value: number = startValue;
    // let date: Date = new Date(startDate.getTime());
    let date: Date = new Date(startDate.getTime() + 24 * 3600 * 1000 * (value - 1));

    const frame = () => {
      if (!animating) {
        return;
      }

      this.getAnimationLayer(date);
      date.setDate(date.getDate() + 1);

      value += 1;
      if (value > 7) {
        value = 1;
        date = new Date(startDate.getTime() + 24 * 3600 * 1000 * value);
      }

      this.setValue(value);

      // Update at 30fps
      setTimeout(function() {
        requestAnimationFrame(frame);
      }, 1500 / 1);
    };

    frame();

    return {
      remove: function() {
        animating = false;
      }
    };
  }

  sliderValueChange = (event) => {
    this.sliderValue = event.value;
    const d = new Date(this.startDate.getTime() + 24 * 3600 * 1000 * this.sliderValue);
    this.sliderDisplayText = d.getFullYear().toString() + '-' + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + '-' + d.getDate().toString();
  };

}
