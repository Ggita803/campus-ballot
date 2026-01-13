const express = require('express');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const {
  getMaterials,
  uploadMaterials,
  downloadMaterial,
  deleteMaterial
} = require('../controllers/candidateMaterialController');

const router = express.Router();


router.get('/materials', protect, getMaterials);
router.post('/materials', protect, upload.array('files', 10), uploadMaterials);
router.get('/materials/:id/download', protect, downloadMaterial);
router.delete('/materials/:id', protect, deleteMaterial);

module.exports = router;
