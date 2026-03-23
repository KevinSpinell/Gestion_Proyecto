// ─────────────────────────────────────────────────────────────────────────────
//  dbService.js
//  MongoDB connection stubs. When ready, install mongoose:
//    npm install mongoose
//  Then fill in these functions calling the real models.
// ─────────────────────────────────────────────────────────────────────────────

const { MongoClient, ServerApiVersion } = require('mongodb');
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
// ─────────────────────────────────────────────
//  SCHEMAS (Mongoose model definitions to add)
// ─────────────────────────────────────────────

/*
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },  // hash with bcrypt
  role:      { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  avatar:    { type: String },
  createdAt: { type: Date, default: Date.now },
})

const CourseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  teacherId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentIds:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt:   { type: Date, default: Date.now },
})

const TranscriptionSegmentSchema = new mongoose.Schema({
  text:      String,
  timestamp: String,
  isFinal:   Boolean,
})

const QuestionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:    String,
  userAvatar:  String,
  text:        String,
  isQuickReply:Boolean,
  status:      { type: String, enum: ['pending', 'answered'], default: 'pending' },
  upvotes:     { type: Number, default: 0 },
  sentAt:      { type: Date, default: Date.now },
  answeredAt:  Date,
})

const AttendanceSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now },
})

const ClassSchema = new mongoose.Schema({
  courseId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:             { type: String, required: true },
  date:              String,
  startTime:         String,
  sessionType:       { type: String, enum: ['Live', 'In-Person', 'Workshop'], default: 'Live' },
  isActive:          { type: Boolean, default: false },
  transcription:     [TranscriptionSegmentSchema],
  savedTranscription:String,
  summary:           String,
  participantIds:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questions:         [QuestionSchema],
  attendance:        [AttendanceSchema],
  createdAt:         { type: Date, default: Date.now },
})

export const User   = mongoose.model('User',   UserSchema)
export const Course = mongoose.model('Course', CourseSchema)
export const Class  = mongoose.model('Class',  ClassSchema)
*/

// ─────────────────────────────────────────────
//  SERVICE STUBS
//  Each function shows the future MongoDB call.
//  For now, all logic lives in AppContext.jsx.
// ─────────────────────────────────────────────

export const UserService = {
  /** @returns {Promise<User[]>} */
  getAll: async () => { /* return await User.find() */ },
  /** @returns {Promise<User>} */
  getById: async (id) => { /* return await User.findById(id) */ },
  /** @returns {Promise<User>} */
  create: async (data) => { /* return await User.create(data) */ },
  /** @returns {Promise<User>} */
  update: async (id, data) => { /* return await User.findByIdAndUpdate(id, data, { new: true }) */ },
  /** @returns {Promise<void>} */
  delete: async (id) => { /* await User.findByIdAndDelete(id) */ },
  /** @returns {Promise<User|null>} */
  login: async (username, password) => {
    /* const user = await User.findOne({ username })
       if (!user || !bcrypt.compareSync(password, user.password)) return null
       return user */
  },
}

export const CourseService = {
  getAll: async () => { /* return await Course.find().populate('teacherId', 'name email') */ },
  getById: async (id) => { /* return await Course.findById(id) */ },
  getByTeacher: async (teacherId) => { /* return await Course.find({ teacherId }) */ },
  getByStudent: async (studentId) => { /* return await Course.find({ studentIds: studentId }) */ },
  create: async (data) => { /* return await Course.create(data) */ },
  update: async (id, data) => { /* return await Course.findByIdAndUpdate(id, data, { new: true }) */ },
  delete: async (id) => { /* await Course.findByIdAndDelete(id) */ },
  enrollStudent: async (courseId, studentId) => {
    /* return await Course.findByIdAndUpdate(courseId, { $addToSet: { studentIds: studentId } }, { new: true }) */
  },
  unenrollStudent: async (courseId, studentId) => {
    /* return await Course.findByIdAndUpdate(courseId, { $pull: { studentIds: studentId } }, { new: true }) */
  },
}

export const ClassService = {
  getAll: async () => { /* return await Class.find().populate('courseId') */ },
  getById: async (id) => { /* return await Class.findById(id) */ },
  getByCourse: async (courseId) => { /* return await Class.find({ courseId }) */ },
  getActive: async () => { /* return await Class.find({ isActive: true }).populate('courseId') */ },
  create: async (data) => { /* return await Class.create(data) */ },
  activate: async (id) => { /* return await Class.findByIdAndUpdate(id, { isActive: true }, { new: true }) */ },
  deactivate: async (id) => { /* return await Class.findByIdAndUpdate(id, { isActive: false, participantIds: [] }, { new: true }) */ },
  addTranscription: async (id, segment) => {
    /* return await Class.findByIdAndUpdate(id, { $push: { transcription: segment } }, { new: true }) */
  },
  saveTranscription: async (id, text) => {
    /* return await Class.findByIdAndUpdate(id, { savedTranscription: text }, { new: true }) */
  },
  setSummary: async (id, summary) => {
    /* return await Class.findByIdAndUpdate(id, { summary }, { new: true }) */
  },
  addQuestion: async (id, question) => {
    /* return await Class.findByIdAndUpdate(id, { $push: { questions: question } }, { new: true }) */
  },
  answerQuestion: async (classId, questionId) => {
    /* return await Class.findByIdAndUpdate(
         classId,
         { $set: { 'questions.$[q].status': 'answered', 'questions.$[q].answeredAt': new Date() } },
         { arrayFilters: [{ 'q._id': questionId }], new: true }
       ) */
  },
  joinClass: async (classId, userId) => {
    /* return await Class.findByIdAndUpdate(classId,
         { $addToSet: { participantIds: userId, attendance: { userId, joinedAt: new Date() } } },
         { new: true }
       ) */
  },
  leaveClass: async (classId, userId) => {
    /* return await Class.findByIdAndUpdate(classId, { $pull: { participantIds: userId } }, { new: true }) */
  },
}
