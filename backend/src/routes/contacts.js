import express from 'express';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';
import { 
  validateContact, 
  validateContactUpdate, 
  validateUUID, 
  validatePagination 
} from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Contact routes
router.get('/', validatePagination, getContacts);
router.get('/stats', getContactStats);
router.get('/:id', validateUUID, getContact);
router.post('/', validateContact, createContact);
router.put('/:id', validateUUID, validateContactUpdate, updateContact);
router.delete('/:id', validateUUID, deleteContact);

export default router;
