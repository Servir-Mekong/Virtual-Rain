/*****************************Main Javscript*****************************/
/*	Main.js																*/
/*																		*/
/*	1. Display WMS Layers (Administrative, WMS IMERG etc.)				*/
/*	2. Stream Gauge Stations											*/
/*	3. Jason2 Data Chart Display										*/
/*	4. Rain Data Chart Display											*/
/*																		*/
/*																		*/
/*	Change History:														*/
/*		2016-09-01 Created, Matt He, GHRC. 								*/
/*																		*/
/*	To Do List:															*/
/*		1. Add TRMM Rain Data Display									*/
/*		2. WMS Overlay Aniamtion with selected date time				*/
/*		3. KML layers, need more instruction on this					*/
/************************************************************************/


$(function () {
	Shadowbox.init({
		continuous: false,
		counterType: "none",
		enableKeys: false
	});
});

$(document).mousemove(function (e) {
	mouseX = e.pageX;
	mouseY = e.pageY;
});
$(function () {

	getLatestTimeFromCapabilities()

});
$(function () {
	dropTheKey();
});

$(function () {
	$(".ranges ul li").addClass(function (index) {
		if (index == 6)
			return "active";
		else
			return ""
	});
	$(".ranges ul li").removeClass(function (index) {
		if (index == 7)
			return "active";
		else
			return ""
	});
});

/**
Billy makes this function for adding new layers on map. 

Loadingid is not used for now (showing a waiting image).
**/
 function BillyZ_Layer(objectName, layerName, loadingid, visible) {
    this.objectName = objectName;
    this.layerName = layerName;
    this.loadingid = loadingid;
    this.visible = visible;
}

var clusterLayer;
var imergupdate = 0;
var kmllayer;
var wmslayer, visibleLayerIds = [];

globalTheNewBase = "http://gis1.servirglobal.net/arcgis/services/Global/IMERG_30Min/MapServer/WMSServer";

