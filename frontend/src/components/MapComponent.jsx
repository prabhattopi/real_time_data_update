import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
import { debounce } from 'lodash-es';

const MapComponent = ({ locations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const supercluster = useRef(new Supercluster({ radius: 60, maxZoom: 16 }));
  const [serverClusters, setServerClusters] = useState([]);
  const markers = useRef([]);

  // Update markers
  const updateMarkers = useCallback((clusters) => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    clusters.forEach(cluster => {
      const el = document.createElement('div');
      el.className = `cluster-marker ${cluster.properties?.cluster ? 'cluster' : 'single'}`;
      
      if (cluster.properties?.cluster) {
        el.innerHTML = `<div>${cluster.properties.point_count}</div>`;
        el.style.backgroundColor = '#e74c3c';
      } else {
        el.innerHTML = '📍';
        el.style.fontSize = '24px';
        el.addEventListener('click', () => {
          new maplibregl.Popup()
            .setLngLat(cluster.geometry.coordinates)
            .setHTML(`
              <h3>Location</h3>
              <p>${new Date(cluster.properties.timestamp).toLocaleString()}</p>
            `)
            .addTo(map.current);
        });
      }

      const marker = new maplibregl.Marker(el)
        .setLngLat(cluster.geometry.coordinates)
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: import.meta.env.VITE_MAP_STYLE,
      center: [0, 0],
      zoom: 2
    });

    map.current.on('load', () => {
      map.current.resize();
    });

    map.current.on('moveend', debounce(() => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      const zoom = map.current.getZoom();
      
      supercluster.current.load(locations.map(loc => ({
        type: 'Feature',
        geometry: { 
          type: 'Point', 
          coordinates: loc.location.coordinates 
        },
        properties: loc
      })));

      const clusters = supercluster.current.getClusters([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ], Math.floor(zoom));

      updateMarkers([...clusters, ...serverClusters]);
    }, 500));

    return () => {
      map.current?.remove();
      markers.current.forEach(marker => marker.remove());
    };
  }, []);

  return <div ref={mapContainer} className="map-container" />;
};

export default MapComponent;