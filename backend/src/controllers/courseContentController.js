const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// @desc  Add content to a course
// @route POST /api/courses/:id/contents
exports.addContent = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, type, description } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      if (req.file) fs.unlinkSync(req.file.path); // remove uploaded file if course not found
      return res.status(404).json({ message: 'Course not found' });
    }
    // RF-08 Alt. flow 5.2: course not active (Only active courses allow new content by teacher)
    if (course.estado !== 'Activo') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'No se puede agregar contenido a un curso que no esté Activo' });
    }

    // Build content object
    const newContent = {
      title,
      type,
      description: description || '',
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      originalName: req.file ? req.file.originalname : null
    };

    course.contents.push(newContent);
    await course.save();

    res.status(201).json(course.contents[course.contents.length - 1]);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete content from a course
// @route DELETE /api/courses/:id/contents/:contentId
exports.deleteContent = async (req, res) => {
  try {
    const courseId = req.params.id;
    const contentId = req.params.contentId;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const content = course.contents.id(contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    // Remove file if it exists
    if (content.fileUrl) {
      const filePath = path.join(__dirname, '../../', content.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    course.contents.pull({ _id: contentId });
    await course.save();

    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
