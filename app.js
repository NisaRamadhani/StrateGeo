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
// LOAD LAYERS FUNCTION
// ======================
function loadLayers() {

  // ======================
  // ADMINISTRASI
  // ======================
  if (!map.getSource('admin')) {
    map.addSource('admin', {
      type: 'geojson',
      data: 'data/administrasi.geojson'
    });

    map.addLayer({
      id: 'admin-layer',
      type: 'line',
      source: 'admin',
      paint: {
        'line-color': '#3A7D44',
        'line-width': 2
      }
    });
  }

  // ======================
  // JALAN
  // ======================
  if (!map.getSource('road')) {
    map.addSource('road', {
      type: 'geojson',
      data: 'data/jalan.geojson'
    });

    map.addLayer({
      id: 'road-layer',
      type: 'line',
      source: 'road',
      paint: {
        'line-color': '#181D27',
        'line-width': 1
      }
    });
  }

  // ======================
  // SUPERMARKET (DEMAND)
  // ======================
  if (!map.getSource('demand')) {
    map.addSource('demand', {
      type: 'geojson',
      data: 'data/demand.geojson'
    });

    map.addLayer({
      id: 'demand-layer',
      type: 'circle',
      source: 'demand',
      paint: {
        'circle-radius': 6,
        'circle-color': '#69B578',
        'circle-opacity': 0.9
      }
    });
  }

  // ======================
  // WAREHOUSE
  // ======================
  if (!map.getSource('warehouse')) {
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
        'circle-color': '#D0DB97',
        'circle-stroke-color': '#181D27',
        'circle-stroke-width': 1
      }
    });
  }

  // ======================
  // APPLY VISIBILITY
  // ======================
  applyInitialVisibility();
}

// ======================
// SYNC CHECKBOX VISIBILITY
// ======================
function applyInitialVisibility() {
  const layers = [
    { id: 'admin-layer', checkbox: 'admin' },
    { id: 'road-layer', checkbox: 'road' },
    { id: 'demand-layer', checkbox: 'demand' },
    { id: 'warehouse-layer', checkbox: 'warehouse' }
  ];

  layers.forEach(l => {
    if (!map.getLayer(l.id)) return;

    const el = document.getElementById(l.checkbox);
    const visibility = el.checked ? 'visible' : 'none';

    map.setLayoutProperty(l.id, 'visibility', visibility);
  });
}

// ======================
// TOGGLE FUNCTION
// ======================
function setupLayerToggle() {

  function toggle(layerId, checkboxId) {
    const el = document.getElementById(checkboxId);

    el.addEventListener('change', function () {
      if (!map.getLayer(layerId)) return;

      const visibility = this.checked ? 'visible' : 'none';
      map.setLayoutProperty(layerId, 'visibility', visibility);
    });
  }

  toggle('admin-layer', 'admin');
  toggle('road-layer', 'road');
  toggle('demand-layer', 'demand');
  toggle('warehouse-layer', 'warehouse');
}

// ======================
// LOAD AWAL
// ======================
map.on('load', () => {
  loadLayers();
  setupLayerToggle();
});

// ======================
// BASEMAP SWITCH
// ======================
document.getElementById("basemap").onchange = function () {

  let style;

  if (this.value === "street") {
    style = basemapStreet;
  } else if (this.value === "dark") {
    style = basemapDark;
  } else {
    style = basemapSatellite;
  }

  map.setStyle(style);

  // reload layers setelah style berubah
  map.once('styledata', () => {
    loadLayers();
  });
};
