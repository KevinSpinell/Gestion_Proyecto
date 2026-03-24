// ─────────────────────────────────────────────────────────────────────────────
//  backend/src/services/dbService.js
//  Real service layer using Mongoose models.
//  Credentials are loaded from process.env (see .env.example).
// ─────────────────────────────────────────────────────────────────────────────

const User   = require('../models/User');
const Course = require('../models/Course');
const Class  = require('../models/Class');
const bcrypt = require('bcryptjs');

// ── USER SERVICE ──────────────────────────────────────────────────────────────
const UserService = {
  getAll:  async ()         => User.find().select('-password'),
  getById: async (id)       => User.findById(id).select('-password'),
  create:  async (data)     => {
    const hashed = await bcrypt.hash(data.password, 10);
    return User.create({ ...data, password: hashed });
  },
  update:  async (id, data) => User.findByIdAndUpdate(id, data, { new: true }).select('-password'),
  delete:  async (id)       => User.findByIdAndDelete(id),
  login:   async (username, password) => {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) return null;
    return user;
  },
};

// ── COURSE SERVICE ────────────────────────────────────────────────────────────
const CourseService = {
  getAll:          async ()                    => Course.find().populate('teacherId', 'name email'),
  getById:         async (id)                  => Course.findById(id),
  getByTeacher:    async (teacherId)            => Course.find({ teacherId }),
  getByStudent:    async (studentId)            => Course.find({ studentIds: studentId }),
  create:          async (data)                => Course.create(data),
  update:          async (id, data)            => Course.findByIdAndUpdate(id, data, { new: true }),
  delete:          async (id)                  => Course.findByIdAndDelete(id),
  enrollStudent:   async (courseId, studentId) =>
    Course.findByIdAndUpdate(courseId, { $addToSet: { studentIds: studentId } }, { new: true }),
  unenrollStudent: async (courseId, studentId) =>
    Course.findByIdAndUpdate(courseId, { $pull: { studentIds: studentId } }, { new: true }),
};

// ── CLASS SERVICE ─────────────────────────────────────────────────────────────
const ClassService = {
  getAll:           async ()             => Class.find().populate('courseId'),
  getById:          async (id)           => Class.findById(id),
  getByCourse:      async (courseId)     => Class.find({ courseId }),
  getActive:        async ()             => Class.find({ isActive: true }).populate('courseId'),
  create:           async (data)         => Class.create(data),
  activate:         async (id)           => Class.findByIdAndUpdate(id, { isActive: true }, { new: true }),
  deactivate:       async (id)           =>
    Class.findByIdAndUpdate(id, { isActive: false, participantIds: [] }, { new: true }),
  addTranscription: async (id, segment)  =>
    Class.findByIdAndUpdate(id, { $push: { transcription: segment } }, { new: true }),
  saveTranscription: async (id, text)   =>
    Class.findByIdAndUpdate(id, { savedTranscription: text }, { new: true }),
  setSummary:       async (id, summary)  =>
    Class.findByIdAndUpdate(id, { summary }, { new: true }),
  addQuestion:      async (id, question) =>
    Class.findByIdAndUpdate(id, { $push: { questions: question } }, { new: true }),
  answerQuestion:   async (classId, questionId) =>
    Class.findByIdAndUpdate(
      classId,
      { $set: { 'questions.$[q].status': 'answered', 'questions.$[q].answeredAt': new Date() } },
      { arrayFilters: [{ 'q._id': questionId }], new: true }
    ),
  joinClass:  async (classId, userId) =>
    Class.findByIdAndUpdate(
      classId,
      { $addToSet: { participantIds: userId, attendance: { userId, joinedAt: new Date() } } },
      { new: true }
    ),
  leaveClass: async (classId, userId) =>
    Class.findByIdAndUpdate(classId, { $pull: { participantIds: userId } }, { new: true }),
};

module.exports = { UserService, CourseService, ClassService };