/**
Start of Map Definition
Layers includes: WMS layers, ArcGIS Dynamic layers, KML Layers (for adding KML)
**/		  
require([
	"esri/map","esri/toolbars/draw", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ImageParameters", "esri/layers/WMSLayer", "esri/layers/WMSLayerInfo",
	"esri/layers/KMLLayer",  
	"dojo/parser", 
	"esri/TimeExtent",
	"esri/dijit/TimeSlider",
	"dojo/_base/array",
	"esri/SpatialReference",
	"esri/dijit/PopupTemplate",
	"esri/geometry/Point",
	"esri/geometry/webMercatorUtils",
	"extras/ClusterLayer", 
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/PictureMarkerSymbol",
	"esri/renderers/ClassBreaksRenderer",
	"dojo/_base/connect", "dojo/dom", "dojo/on", "dojo/query",
	"dojo/domReady!"
], function ( 
	Map, Draw, ArcGISDynamicMapServiceLayer, ImageParameters, WMSLayer, WMSLayerInfo, KMLLayer, parser,   
	TimeExtent,
	TimeSlider,
	arrayUtils, 
	SpatialReference,
	PopupTemplate, Point, webMercatorUtils,
	ClusterLayer,
	SimpleMarkerSymbol,
	SimpleFillSymbol,
	PictureMarkerSymbol,
	ClassBreaksRenderer,
	connect,dom, on, query
) {
	map = new Map("mapDiv", {
		basemap: "streets",
		center: [88.357568, 22.558854],
		//center: [31.15, 1.604],
		zoom: 4
	});
	
/**
Adding KML Layer, Need more instruction on this
**/	
    var kmlurl = "http://projects.itsc.uah.edu/webteam/Wyoming.kml";
	var kml = new esri.layers.KMLLayer(kmlurl);
	map.addLayer(kml);
			  
/**
Adding Dynamic Layers. 
This function only add an empty Layer on map. It need a "update function"
to show the actual layer. 
**/	  
	function createLayerFromObject(layerObject) {
		// myLayers.push(layerObject.layer);
		dojo.declare(layerObject.objectName, esri.layers.DynamicMapServiceLayer, {
			constructor: function () {
				var loading = dom.byId(layerObject.loadingid);
				this.initialExtent = this.fullExtent = map.Extent; 
				this.spatialReference = new esri.SpatialReference({ wkid: 102100 });
				this.loaded = true;
				this.onLoad(this);
				this.on("update-start", function () {
					isLayerLoading = true;
					esri.show(loading);
				});
				this.on("update-end", function () {
					isLayerLoading = false;
					esri.hide(loading);
				});
			}
		});
		var theObject = eval(layerObject.objectName);
		var theInstance = new theObject();
		theInstance.id = layerObject.layerName;
		theInstance.setOpacity(1);
		theInstance.setVisibility(layerObject.visible);
		myLayers.push(theInstance);
		map.addLayer(myLayers[myLayers.length - 1]);
	}
	
/**
Now we use above layer function to add a few layers. 
**/	
	createLayerFromObject(new BillyZ_Layer("my.IMERG", "1", "preciploading",true ));
	createLayerFromObject(new BillyZ_Layer("my.IMERG1Day", "2", "preciploading",false ));
	createLayerFromObject(new BillyZ_Layer("my.IMERG3Day", "5", "preciploading",false ));
	createLayerFromObject(new BillyZ_Layer("my.IMERG7Day", "8", "preciploading",false ));
	createLayerFromObject(new BillyZ_Layer("my.Country", "country", "preciploading",true ));
	createLayerFromObject(new BillyZ_Layer("my.Admin_1_earth", "admin_1_earth", "preciploading",true ));
	createLayerFromObject(new BillyZ_Layer("my.Admin_2_af", "admin_2_af", "preciploading",true ));
	createLayerFromObject(new BillyZ_Layer("my.Country", "country_highlight", "preciploading",true ));
	createLayerFromObject(new BillyZ_Layer("my.Admin_1_earth", "admin_1_earth_highlight", "preciploading",true ));
	createLayerFromObject(new BillyZ_Layer("my.Admin_2_af", "admin_2_af_highlight", "preciploading",true ));
	
	
/**
Draw Polygon
Polygon is draw using ESRI Toolbar
**/
	dojo.connect(map, "onLoad", initToolbar);  
	function initToolbar(map) {  
		tb = new esri.toolbars.Draw(map);  
		dojo.connect(tb, "onDrawEnd", addGraphic);  
	}  

/**
After draw points on map, this function collects all the data points,
and write json code for layer ClimateServ call (show data in the polygon area).
**/
	function addGraphic(geometry) {  
	  var graphic = new esri.Graphic(geometry, tb.fillSymbol);  
	  map.graphics.add(graphic);  
	  var extent = geometry.getExtent();  
	  var jsonoutput = graphic.geometry.toJson();

	  var jsonstr = jsonoutput['rings'];

	  var jsonarr = jsonstr.toString().split(",");
//Write to json
	  currentStringPolygon = '{"type":"Polygon","coordinates":[[';
	  for(i=0; i<jsonarr.length; i=i+2) {
		  var value = webMercatorUtils.xyToLngLat(jsonarr[i], jsonarr[i+1], true);
		  if(i==0) currentStringPolygon = currentStringPolygon + '[' + value + ']';
		  else    currentStringPolygon = currentStringPolygon + ',[' + value + ']'; 
	  }
	  currentStringPolygon = currentStringPolygon + ']]}';
	  
	  tb.deactivate();
	}
	
/**
Now add Mouse Location on Map. 
**/
	map.on("load", function () {
		addClusters(Stations);
		map.on("mouse-move", showCoordinates);
		map.on("mouse-drag", showCoordinates);
	});

	function showCoordinates(evt) {
		//the map is in web mercator but display coordinates in geographic (lat, long)
		var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
		//display mouse coordinates
		dom.byId("mouseinfo").innerHTML = ""+ mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
	}

/**
When user selected an admin area, the highlighted layer is on. 
If user zoom, then the admin layer is gone, only the hightlighted layer. 
Following handles map zoom event. 
But only one layer is on. 
**/

	var mapExtentChange = map.on("extent-change", changeHandler);

	function changeHandler(evt){
		//alert("changed");
		var extent = evt.extent,
		zoomed = evt.levelChange;
		var curLayerName = "country";
		//alert(currentLayer);
		if(currentLayer) {
			if(currentLayer == "country_highlight") { curLayerName = "country"; }//updateAdminLayer(0); }//addCountryLayer(0); updateMyFeatureLayer(theID); }
			if(currentLayer == "admin_1_earth_highlight") { curLayerName = "admin_1_earth";}// updateAdminLayer(1); }//addCountryLayer(1); updateMyFeatureLayer(theID); }
			if(currentLayer == "admin_2_af_highlight") { curLayerName = "admin_2_af";}// updateAdminLayer(2); }//addCountryLayer(2); updateMyFeatureLayer(theID); }
		}
		
		//in some cases, you may want to disconnect the event listener
		//mapExtentChange.remove();
	}


	
/**
For Map Click to show highlighed area
Note: Click on map should not triggle polygon drawing

Once user clicks on map, cursor location is detected, then we use cursor location
to form a small bbox, then use this bbox to get the layer feature id.

Issues: if map is zoom out, this small bbox can be really big, big enough to include several 
feature id. This will cause problem. Easiest solution is to reduce the bbox size, or determine 
which feature id to use if several are returned. 
**/
	map.on("click", function (evt) {
		/*Check for feature info if select is enabled */
		if(currentLayer == "country_highlight") currentLayer = "country";
		if(currentLayer == "admin_1_earth_highlight") currentLayer = "admin_1_earth";
		if(currentLayer == "admin_2_af_highlight") currentLayer = "admin_2_af";
		
		if(currentLayer == "country" || currentLayer == "admin_1_earth" || currentLayer == "admin_2_af") {
			clickdata = evt; //Debug purposes only
			
			var theExtent = map.extent;
			var mbbox = theExtent.xmin + "%2c" + theExtent.ymin + "%2c" + theExtent.xmax + "%2c" + theExtent.ymax;  //-12000001.944541954%2C-3484849.229161102%2C6462292.11934147%2C5956652.504621359 xmin, ymin, xmax, yma
			var layerX = evt.x;
			var layerY = evt.y;
			var viewH = evt.view.innerHeight;
			var viewW = evt.view.innerWidth;
			var xx = evt.mapPoint.x;
			var yy = evt.mapPoint.y;
			mbbox = 0.999999*xx + "%2c" + 0.999999*yy + "%2c" + 1.000001*xx + "%2c" +1.000001*yy;
			urlurl = "http://climateserv.servirglobal.net/cgi-bin/servirmap_102100?&SERVICE=WMS&VERSION=1.1.1&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=country&LAYERS=country&TILED=true&INFO_FORMAT=json&I=" + layerX + "&J=" + layerY + "&WIDTH=" + viewW + "&HEIGHT=" + viewH + "&CRS=EPSG:102100&BBOX=" + mbbox;
			if($("#admin-admin1").is(":checked"))  {  
				urlurl = "http://climateserv.servirglobal.net/cgi-bin/servirmap_102100?&SERVICE=WMS&VERSION=1.1.1&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=admin_1_earth&LAYERS=admin_1_earth&TILED=true&INFO_FORMAT=json&I=" + layerX + "&J=" + layerY + "&WIDTH=" + viewW + "&HEIGHT=" + viewH + "&CRS=EPSG:102100&BBOX=" + mbbox;
			}
			if($("#admin-admin2").is(":checked"))  {  
				urlurl = "http://climateserv.servirglobal.net/cgi-bin/servirmap_102100?&SERVICE=WMS&VERSION=1.1.1&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=admin_2_af&LAYERS=admin_2_af&TILED=true&INFO_FORMAT=json&I=" + layerX + "&J=" + layerY + "&WIDTH=" + viewW + "&HEIGHT=" + viewH + "&CRS=EPSG:102100&BBOX=" + mbbox;
			}
			$.ajax({
				url: urlurl,
				dataType: 'jsonp',
				type: 'POST',
				success: function (data, textStatus, jqXHR) {
					anObject = data;
					theID = data['data'];				
					climateServFeatureID = theID;
					updateMyFeatureLayer(theID);
					console.log('success');
					console.log(theID);
					console.log(textStatus);
					console.log(jqXHR);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log('error'); 		//<-- the response lands here ...
					console.log(jqXHR); 		//<-- the console logs the object
					console.log(textStatus); 	//<-- the console logs 'parsererror'
					console.log(errorThrown);	//< -- the console logs 'SyntaxError {}'
				},
				complete: function (jqXHR, textStatus) {
					console.log('complete');
					console.log(jqXHR);
					console.log(textStatus);
				}
			});
		}
	});

/**
Once user select an area, this function update the layer, and apply "highlighted layer"
on top of the adminstrative layer. 
**/
	function updateMyFeatureLayer(feat_ids) {
		var updateLayer = currentLayer;	
		if(currentLayer == "country") { currentLayer = "country_highlight"; updateLayer = currentLayer + ",country" ; }
		if(currentLayer == "admin_1_earth") { currentLayer = "admin_1_earth_highlight"; updateLayer = currentLayer + ",admin_1_earth" ; }
		if(currentLayer == "admin_2_af") { currentLayer = "admin_2_af_highlight"; updateLayer = currentLayer + ",admin_2_af" ; }
		var theSelectionLayer = map.getLayer(currentLayer);
		//alert("currentlayer=" + currentLayer);
		
		theSelectionLayer.getImageUrl = function (extent, width, height, callback) {
			var params = {
				request: "GetMap",
				transparent: true,
				format: "image/png",
				bgcolor: "ffffff",
				version: "1.1.1",
				layers: updateLayer,//currentLayer,
				styles: "default,default,default,default",
				exceptions: "application/vnd.ogc.se_xml",
				feat_ids: feat_ids,
				bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
				srs: "EPSG:" + extent.spatialReference.wkid,
				width: width,
				height: height
			};
			callback(globalTheNewBase + dojo.objectToQuery(params));
		}
		theSelectionLayer.refresh();
	}
//*************************End: Map Click Highlight*********************//

/**
Add Stream Gauge Location
Location information is in Javascript file

**/
	function addClusters(resp) {
		//alert(1);
		afteraddC = resp;
		photoInfo = {};

		var wgs = new SpatialReference({
			"wkid": 4326
		});
		globalSpatialReference = SpatialReference;
		//alert(2);
		photoInfo.data = arrayUtils.map(resp, function (p) {
			//alert(3);
			total.push(p);
			var latlng = new esri.geometry.Point(parseFloat(p.attributes.Lon), parseFloat(p.attributes.Lat), wgs);
			var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
			globalwebMercator.push(webMercator);
			var viewgraph = "viewGraph('";
			//var viewgraph = "javascript:viewGraph('";
			var closeview = "')";

			stationIDList.push(p.attributes.Rout_Name);
			// alert(4);
			var attributes = {
				"Country": p.attributes.River,
				"Name": p.attributes.Basin.replace(/([a-z])([A-Z])/g, '$1 $2'),
				"StationID": p.attributes.Rout_Name,
				"GraphLink": '<span class="viewGraphLink" ><div id="chartContainer"></div></span>'

			};

			return {
				"x": webMercator.x,
				"y": webMercator.y,
				"attributes": attributes
			};
		});

// popupTemplate to work with attributes specific to this dataset
		var popupTemplate = new PopupTemplate({
			"title": "",
			"fieldInfos": [{
				"fieldName": "StationID",
				"label": "Name: ",
				visible: true
			}, {
				"fieldName": "GraphLink",
				"label": " ",
				visible: true
			}]
		});



// cluster layer that uses OpenLayers style clustering
		clusterLayer = new ClusterLayer({
			"data": photoInfo.data,
			"distance": 30,
			"id": "RiverGaugeStations",
			"labelColor": "#fff",
			"labelOffset": 10,
			"resolution": map.extent.getWidth() / map.width,
			"singleColor": "#888",
			"singleTemplate": popupTemplate
		});

		var defaultSym = new SimpleMarkerSymbol().setSize(4);
		var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

		var picBaseUrl = "https://static.arcgis.com/images/Symbols/Shapes/";
		var blue = new PictureMarkerSymbol(picBaseUrl + "BluePin1LargeB.png", 32, 32).setOffset(0, 15);
		var green = new PictureMarkerSymbol(picBaseUrl + "GreenPin1LargeB.png", 64, 64).setOffset(0, 15);
		var red = new PictureMarkerSymbol(picBaseUrl + "RedPin1LargeB.png", 72, 72).setOffset(0, 15);
		renderer.addBreak(0, 6, blue);
		renderer.addBreak(6, 50, green);
		renderer.addBreak(50, 1001, red);

		clusterLayer.setRenderer(renderer);
		map.addLayer(clusterLayer);

// close the info window when the map is clicked
		map.on("click", cleanUp);
// close the info window when esc is pressed
		map.on("key-down", function (e) {
			if (e.keyCode === 27) {
				cleanUp();
			}
		});
		connect.connect(clusterLayer._map.infoWindow, "onSelectionChange", function () {
			try {
				currentData = [];
				if ("#chartContainer") {
					if (clusterLayer._map.infoWindow._maximized) {

						loadGraphCombined(true);
					}
					else {
						loadGraphCombined();
					}
				}
				else {
					setTimeout(
						function () {
							if (clusterLayer._map.infoWindow._maximized) {

								loadGraphCombined(true);
							}
							else {
								loadGraphCombined();
							}
						}
						, 100);
				}
			}
			catch (e) { }

		});
		connect.connect(clusterLayer._map.infoWindow, "onMaximize", function () {
			$(".loading").show();
			$("#chartContainer").empty();
			setTimeout(function () {
				loadGraphCombined(true);
			}, 250);

		});
		connect.connect(clusterLayer._map.infoWindow, "onRestore", function () {
			$(".loading").show();
			$("#chartContainer").empty();
			setTimeout(function () {
				loadGraphCombined();
			}, 250);
		});
		dojo.connect(clusterLayer._map.infoWindow, "onHide", function () {

			currentData = [];

		});
		map.on("pan-start", function (layer) {
			try {
				clusterLayer._map.infoWindow.hide();
			}
			catch (e) { }
		});
	}
	
	function cleanUp() {
		map.infoWindow.hide();
		clusterLayer.clearSingles();
	}
	
	window.map.infoWindow.domNode.getElementsByClassName("actionList")[0].appendChild(document.getElementById("downloadlinkholder").firstChild);
	window.map.infoWindow.domNode.getElementsByClassName("actionList")[0].appendChild(document.getElementById("csvdownloadlinkholder").firstChild);
});
//End arcGIS Require stuff

