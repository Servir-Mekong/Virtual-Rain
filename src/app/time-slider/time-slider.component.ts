import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { loadModules } from 'esri-loader';
import esri = __esri;

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.css']
})
export class TimeSliderComponent implements OnInit {
  @Input() map$: Observable<esri.Map>;
  @Input() mapView$: Observable<esri.MapView>;
  map: esri.Map;
  mapView: esri.MapView;
  animation;
  // sliderDisplayText: string = 'Day 1';
  sliderValue: number = 1;
  sliderDisplayText: string = 'Day ' + this.sliderValue;
  startDate: Date = new Date('2017-07-25');

  constructor() { }

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

  }

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
    this.sliderDisplayText = 'Day ' + this.sliderValue;
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
        'esri/layers/WMSLayer',
      ])
      .then(([
        esriConfig,
        WMSLayer,
      ]) => {
  
        const wmsBaseURL = 'http://localhost:8080/geoserver/chirps/wms';
        const dateString = date.getFullYear().toString() + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + date.getDate().toString();
        esriConfig.request.corsEnabledServers.push('localhost:8080');
        const wmsOptions = {
          opacity: 0.8,
          id: 'chirps:MK_3B-DAY-E.MS.MRG.3IMERG.' + dateString + '-S000000-E235959.V04',
          url: wmsBaseURL,
          version: '1.1.0',
          customParameters: {
            layers: 'chirps:MK_3B-DAY-E.MS.MRG.3IMERG.' + dateString + '-S000000-E235959.V04',
            styles: 'chirps_style',
            transparent: true
          }
        };

        this.map.layers.forEach((layer, index) => {
          layer.visible = false;
        });

        const checkLayer = this.map.findLayerById('chirps:MK_3B-DAY-E.MS.MRG.3IMERG.' + dateString + '-S000000-E235959.V04');
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
    let date: Date = new Date(startDate.getTime());

    const frame = () => {
      if (!animating) {
        return;
      }

      this.getAnimationLayer(date);
      date.setDate(date.getDate() + 1);

      value += 1;
      if (value > 7) {
        value = 1;
        date = new Date(startDate.getTime());
      }

      this.setValue(value);

      // Update at 30fps
      setTimeout(function() {
        requestAnimationFrame(frame);
      }, 800 / 1);
    };

    frame();

    return {
      remove: function() {
        animating = false;
      }
    };
  }

}
