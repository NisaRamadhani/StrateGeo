// ======================
// API KEY
// ======================
const API_KEY = "PASTE_API_KEY_KAMU";

// ======================
// BASEMAP
// ======================
const basemapStreet = 'https://basemap.mapid.io/styles/street-2d-building/style.json?key=69a8edeffdb1d3dbc8b3022c';
const basemapDark = 'https://basemap.mapid.io/styles/dark/style.json?key=69a8edeffdb1d3dbc8b3022c';
const basemapSatellite = 'https://basemap.mapid.io/styles/satellite/style.json?key=69a8edeffdb1d3dbc8b3022c';

// ======================
// MAP INIT
// ======================
const map = new maplibregl.Map({
  container: 'map',
  style: basemapStreet,
  center: [106.8, -6.2],
  zoom: 11
});

let selectedPoint = null;

// ======================
// LOAD LAYERS
// ======================
function loadLayers() {

  map.addSource('admin', { type: 'geojson', data: 'data/administrasi.geojson' });
  map.addLayer({
    id: 'admin-layer',
    type: 'line',
    source: 'admin',
    paint: { 'line-color': '#3A7D44', 'line-width': 2 }
  });

  map.addSource('road', { type: 'geojson', data: 'data/jalan.geojson' });
  map.addLayer({
    id: 'road-layer',
    type: 'line',
    source: 'road',
    paint: { 'line-color': '#181D27', 'line-width': 1 }
  });

  map.addSource('demand', { type: 'geojson', data: 'data/demand.geojson' });
  map.addLayer({
    id: 'demand-layer',
    type: 'circle',
    source: 'demand',
    paint: { 'circle-radius': 6, 'circle-color': '#69B578' }
  });

  map.addSource('warehouse', { type: 'geojson', data: 'data/warehouse.geojson' });
  map.addLayer({
    id: 'warehouse-layer',
    type: 'circle',
    source: 'warehouse',
    paint: { 'circle-radius': 7, 'circle-color': '#D0DB97' }
  });

  setupToggle();
  setupPopup();
}

// ======================
// TOGGLE
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
// POPUP
// ======================
function setupPopup() {

  map.getCanvas().style.cursor = 'pointer';

  map.on('click', 'demand-layer', (e) => {
    const f = e.features[0];
    selectedPoint = f.geometry.coordinates;

    new maplibregl.Popup()
      .setLngLat(selectedPoint)
      .setHTML(`<b>Supermarket</b><br>${f.properties.name || '-'}`)
      .addTo(map);
  });

  map.on('click', 'warehouse-layer', (e) => {
    const f = e.features[0];
    selectedPoint = f.geometry.coordinates;

    new maplibregl.Popup()
      .setLngLat(selectedPoint)
      .setHTML(`<b>Warehouse</b><br>${f.properties.name || '-'}`)
      .addTo(map);
  });
}

// ======================
// BUFFER
// ======================
function runBuffer() {

  if (!selectedPoint) return alert("Klik titik dulu!");

  const radius = parseFloat(document.getElementById("bufferRadius").value);

  const buffer = turf.buffer(
    turf.point(selectedPoint),
    radius,
    { units: 'kilometers' }
  );

  if (map.getSource('buffer')) {
    map.getSource('buffer').setData(buffer);
  } else {
    map.addSource('buffer', { type: 'geojson', data: buffer });

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

function clearBuffer() {
  if (map.getLayer('buffer-layer')) map.removeLayer('buffer-layer');
  if (map.getSource('buffer')) map.removeSource('buffer');
}

// ======================
// ISOCHRONE
// ======================
function runIsochrone() {

  if (!selectedPoint) return alert("Klik titik dulu!");

  const minutes = parseInt(document.getElementById("isoTime").value);
  const mode = document.getElementById("isoMode").value;

  fetch(`https://api.openrouteservice.org/v2/isochrones/${mode}`, {
    method: "POST",
    headers: {
      "Authorization": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      locations: [selectedPoint],
      range: [minutes * 60]
    })
  })
  .then(res => res.json())
  .then(data => {

    if (map.getSource('isochrone')) {
      map.getSource('isochrone').setData(data);
    } else {
      map.addSource('isochrone', { type: 'geojson', data });

      map.addLayer({
        id: 'isochrone-layer',
        type: 'fill',
        source: 'isochrone',
        paint: {
          'fill-color': '#3A7D44',
          'fill-opacity': 0.4
        }
      });
    }

  })
  .catch(() => alert("Isochrone error"));
}

function clearIsochrone() {
  if (map.getLayer('isochrone-layer')) map.removeLayer('isochrone-layer');
  if (map.getSource('isochrone')) map.removeSource('isochrone');
}

// ======================
// COVERAGE (FIXED TOTAL)
// ======================
function runCoverage() {

  const radius = parseFloat(document.getElementById("coverageRadius").value);

  Promise.all([
    fetch('data/demand.geojson').then(res => res.json()),
    fetch('data/administrasi.geojson').then(res => res.json())
  ])
  .then(([demandData, adminData]) => {

    const buffers = demandData.features.map(f =>
      turf.buffer(f, radius, { units: 'kilometers' })
    );

    let merged = buffers[0];

    for (let i = 1; i < buffers.length; i++) {
      try {
        merged = turf.union(merged, buffers[i]);
      } catch {
        console.log("union skip");
      }
    }

    // coverage (hijau)
    if (map.getSource('coverage')) {
      map.getSource('coverage').setData(merged);
    } else {
      map.addSource('coverage', { type: 'geojson', data: merged });

      map.addLayer({
        id: 'coverage-layer',
        type: 'fill',
        source: 'coverage',
        paint: {
          'fill-color': '#00FF88',
          'fill-opacity': 0.3
        }
      });
    }

    // gap (merah)
    try {
      const uncovered = turf.difference(adminData, merged);

      if (uncovered) {
        if (map.getSource('gap')) {
          map.getSource('gap').setData(uncovered);
        } else {
          map.addSource('gap', { type: 'geojson', data: uncovered });

          map.addLayer({
            id: 'gap-layer',
            type: 'fill',
            source: 'gap',
            paint: {
              'fill-color': '#FF3B3B',
              'fill-opacity': 0.4
            }
          });
        }
      }
    } catch {
      console.log("gap gagal");
    }

  })
  .catch(() => alert("Coverage error"));
}

function clearCoverage() {
  if (map.getLayer('coverage-layer')) map.removeLayer('coverage-layer');
  if (map.getSource('coverage')) map.removeSource('coverage');

  if (map.getLayer('gap-layer')) map.removeLayer('gap-layer');
  if (map.getSource('gap')) map.removeSource('gap');
}

// ======================
// INIT
// ======================
map.on('load', loadLayers);

// ======================
// BASEMAP SWITCH
// ======================
document.getElementById("basemap").onchange = function () {

  const style =
    this.value === "street" ? basemapStreet :
    this.value === "dark" ? basemapDark :
    basemapSatellite;

  map.setStyle(style);
  map.once('style.load', loadLayers);
};
