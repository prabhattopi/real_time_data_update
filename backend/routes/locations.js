import express from 'express';
import { body, validationResult } from 'express-validator';
import Location from '../models/Location.js';

const router = express.Router();

const validateLocation = [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('visibility').optional().isIn(['public', 'private'])
];

router.post('/', validateLocation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const location = await Location.create({
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.longitude),
          parseFloat(req.body.latitude)
        ]
      },
      userId: req.user.userId,
      visibility: req.body.visibility || 'public'
    });
    
    // Emit real-time update
    const io = req.app.locals.io;
    if (location.visibility === 'public') {
      io.emit('locationUpdate', location);
    } else {
      io.to(req.user.userId.toString()).emit('locationUpdate', location);
    }
    
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { bbox, userId } = req.query;
    const query = {};

    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(parseFloat);
      query.location = {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [[
              [minLon, minLat],
              [maxLon, minLat],
              [maxLon, maxLat],
              [minLon, maxLat],
              [minLon, minLat]
            ]]
          }
        }
      };
    }

    if (req.user) {
      query.$or = [
        { userId: req.user.userId },
        { visibility: 'public' }
      ];
    } else {
      query.visibility = 'public';
    }

    if (userId) query.userId = userId;

    const locations = await Location.find(query).limit(1000);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;