/**
For Animation:
For now, we use simplest way.
Since we don't know when the newest image comes, we use images that are 10 hours old images. 
We simply use 
**/
var mytimeout;
function animateimerg() {
	clearInterval(mytimeout);

	var dd = 0;
	var k=0;
	mytimeout = window.setInterval(function () {
		k = dd%8;
		var currenttimestart = moment().subtract(19-k, 'hour').format('YYYY-MM-DDThh'); 
		theDateString = currenttimestart+":00:00Z/"+currenttimestart+":30:00Z";
		updateMyLayer(theDateString);
		dd++;
	}, 1000);
}

function stopAnimation() {
	try {
		clearInterval(mytimeout);
	}
	catch (e) { }
}
		
/**
Animation Control.
**/
function animationControl(ind) {
	if(ind==-1) {
		if(imergupdate == 0) { $('#imergoverlay').attr('checked','checked');$('#imergoverlay').prop('checked', true); animateimerg(); imergupdate++; }
		else{ 
			stopAnimation();
			var mylayer = map.getLayer("1");
			if(mylayer.visible == false) {  mylayer.setVisibility(true);$('#imergoverlay').attr('checked','checked');$('#imergoverlay').prop('checked', true);}
			else {  mylayer.setVisibility(false);$('#imergoverlay').attr('checked','unchecked');$('#imergoverlay').prop('checked', false);}
		}
	}
	//alert("ind="+ind);
	if(ind==2 || ind == 5 || ind==8) {	
		var layerName = "" + ind;
		var mylayer = map.getLayer(layerName);
		var idname = "imerg"+ind+"dayoverlay";
		if(ind == 2) idname = "imerg1dayoverlay";if(ind == 5) idname = "imerg3dayoverlay";if(ind == 8) idname = "imerg7dayoverlay";
		//alert(idname + " " + $('#' + idname).value);
		if(mylayer.visible == false) {  updateIMERGLayer(ind); $('#' + idname).attr('checked','checked');$('#' + idname).prop('checked', true); }
		else {  mylayer.setVisibility(false);$('#' + idname).attr('checked','unchecked');$('#' + idname).prop('checked', false);}
	}
}

