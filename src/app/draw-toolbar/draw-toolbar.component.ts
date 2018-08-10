import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { loadModules } from 'esri-loader';
import esri = __esri;

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrls: ['./draw-toolbar.component.css']
})
export class DrawToolbarComponent implements OnInit {
  @Input() map$: Observable<esri.Map>;
  @Input() mapView$: Observable<esri.MapView>;
  map: esri.Map;
  mapView: esri.MapView;
  sketchViewModel: esri.SketchViewModel;
  tempGraphicsLayer: esri.GraphicsLayer;

  toolClick: string;

  constructor() { }

  ngOnInit() {

    this.toolClick = 'inactive';
    this.map$.subscribe(map => {
      if (map) {
        this.map = map;
      }
    });

    this.mapView$.subscribe(view => {
      if (view) {
        this.mapView = view;
        loadModules([
          'esri/widgets/Sketch/SketchViewModel',
          'esri/Graphic',
          'esri/layers/GraphicsLayer'
        ])
        .then(([
          SketchViewModel,
          Graphic,
          GraphicsLayer
        ]) => {

          // GraphicsLayer to hold graphics created via sketch view model
          this.tempGraphicsLayer = new GraphicsLayer();
          this.map.layers.add(this.tempGraphicsLayer);
          // Graphics variable
          let updateGraphic;
          // let sketchViewModel: esri.SketchViewModel;

          const polygonSymbol = {
            type: 'simple-fill',
            color: 'rgba(138,43,226, 0.8)',
            style: 'solid',
            outline: {
              color: 'red',
              width: 1
            }
          };

          // ************************************************************************************
          // set up logic to handle geometry update and reflect the update on 'tempGraphicsLayer'
          // ************************************************************************************
          const setUpClickHandler = () => {
            this.mapView.on('click',  (evt) => {
              this.mapView.hitTest(evt).then((response) => {
                const results = response.results;
                // Found a valid graphic
                if (results.length && results[results.length - 1].graphic) {
                  // Check if we're already editing a graphic
                  if (!updateGraphic) {
                    // Save a reference to the graphic we intend to update
                    updateGraphic = results[results.length - 1].graphic;
                    // Remove the graphic from the GraphicsLayer
                    // Sketch will handle displaying the graphic while being updated
                    this.tempGraphicsLayer.remove(updateGraphic);
                    this.sketchViewModel.update(updateGraphic.geometry);
                  }
                }
              });
            });
          };

          // ************************************************************************************
          // adds graphics to the map after the event is fired on the sketchViewModel
          // ************************************************************************************
          const addGraphic = (evt) => {
            if (evt.type === 'draw-complete' || evt.type === 'update-complete') {
              /*const drawToolbars = document.getElementById('draw-toolbar').children;
              for (let i = 0; i < drawToolbars.length; i++) {
                console.log(drawToolbars[i]);
              }*/
              this.removeActiveToolBar();
            }
            const geometry = evt.geometry;
            // assign a symbol on the return geometry
            const symbol = polygonSymbol;

            // Create a new graphic; add it to the GraphicsLayer
            const graphic = new Graphic({
              geometry: geometry,
              symbol: symbol
            });
            // Remove before adding
            this.tempGraphicsLayer.removeAll();
            // Add after removing
            this.tempGraphicsLayer.add(graphic);
            // Remove stored reference to the updated graphic
            // Required in 'update-complete' callback specifically
            updateGraphic = null;
          };

          this.mapView.when(() => {
            // create a new sketch view model
            this.sketchViewModel = new SketchViewModel({
              view: this.mapView,
              layer: this.tempGraphicsLayer,
              polygonSymbol: polygonSymbol
            });

            setUpClickHandler();

            // ************************************************************
            // Get the completed graphic from the event and add it to view.
            // This event fires when user presses
            //  * "C" key to finish sketching point, polygon or polyline.
            //  * Double-clicks to finish sketching polyline or polygon.
            //  * Clicks to finish sketching a point geometry.
            // ***********************************************************
            this.sketchViewModel.on('draw-complete', addGraphic);
            this.sketchViewModel.on('update-complete', addGraphic);
            this.sketchViewModel.on('update-cancel', addGraphic);

            // ***************************************
            // activate the sketch to create a polygon
            // ***************************************
            // const drawPolygonButton = document.getElementById('polygonButton');
            // drawPolygonButton.onclick = function() {
              // set the sketch to create a polygon geometry
              // this.sketchViewModel.create('polygon', {mode: 'freehand'});
              // setActiveButton(this);
            // };

          }, err => {
            console.error(err);
          });

        })
        .catch(err => {
          console.error(err);
        });
      }
    });
  }

  removeActiveToolBar = () => {
    const elements = document.getElementsByClassName('draw-toolbar-active');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('draw-toolbar-active');
    }
  }

  setActiveButton = (selectedButton) => {

    /*const elements = document.getElementsByClassName('draw-toolbar-active');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('draw-toolbar-active');
    }*/
    this.removeActiveToolBar();
    if (selectedButton) {
      selectedButton.classList.add('draw-toolbar-active');
    }
  }

  // ***************************************
  // activate the sketch to create a polygon
  // ***************************************
  clickPolygonDrawing = (event) => {
    // set the sketch to create a polygon geometry
    this.sketchViewModel.create('polygon', { mode: 'click' });
    this.setActiveButton(event.currentTarget);
  }

  // ***************************************
  // activate the sketch to create a rectangle
  // ***************************************
  clickRectangleDrawing = (event) => {
    // set the sketch to create a polygon geometry
    this.sketchViewModel.create('rectangle', { mode: 'click' });
    this.setActiveButton(event.currentTarget);
  }

  // ***************************************
  // activate the sketch to create a circle
  // ***************************************
  clickCircleDrawing = (event) => {
    // set the sketch to create a polygon geometry
    this.sketchViewModel.create('circle', { mode: 'click' });
    this.setActiveButton(event.currentTarget);
  }

  // **************
  // reset button
  // **************
  clickResetButton = (event) => {
    this.sketchViewModel.reset();
    this.tempGraphicsLayer.removeAll();
    // this.setActiveButton(event.currentTarget);
    this.removeActiveToolBar();
  }

}
