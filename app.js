const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemap.mapid.io/styles/street-2d-building/style.json?key=69a8edeffdb1d3dbc8b3022c',
  center: [106.8, -6.2],
  zoom: 11
});

map.on('load', () => {

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
      'circle-color': '#ff0000',
      'circle-opacity': 0.7
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
      'circle-color': '#0000ff'
    }
  });

  // ======================
  // BUFFER (3 KM)
  // ======================
  fetch('data/warehouse.geojson')
    .then(res => res.json())
    .then(warehouseData => {

      const buffers = warehouseData.features.map(f => {
        return turf.buffer(f, 3, { units: 'kilometers' });
      });

      const bufferGeoJSON = {
        type: "FeatureCollection",
        features: buffers
      };

      map.addSource('buffer', {
        type: 'geojson',
        data: bufferGeoJSON
      });

      map.addLayer({
        id: 'buffer-layer',
        type: 'fill',
        source: 'buffer',
        paint: {
          'fill-color': '#0000ff',
          'fill-opacity': 0.2
        }
      });

      // ======================
      // ANALYSIS: INSIDE vs OUTSIDE
      // ======================
      fetch('data/demand.geojson')
        .then(res => res.json())
        .then(demandData => {

          let insidePoints = [];
          let outsidePoints = [];

          demandData.features.forEach(point => {

            let isInside = false;

            buffers.forEach(buffer => {
              if (turf.booleanPointInPolygon(point, buffer)) {
                isInside = true;
              }
            });

            if (isInside) {
              insidePoints.push(point);
            } else {
              outsidePoints.push(point);
            }

          });

          console.log("Inside (tercover):", insidePoints.length);
          console.log("Outside (tidak tercover):", outsidePoints.length);

          // ======================
          // OUTSIDE LAYER (PRIORITY AREA)
          // ======================
          map.addSource('outside', {
            type: 'geojson',
            data: {
              type: "FeatureCollection",
              features: outsidePoints
            }
          });

          map.addLayer({
            id: 'outside-layer',
            type: 'circle',
            source: 'outside',
            paint: {
              'circle-radius': 6,
              'circle-color': '#8B0000' // merah gelap
            }
          });

        });

    });

});