//Update Image Layer (All these update function can be combined, but now for debug, we separate them)
function updateIMERGLayer(which) {
	globalTheNewBase = "http://gis1.servirglobal.net/arcgis/rest/services/Global/IMERG_Accumulations/MapServer";
	globalTheNewBase = "http://gis1.servirglobal.net/arcgis/services/Global/IMERG_Accumulations/MapServer/WMSServer";
	hideAdminLayers();
	if (!currentLayer) {
		currentLayer = which;
	}
	if (!map) {
		/*   settimeout  */
		setTimeout(function () { updateIMERGLayer(which); }, 250);
	}
	else {
		var mylayer = map.getLayer(which);
		mylayer.getImageUrl = function (extent, width, height, callback) {
			var params = {
				request: "GetMap",
				transparent: true,
				format: "image/png",
				bgcolor: "ffffff",
				version: "1.1.1",
				layers: which, //"1",//LayerIDs[currentLayer],//"26,43,60,77", //"CREST_QPF_Rain",
				styles: "default",
				exceptions: "application/vnd.ogc.se_xml",
				//time: span,//"2015-11-30T00:00:01.000Z/2015-12-01T00:00:01.000Z", //"2014-04-02T09:00:00.000Z",
				//changing values
				bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
				srs: "EPSG:" + extent.spatialReference.wkid,
				width: width,
				height: height
			};
			//if(currentLayer == "1") {
				callback(globalTheNewBase + "?" + dojo.objectToQuery(params));
			//}
		}
		mylayer.setVisibility(true);
		mylayer.refresh();
	}
}

function pickDate(which) {

	globalTheNewBase = "http://gis1.servirglobal.net/arcgis/services/Global/IMERG_30Min/MapServer/WMSServer";
	//alert("admin cleared");
	if(imergupdate == 0) { //alert(imergupdate);
		theDateString = "2016-10-01T12:00:00.000Z/2016-10-01T12:30:00.000Z";
		if(k==0) theDateString = "2016-10-01T12:00:00.000Z/2016-10-01T12:30:00.000Z";
		if(k==1) theDateString = "2016-10-02T12:00:00.000Z/2016-10-02T12:30:00.000Z";
		if(k==2) theDateString = "2016-10-03T12:00:00.000Z/2016-10-03T12:30:00.000Z";
		if(k==3) theDateString = "2016-10-04T12:00:00.000Z/2016-10-04T12:30:00.000Z";
		if(k==4) theDateString = "2016-10-05T12:00:00.000Z/2016-10-05T12:30:00.000Z";
		updateMyLayer(theDateString);
		imergupdate++;
		$('#imergoverlay').attr('checked','checked'); $('#imergoverlay').prop('checked', true);
	}else{//alert(imergupdate);
	
		var mylayer = map.getLayer("1");
		if(mylayer.visible == false) {  mylayer.setVisibility(true);$('#imergoverlay').attr('checked','checked');$('#imergoverlay').prop('checked', true);}
		else {  mylayer.setVisibility(false);$('#imergoverlay').attr('checked','unchecked');$('#imergoverlay').prop('checked', false); }
	}				
}
		
