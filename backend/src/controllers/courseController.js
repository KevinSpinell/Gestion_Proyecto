const Course = require('../models/Course');

// @desc  Get all courses (with teacher populated)
// @route GET /api/courses
exports.getAll = async (req, res) => {
  try {
    const courses = await Course.find().populate('teacherId', 'name email avatar');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single course
// @route GET /api/courses/:id
exports.getById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacherId', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get courses by teacher
// @route GET /api/courses/teacher/:teacherId
exports.getByTeacher = async (req, res) => {
  try {
    const courses = await Course.find({ teacherId: req.params.teacherId });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get courses by student
// @route GET /api/courses/student/:studentId
exports.getByStudent = async (req, res) => {
  try {
    const courses = await Course.find({ studentIds: req.params.studentId });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create course
// @route POST /api/courses
exports.create = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Update course
// @route PUT /api/courses/:id
exports.update = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete course
// @route DELETE /api/courses/:id
exports.remove = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Enroll student
// @route POST /api/courses/:id/enroll
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { studentIds: studentId } },
      { new: true }
    );
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Unenroll student
// @route POST /api/courses/:id/unenroll
exports.unenrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $pull: { studentIds: studentId } },
      { new: true }
    );
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
