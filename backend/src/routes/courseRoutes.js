const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Filters (must be before /:id to avoid conflicts)
router.get('/teacher/:teacherId', courseController.getByTeacher);
router.get('/student/:studentId', courseController.getByStudent);

// Enroll / Unenroll
router.post('/:id/enroll',   courseController.enrollStudent);
router.post('/:id/unenroll', courseController.unenrollStudent);

// CRUD
router.get('/',     courseController.getAll);
router.get('/:id',  courseController.getById);
router.post('/',    courseController.create);
router.put('/:id',  courseController.update);
router.delete('/:id', courseController.remove);

module.exports = router;