//Update Animation Layer		
function updateAdminLayer(which) {
	if (!map) {
		/*   settimeout  */
		setTimeout(function () { updateAdminLayer(which); }, 250);
	}
	else {
		currentLayer = "country";
		var mylayer = map.getLayer("country");
		var myhighlightlayer = map.getLayer("country_highlight"); 
		if(which == 1) {  currentLayer = "admin_1_earth"; mylayer = map.getLayer("admin_1_earth");  myhighlightlayer = map.getLayer("admin_1_earth_highlight"); }
		if(which == 2) {  currentLayer = "admin_2_af"; mylayer = map.getLayer("admin_2_af");  myhighlightlayer = map.getLayer("admin_2_af_highlight"); }
		
		var mylayer = map.getLayer("country");
		//alert(currentLayer);
		mylayer.getImageUrl = function (extent, width, height, callback) {
			var params = {
				request: "GetMap",
				transparent: true,
				format: "image/png",
				bgcolor: "ffffff",
				version: "1.1.1",
				layers: currentLayer,
				styles: "default",
				exceptions: "application/vnd.ogc.se_xml",
				bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
				feat_ids: "", //232
				srs: "EPSG:" + extent.spatialReference.wkid,
				width: width,
				height: height
			};
			
			callback(globalTheNewBase + dojo.objectToQuery(params));
			
		}
		mylayer.setVisibility(true);
		myhighlightlayer.setVisibility(true);
		mylayer.refresh();

	}
}
		
		
//Update Image Layer (All these update function can be combined, but now for debug, we separate them)
function updateMyLayer(span) {
	//alert(span);
	hideAdminLayers();
	currentTimeSpan = span;
	if (!currentLayer) {
		currentLayer = "Precipitation";
		currentLayer = "1";
	}
	if (!map) {
		/*   settimeout  */
		setTimeout(function () { updateMyLayer(span); }, 250);
	}
	else {
		//var mylayer = map.getLayer(currentLayer);
		var mylayer = map.getLayer("Precipitation");
		var mylayer = map.getLayer("1");
//alert(globalTheNewBase);
		mylayer.getImageUrl = function (extent, width, height, callback) {
			var params = {
				request: "GetMap",
				transparent: true,
				format: "image/png",
				bgcolor: "ffffff",
				version: "1.1.1",
				layers: "1",//LayerIDs[currentLayer],//"26,43,60,77", //"CREST_QPF_Rain",
				styles: "default",
				exceptions: "application/vnd.ogc.se_xml",
				time: span,//"2015-11-30T00:00:01.000Z/2015-12-01T00:00:01.000Z", //"2014-04-02T09:00:00.000Z",
				//changing values
				bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
				srs: "EPSG:" + extent.spatialReference.wkid,
				width: width,
				height: height
			};
			//if(currentLayer == "1") {
				callback(globalTheNewBase + "?" + dojo.objectToQuery(params));
			//}
		}
		mylayer.setVisibility(true);
		mylayer.refresh();
		//mylayer.setOpacity(tapSlider.noUiSlider.get() * .01);
	}
}

/**
Old CreateLayer function. No longer used. 
**/
function createLayer(variableindex, objectName, layerName) {
	dojo.declare(objectName, esri.layers.DynamicMapServiceLayer, {
		constructor: function () {
			this.initialExtent = this.fullExtent = map.Extent;
			this.spatialReference = new esri.SpatialReference({ wkid: 102100 });
			this.loaded = true;
			this.onLoad(this);
		},
		getImageUrl: function (extent, width, height, callback) {
			var params = {
				request: "GetMap",
				transparent: true,
				format: "image/png",
				bgcolor: "ffffff",
				version: "1.1.1",
				layers: layerName,
				styles: "default",
				exceptions: "application/vnd.ogc.se_xml",
				bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
				feat_ids: "", //232
				srs: "EPSG:" + extent.spatialReference.wkid,
				width: width,
				height: height
			};
			callback(globalTheNewBase + dojo.objectToQuery(params));
		}
	});
	var theObject = eval(objectName);
	myLayers[variableindex] = new theObject();
	myLayers[variableindex].id = layerName;
	myLayers[variableindex].setOpacity(1);
	myLayers[variableindex].setVisibility(true);
	map.addLayer(myLayers[variableindex]);
	currentLayer = layerName;
}

function hideOneLayer(which) {
	//alert(which);
	if(which) {
		var mylayer = map.getLayer(which);
		if(mylayer.visible == true) { mylayer.setVisibility(false); }
	}else{ };//alert("trying to hide undefined layer"); }
}
function hideAdminLayers(){
	hideOneLayer("country");
	hideOneLayer("country_highlight");
	hideOneLayer("admin_1_earth");
	hideOneLayer("admin_1_earth_highlight");
	hideOneLayer("admin_2_af");
	hideOneLayer("admin_2_af_highlight");
}
function hideAdminLayerExcept(which){
	//alert("which");
	if(which!=0){
		//alert("which=0");
		hideOneLayer("country");
		hideOneLayer("country_highlight");
	}
	if(which != 1){//alert("which=1");
		hideOneLayer("admin_1_earth");
		hideOneLayer("admin_1_earth_highlight");
	}
	if(which !=2){//alert("which=2");
		hideOneLayer("admin_2_af");
		hideOneLayer("admin_2_af_highlight");
	}
}

