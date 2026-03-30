import { Router } from 'express';
import {
  getVenueSections,
  createVenueSection,
  updateVenueSection,
  deleteVenueSection,
} from '../controllers/venue-section.controller';
import { authMiddleware } from '../middlewares/auth';

export const venueSectionRoutes = Router();

// GET all venue sections
venueSectionRoutes.get('/', authMiddleware, getVenueSections);

// POST create venue section
venueSectionRoutes.post('/', authMiddleware, createVenueSection);

// PUT update venue section
venueSectionRoutes.put('/:id', authMiddleware, updateVenueSection);

// DELETE venue section
venueSectionRoutes.delete('/:id', authMiddleware, deleteVenueSection);
