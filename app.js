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

let selectedPoint = null;

// ======================
// LOAD ALL LAYERS
// ======================
function loadLayers() {

  // ADMIN
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

  // ROAD
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

  // SUPERMARKET
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
      'circle-color': '#69B578'
    }
  });

  // WAREHOUSE
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
      'circle-color': '#D0DB97'
    }
  });

  setupToggle();
  setupPopup();
}

// ======================
// TOGGLE LAYER
// ======================
function setupToggle() {

  const toggle = (layer, id) => {
    document.getElementById(id).onchange = e => {
      if (map.getLayer(layer)) {
        map.setLayoutProperty(layer, 'visibility', e.target.checked ? 'visible' : 'none');
      }
    };
  };

  toggle('admin-layer', 'admin');
  toggle('road-layer', 'road');
  toggle('demand-layer', 'demand');
  toggle('warehouse-layer', 'warehouse');
}

// ======================
// POPUP + SELECT POINT
// ======================
function setupPopup() {

  map.on('click', 'demand-layer', (e) => {
    const f = e.features[0];
    selectedPoint = f.geometry.coordinates;

    new maplibregl.Popup()
      .setLngLat(selectedPoint)
      .setHTML(`
        <b>Supermarket</b><br>
        ${f.properties.name || '-'}<br>
        <button onclick="runBuffer()">Buffer</button>
      `)
      .addTo(map);
  });

  map.on('click', 'warehouse-layer', (e) => {
    const f = e.features[0];
    selectedPoint = f.geometry.coordinates;

    new maplibregl.Popup()
      .setLngLat(selectedPoint)
      .setHTML(`
        <b>Warehouse</b><br>
        ${f.properties.name || '-'}<br>
        <button onclick="runBuffer()">Buffer</button>
      `)
      .addTo(map);
  });
}

// ======================
// BUFFER
// ======================
function runBuffer() {

  if (!selectedPoint) {
    alert("Klik titik dulu!");
    return;
  }

  const radius = parseFloat(document.getElementById("bufferRadius").value);

  const buffer = turf.buffer(
    turf.point(selectedPoint),
    radius,
    { units: 'kilometers' }
  );

  if (map.getSource('buffer')) {
    map.getSource('buffer').setData(buffer);
  } else {
    map.addSource('buffer', {
      type: 'geojson',
      data: buffer
    });

    map.addLayer({
      id: 'buffer-layer',
      type: 'fill',
      source: 'buffer',
      paint: {
        'fill-color': '#69B578',
        'fill-opacity': 0.3
      }
    });
  }
}

// ======================
// CLEAR BUFFER
// ======================
function clearBuffer() {
  if (map.getLayer('buffer-layer')) map.removeLayer('buffer-layer');
  if (map.getSource('buffer')) map.removeSource('buffer');
}

// ======================
// LOAD FIRST
// ======================
map.on('load', loadLayers);

// ======================
// BASEMAP SWITCH (IMPORTANT FIX)
// ======================
document.getElementById("basemap").onchange = function () {

  const style =
    this.value === "street" ? basemapStreet :
    this.value === "dark" ? basemapDark :
    basemapSatellite;

  map.setStyle(style);

  map.once('style.load', () => {
    loadLayers(); // WAJIB reload layer
  });
};