function addCountryLayer(which) {
//alert("add layer " + which);

	map.graphics.clear();
	globalTheNewBase = "http://climateserv.servirglobal.net/cgi-bin/servirmap_102100?";
	if(which == -1) { hideAdminLayers();  }//hideAdminLayerExcept(0); }
	if(which == 0) { hideOneLayer(currentLayer); updateAdminLayer(0); }//hideAdminLayerExcept(0); }
	if(which == 1) { hideOneLayer(currentLayer); updateAdminLayer(1); }//hideAdminLayerExcept(1); }
	if(which == 2) { hideOneLayer(currentLayer); updateAdminLayer(2); }//hideAdminLayerExcept(2); }
}

//Zoom to Stream Gauge Country
function zoomToPlace(lon, lat, scale) {
	var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));
	map.centerAndZoom(pt, scale);
}
//<select id="vsgselectcountry" onChange="vsgselectgauge();"><option value="Cambodia">Cambodia</option><option value="Lao PDR">Lao PDR</option><option value="Myanmar">Myanmar</option><option value="Thailand">Thailand</option><option value="Vietnam">Vietnam</option>
function vsgselectgauge() {
	var selectBox = document.getElementById("vsgselectcountry");
	var selectedValue = selectBox.options[selectBox.selectedIndex].value;
	if(selectBox.selectedIndex == 0) zoomToPlace(105.3, 12.3, 8); 
	if(selectBox.selectedIndex == 1) zoomToPlace(104.5, 16.7, 7); 
	if(selectBox.selectedIndex == 2) zoomToPlace(96.2, 18.1, 6); 
	if(selectBox.selectedIndex == 3) zoomToPlace(101.2, 10.9, 6); 
	if(selectBox.selectedIndex == 4) zoomToPlace(108.3, 12.8, 7); 
}

//End: Zoom to Stream Gauge Country

var resizeId;
var rtime;
var timeout = false;
var delta = 500;
$(window).resize(function () {
	//alert("window resized");
	clearTimeout(resizeId);
	rtime = new Date();
	if (timeout === false) {
		timeout = true;
		resizeId = setTimeout(resizeend, delta);
	}
	pageresized();
});

function resizeend() {
	if (new Date() - rtime < delta) {
		setTimeout(resizeend, delta);
	} else {
		timeout = false;
		if (clusterLayer._map.infoWindow.isShowing) {
			if (clusterLayer._map.infoWindow._maximized) {
				clusterLayer._map.infoWindow.hide();
				clusterLayer._map.infoWindow.restore();
				clusterLayer._map.infoWindow.maximize();
				clusterLayer._map.infoWindow.show();

			}
			else {
				loadGraphCombined();
			}
		}
	}
}


function dropRain(theRain) {
	if (theLatestTime != "") {

		try {
			map.addLayers([theRain]);
		}
		catch (e) { }

		var split1 = theLatestTime.split("/");

		var fstart = split1[0];
		var fend = split1[1];
		var splitStart = fstart.split("-");
		var splitEnd = fend.split("-");
		earlyTime = splitStart[1] + "/" + (splitStart[2].substring(0, 2) * 1 + 1) + "/" + splitStart[0] + " UTC";
		LastTime = splitEnd[1] + "/" + splitEnd[2].substring(0, 2) + "/" + splitEnd[0] + " UTC";
		// map.on("layers-add-result", globalinitSlider());
	}
	else {
		setTimeout(
			function () {
				dropRain(theRain);
			}
			, 100);
	}

}
function dropTheKey() {
	var areaDiv = $("#mapDiv_zoom_slider");
	if (areaDiv.length == 0) {
		setTimeout(
			function () {
				dropTheKey();
			}
			, 100);
	}
	else {
		areaDiv.append("<div id='legendKey' onclick='showLegend();'><span class='helper'></span></div>");
	}
}
var jspanel;

function showLegend() {

	try {
		if (jspanel) {
			jspanel.close();
		}
	}
	catch (e) { }
	/*get active layer, replace title with correct title
	and image with correct image*/
	var activeTitle = currentLayer + " Legend";
	var activeImage = "images/legend_" + currentLayer + ".png";

	jspanel = $.jsPanel({
		id: 'vic_legend',
		title: activeTitle,
		size: { width: 410, height: 170 },
		position: { top: 12, right: 52 },
		controls: {
			buttons: 'closeonly'
		},
		resizable: "disabled",
		theme: "black",
		content: "<div class='preloader'><img src='" + activeImage + "'></div>"
	});
}

