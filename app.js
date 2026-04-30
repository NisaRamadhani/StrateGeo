// ======================
// BASEMAP
// ======================
const basemapStreet = 'https://basemap.mapid.io/styles/street-2d-building/style.json?key=69a8edeffdb1d3dbc8b3022c';
const basemapDark = 'https://basemap.mapid.io/styles/dark/style.json?key=69a8edeffdb1d3dbc8b3022c';
const basemapSatellite = 'https://basemap.mapid.io/styles/satellite/style.json?key=69a8edeffdb1d3dbc8b3022c';

// ======================
// INIT MAP
// ======================
const map = new maplibregl.Map({
  container: 'map',
  style: basemapStreet,
  center: [106.8, -6.2],
  zoom: 11
});

// ======================
// BASEMAP SWITCH
// ======================
document.getElementById("basemap").onchange = function () {

  if (this.value === "street") {
    map.setStyle(basemapStreet);
  } else if (this.value === "dark") {
    map.setStyle(basemapDark);
  } else {
    map.setStyle(basemapSatellite);
  }

};

map.on('load', () => {

  // ======================
  // ADMINISTRASI
  // ======================
  map.addSource('admin', {
    type: 'geojson',
    data: 'data/administrasi.geojson'
  });

  map.addLayer({
    id: 'admin-layer',
    type: 'line',
    source: 'admin',
    paint: {
      'line-color': '#0f0ff1',
      'line-width': 2
    }
  });

  // ======================
  // JALAN
  // ======================
  map.addSource('road', {
    type: 'geojson',
    data: 'data/jalan.geojson'
  });

  map.addLayer({
    id: 'road-layer',
    type: 'line',
    source: 'road',
    paint: {
      'line-color': '#3e3e3f',
      'line-width': 1
    }
  });

  // ======================
  // DEMAND (SUPERMARKET)
  // ======================
  map.addSource('demand', {
    type: 'geojson',
    data: 'data/demand.geojson'
  });

  map.addLayer({
    id: 'demand-layer',
    type: 'circle',
    source: 'demand',
    paint: {
      'circle-radius': 5,
      'circle-color': '#0b4909',
      'circle-opacity': 0.8
    }
  });

  // ======================
  // WAREHOUSE
  // ======================
  map.addSource('warehouse', {
    type: 'geojson',
    data: 'data/warehouse.geojson'
  });

  map.addLayer({
    id: 'warehouse-layer',
    type: 'circle',
    source: 'warehouse',
    paint: {
      'circle-radius': 7,
      'circle-color': '#ff0000'
    }
  });

});