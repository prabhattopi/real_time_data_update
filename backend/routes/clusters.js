import express from 'express';
import { clustersDbscan, featureCollection, point } from '@turf/turf';
import Location from '../models/Location.js';

const router = express.Router();

// Input validation middleware
const validateClusterParams = (req, res, next) => {
  const { zoom, bounds } = req.query;
  
  if (!zoom || isNaN(zoom) || zoom < 0 || zoom > 20) {
    return res.status(400).json({ error: 'Invalid zoom parameter' });
  }

  if (!bounds || !bounds.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
    return res.status(400).json({ error: 'Invalid bounds format. Use minLon,minLat,maxLon,maxLat' });
  }

  next();
};

router.get('/', validateClusterParams, async (req, res) => {
  try {
    const { zoom, bounds } = req.query;
    const [minLon, minLat, maxLon, maxLat] = bounds.split(',').map(Number);

    // Fetch locations within bounding box
    const locations = await Location.find({
      longitude: { $gte: minLon, $lte: maxLon },
      latitude: { $gte: minLat, $lte: maxLat }
    }).lean();

    // Convert to GeoJSON features
    const features = locations.map(location => 
       point([location.longitude, location.latitude], {
        id: location._id,
        userId: location.userId,
        timestamp: location.timestamp
      })
    );

    // Calculate clusters using DBSCAN algorithm
    const clustered = clustersDbscan(featureCollection(features), {
      maxDistance: 100000 / (2 ** zoom), // Dynamic distance based on zoom
      minPoints: 2,
      units: 'meters'
    });

    // Format response
    const response = clustered.features.map(feature => ({
      type: feature.properties.cluster ? 'cluster' : 'point',
      coordinates: feature.geometry.coordinates,
      properties: feature.properties
    }));

    res.json(response);
  } catch (error) {
    console.error('Cluster error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;