/**
Following is for Billy's time bar. It is not used in this, but
in case we will implement time bar.
**/
var theEndMoment = moment().add(6, 'months').format('YYYY-MM-DD');
$(function () {

	var items = new vis.DataSet([
{ id: 'A', content: 'Hindcast', start: '2002-01-01', end: moment().subtract(7, 'days').format('YYYY-MM-DD'), type: 'background' },
{ id: 'B', content: 'Forecast', start: moment().format('YYYY-MM-DD'), end: theEndMoment, type: 'background', className: 'negative' }

	]);

	var container = document.getElementById('visualization');
	/* These options set the start and end dates as well as the max and min range of the timeline*/
	var options = {
		start: '2016-01-01',
		end: moment().add(3, 'months').format('YYYY-MM-DD'),
		selectable: true,
		min: new Date(2002, 0, 1),
		max: new Date(theEndMoment),
		zoomMin: 86400000 * 7 //1000 * 60 * 60 * 24
	};

	timeline = new vis.Timeline(container, items, options);

	timeline.on('click', function (properties) {
		logEvent('select', properties);
		pickDate(properties);
	});
	timeline.on('rangechanged', function (properties) {
		var theRange = timeline.getWindow();
		myChanger(moment(theRange.start), moment(theRange.end));
		// alert(0);
		try {
			if (map.infoWindow.isShowing) {

				if (map.infoWindow._maximized) {

					loadGraphCombined(true, true);

				}
				else {

					loadGraphCombined(false, true);
				}
			}

		}
		catch (e) { }

	});

});
var isfirst = true;
function checkFirst() {
	// alert(0);
	if (isfirst) {
		isfirst = false;
		$(".ranges ul li").addClass(function (index) {
			if (index == 6)
				return "active";
			else
				return ""
		});
		$(".ranges ul li").removeClass(function (index) {
			if (index == 7)
				return "active";
			else
				return ""
		});
	}
}
$(function () {

	function cb(start, end) {
		$('#reportrange span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));

	}
	myChanger = cb;
	// cb(moment().subtract(29, 'days'), moment());
	cb(moment(new Date(2002, 0, 1)), moment(new Date(theEndMoment)));
	$('#reportrange').daterangepicker({
		ranges: {
			'Last 7 Days': [moment().subtract(6, 'days'), moment()],
			'Last 30 Days': [moment().subtract(29, 'days'), moment()],
			'This Month': [moment().startOf('month'), moment().endOf('month')],
			'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month'), ],
			'Next Month': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month'), ],
			'Full Forecast': [moment().add(1, 'month').startOf('month'), moment().add(3, 'month').endOf('month'), ],
			'Full Data': [new Date(2002, 0, 1), new Date(theEndMoment)]
		},
		onOpen: function () { checkFirst() },
		"drops": "up",
		"opens": "right"
	}, cb);
	$('#reportrange').on('apply.daterangepicker', function (ev, picker) {

		logEvent('date', picker.startDate.format('YYYY-MM-DD'));
		logEvent('date', picker.endDate.format('YYYY-MM-DD'));
		updateTimeline(picker.startDate, picker.endDate);
	});

});

function pageresized()
{
	if($('#timeindicator').is(":visible"))
	{
		var theTop = $("#timeline").position().top - 32;
		var theLeft;
	   
		theLeft = $(window).width()/2 - $("#timeindicator").width()/2;
	   
		$('#timeindicator').css({ 'top': theTop, 'left': theLeft }).fadeIn('slow');
	}
	if($('#vic_legend').is(":visible")){
		showLegend();
	}
}




function updateTimeline(startDate, EndDate) {
	timeline.range.start = startDate;
	timeline.range.end = EndDate;
	timeline.redraw();
}


		
var debugjsondate;
function getLatestTimeFromCapabilities() {

	theLatestTime = '';
}
function logEvent(event, properties) {
	var log = document.getElementById('log');
	var msg = document.createElement('div');
	msg.innerHTML = 'event=' + JSON.stringify(event) + ', ' + 'properties=' + JSON.stringify(properties);
	log.firstChild ? log.insertBefore(msg, log.firstChild) : log.appendChild(msg);
}
function debugOn() {
	$('#log').show();
}
function debugOff() {
	$('#log').hide();
}

function hideAllLayers(LeaveOn) {
	if (LeaveOn) {
		//alert(0);
		for (var i = 0; i < map.layerIds.length; i++) {
			if (map.layerIds[i] == "layer0" || map.layerIds[i] == LeaveOn.id) { }
			else {
				try {
					var targetLayer = map.getLayer(map.layerIds[i]);
					targetLayer.setVisibility(false);
				}
				catch (e) { }
				if ($("#" + map.layerIds[i]).hasClass('checked')) {
					$("#" + map.layerIds[i]).toggleClass('checked');
				}
			}
		}
	}
	else {
		for (var i = 0; i < map.layerIds.length; i++) {
			if (map.layerIds[i] == "layer0") { }
			else {
				try {
					var targetLayer = map.getLayer(map.layerIds[i]);
					targetLayer.setVisibility(false);
				}
				catch (e) { }
				if ($("#" + map.layerIds[i]).hasClass('checked')) {
					$("#" + map.layerIds[i]).toggleClass('checked');
				}
			}
		}
	}
}
// currentLayer = "Precipitation";
//$(".jsPanel")[0]
/**
Billy's old code, not used. 
**/
function toggleLayer(which) {

	if (which.id == "RiverGaugeStations")
	{ }
	else {
		hideAllLayers(which);
	}
	try {
		try {
			if (currentLayer == which.id) {
				currentLayer = "";
				map.infoWindow.hide();
				jspanel.close();
			}
			else if (which.id != "RiverGaugeStations") {
				currentLayer = which.id
				currentData = [];
				if ($(".jsPanel")[0]) {
					showLegend();
				}
			}
			var targetLayer = map.getLayer(which.id);
			targetLayer.setVisibility(!targetLayer.visible);
			//currentTimeSpan = "2016-10-02T00:00:01.000Z/2016-10-05T23:59:01.000Z";
			updateMyLayer(currentTimeSpan);
		}
		catch (e) { }
		this.checked = targetLayer.visible;
		//map.infoWindow.hide();
	}
	catch (e) { }

	try {
		if (map.infoWindow.isShowing) {

			if (map.infoWindow._maximized) {

				loadGraphCombined(true);
			}
			else {

				loadGraphCombined();
			}
		}

	}
	catch (e) { }
}


$(document).ready(function () {
	$(".checkbox").click(function () {
		$(this).toggleClass('checked');
		//toggleLayer(this);

	});
});

var debugstart;
var debugend;

var dataType;
function loadGraphCombined(maximize, rangechanged) {

	if (currentData.length == 0 || rangechanged) {


		// Will need to query for data by date range like:

		var lineRange = timeline.getWindow();
		var startDate = moment(lineRange.start).format('YYYY-MM-DD');
		var endDate = moment(lineRange.end).format('YYYY-MM-DD');


		debugstart = startDate;
		debugend = endDate;

		if (numDaysInRange() > 600) {
			//alert("You have selected a large date range the query will take several seconds");
			$(".loading").show();
			$(".loadingmessage").show();
			// $(".loadingmessage").
		}

		//StationID is found here
		var stationID = clusterLayer._map.infoWindow.features[clusterLayer._map.infoWindow.selectedIndex].attributes.StationID;
		dataType = currentLayer;

		/*************************Temp line, change to below when i get data***************************/
		startDate = document.getElementById("startdate").value;
		endDate   = document.getElementById("enddate").value;
		//alert(stationID+ " " +startDate + " " + endDate);
		getData(stationID, startDate, endDate, dataType, maximize);
	}
	else {
		loadGraphCombinedOLD(maximize);
	}

}



/**
Create Chart using Data from querying database
**/
var myChart;
function loadGraphCombinedOLD(maximize) {
	$("#chartContainer").empty();

	$(".loading").show();
	var x;
	var y1;
	var y2;
	var height = 230;
	var width = 230;
	if (maximize) {
		height = $(".sizer.content").height() - 65;

		width = $(".sizer.content").width() - 60;
	}
	if ("#chartContainer") {
		console.warn('width: ' + width);
		$("#chartContainer svg").css('width', width);
		svg = dimple.newSvg("#chartContainer", width, height);
	}
   
	//var dataType = "Streamflow";
	var dataType = "Water Elevation";
	myChart = new dimple.chart(svg, currentData);
	if (maximize) {
		myChart.setBounds(60, 30, width - 120, height - 125);
	}
	else {
		myChart.setBounds(60, 30, 180, 165);
	}
	x = myChart.addTimeAxis("x", "Date", "%m/%d/%Y", "%m/%d/%Y");
	y1 = myChart.addMeasureAxis("y", "Value", " Meters above Sea Level");
        //y1 = myChart.addMeasureAxis("y", "Value", " in m3/s");
	var series = myChart.addSeries(dataType, dimple.plot.line, [x, y1]);
	series.getTooltipText = function (e) {

		return [
			"Water Elevation",//"Streamflow",
			"Date: " + moment(e.x).format("MM/DD/YYYY"),
			"Value: " + e.y + " meters"
		];
	};

	/*I can assign color by type of data if needed */

	myChart.assignColor(dataType, "#FABF8F");
  
	myChart.addLegend("100%", 0, 0, "auto", "Right");
	myChart.draw();
	y1.titleShape.text("Meters above Sea Level");

	if (numDaysInRange() > 7) {
		$('.tick').each(function (i, obj) {
			if (i % 2 && "text - anchor")
				$(this).hide();
		});

		$('.tick text').each(function (i, obj) {
			if (i % 2 && $(this).css("text - anchor") == "start")
				$(this).hide();
			//tickList.push($(this));
		});
	}

	$(".loading").hide();
	$(".loadingmessage").hide();
	updateDownloadData();
	$("#chartContainer svg").css('width', width + 20);
}
function numDaysInRange() {
	var theRange = timeline.getWindow();
	var calRange = moment.range(new Date(theRange.start), new Date(theRange.end))
	return calRange.diff("days")
}


/**
Query Database to get Virtual Stream Gaugee Data
**/
function getData(stationID, startDate, endDate, dataType, maximize) {
	//alert("Will chart data for:\n StationID: " + stationID + "\nStartDate: " + startDate + "\nEndDate: " + endDate + "\nDataType: " + dataType);
	//var splitStart = startDate.split('-');
	//var newStart = splitStart[1] + "/" + splitStart[2] + "/" + splitStart[0];
	//var splitEnd = endDate.split('-');
	//var newEnd = splitEnd[1] + "/" + splitEnd[2] + "/" + splitEnd[0];

	var result = null;
	//var scriptUrl = "https://servirglobal.net/mapresources/SendFeedback.aspx?";
	var scriptUrl = "http://"+window.location.hostname+"/getVSGData.php?id="+stationID+"&start="+startDate+"&end="+endDate;
	//alert(scriptUrl);
	$.ajax({
		url: scriptUrl,
		type: 'get',
		dataType: 'jsonp',
		contentType: "application/json",
		jsonpCallback: 'mycallback',
		data: { DataRequest: true, beginDate: startDate, endDate: endDate, stationName: stationID },
		async: false,
		success: function (data) {
			theReturnedData = JSON.parse(data);
			currentData = theReturnedData.streamflow;
			loadGraphCombinedOLD(maximize);

		},
		error: function (httpReq, status, exception) {
			// alert(httpReq + " " + status + " " + exception);
		}
	});
	return theReturnedData;

}
var theReturnedData;
function setLegend() {

};
/**
Convert Json data to CSV data
**/
function ConvertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','

			line += array[i][index];
		}

		str += line + '\r\n';
	}

	return str;
}


/**
Create CSV and Json download data
**/
function updateDownloadData() {
	var obj = currentData;
	var jsonstr = JSON.stringify(obj);
	var csvstr  = ConvertToCSV(jsonstr);
	var data = "text/json;charset=utf-8," + encodeURIComponent(jsonstr);
//alert(csvstr);
	var container = document.getElementById("lnkjsondownload").href = "data:" + data;
	var txtdata = "text/plain;charset=utf-8," + encodeURIComponent(csvstr);
	var container2 = document.getElementById("lnkcsvdownload").href = "data:" + txtdata;
}
/**
Change Layers, not used. 
**/
function toggleLayerManager() {
	if ($("#foldingdiv").height() != 0) {
		//$("#foldingdiv").height(0);
		$("#foldingdiv").animate({ "height": "0px" }, 400, 'linear');
		$("#expansionimg").css('float', 'left');
		//$("#expansiontxt").css('float', 'right');
		document.getElementById("expansionimg").src = 'images/expand.png';

	}
	else {
		$("#foldingdiv").height('auto');
		//$("#foldingdiv").animate({ "height": "auto" }, 400, 'linear');
		$("#expansionimg").css('float', 'right');
	  //  $("#expansiontxt").css('float', 'left');
		document.getElementById("expansionimg").src = 'images/detract.png';
		$("#expansiontxt").hide();
		$(".expansionrow").css('padding-right', '0px');
		//padding-right: 0px;
	}
}
