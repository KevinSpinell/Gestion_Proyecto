import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────
//  RF-02 DOMAIN AREAS (keep in sync with backend Teacher model)
// ─────────────────────────────────────────────
export const DOMAIN_AREAS = [
  'Informática', 'Matemáticas', 'Ciencias', 'Historia',
  'Idiomas', 'Arte', 'Ingeniería', 'Física',
  'Química', 'Literatura', 'Educación Física', 'General',
]

// ─────────────────────────────────────────────
//  SEED DATA — replace calls with MongoDB later
// ─────────────────────────────────────────────
const SEED_USERS = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@classai.edu', username: 'admin', password: 'admin123', role: 'admin', avatar: 'AS', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Prof. Carlos Méndez', email: 'cmendez@classai.edu', username: 'prof1', password: 'prof123', role: 'teacher', avatar: 'CM', createdAt: '2024-01-05' },
  { id: 'u3', name: 'Prof. Laura Ríos', email: 'lrios@classai.edu', username: 'prof2', password: 'prof123', role: 'teacher', avatar: 'LR', createdAt: '2024-01-06' },
  { id: 'u4', name: 'Kevin Spinell', email: 'kevin@est.edu', username: 'est1', password: 'est123', role: 'student', avatar: 'KS', createdAt: '2024-02-01' },
  { id: 'u5', name: 'Ana Torres', email: 'ana@est.edu', username: 'est2', password: 'est123', role: 'student', avatar: 'AT', createdAt: '2024-02-02' },
  { id: 'u6', name: 'Jorge Pérez', email: 'jorge@est.edu', username: 'est3', password: 'est123', role: 'student', avatar: 'JP', createdAt: '2024-02-03' },
]

const SEED_COURSES = [
  {
    id: 'c1',
    name: 'Gestión de Bases de Datos',
    description: 'Fundamentos de bases de datos relacionales y NoSQL. Diseño, optimización y gestión.',
    category: 'Informática',
    teacherId: 'u2',
    studentIds: ['u4', 'u5'],
    createdAt: '2024-02-10',
    status: 'active',
  },
  {
    id: 'c2',
    name: 'Algoritmos Avanzados',
    description: 'Estructuras de datos, complejidad algorítmica y técnicas de optimización.',
    category: 'Informática',
    teacherId: 'u3',
    studentIds: ['u4', 'u6'],
    createdAt: '2024-02-12',
    status: 'active',
  },
  {
    id: 'c3',
    name: 'Cálculo Diferencial',
    description: 'Límites, derivadas e integrales con aplicaciones prácticas en ingeniería.',
    category: 'Matemáticas',
    teacherId: 'u2',
    studentIds: ['u5', 'u6'],
    createdAt: '2024-02-15',
    status: 'active',
  },
]

const SEED_CLASSES = [
  {
    id: 'cl1',
    courseId: 'c1',
    title: 'Introducción a MongoDB',
    date: '2026-03-16',
    startTime: '18:00',
    sessionType: 'Live',
    isActive: false,
    transcription: [],
    participantIds: [],
    questions: [],
    chatMessages: [],
    attendance: [],
    savedTranscription: '...y así concluye el tema de índices en MongoDB. Recuerden que los índices mejoran la velocidad de búsqueda pero incrementan el espacio en disco.',
    summary: null,
    createdAt: '2024-03-01',
  },
  {
    id: 'cl2',
    courseId: 'c2',
    title: 'Algoritmo de Dijkstra',
    date: '2026-03-16',
    startTime: '20:00',
    sessionType: 'Live',
    isActive: false,
    transcription: [],
    participantIds: [],
    questions: [],
    chatMessages: [],
    attendance: [],
    savedTranscription: null,
    summary: null,
    createdAt: '2024-03-02',
  },
]

// ─────────────────────────────────────────────
//  CONTEXT
// ─────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('classai_users')) || SEED_USERS } catch { return SEED_USERS }
  })
  const [courses, setCourses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('classai_courses')) || SEED_COURSES } catch { return SEED_COURSES }
  })
  const [classes, setClasses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('classai_classes')) || SEED_CLASSES } catch { return SEED_CLASSES }
  })
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('classai_session')) || null } catch { return null }
  })
  const [activePage, setActivePage] = useState('dashboard')
  const [activeClassId, setActiveClassId] = useState(null)

  // Persist changes
  useEffect(() => { localStorage.setItem('classai_users', JSON.stringify(users)) }, [users])
  useEffect(() => { localStorage.setItem('classai_courses', JSON.stringify(courses)) }, [courses])
  useEffect(() => { localStorage.setItem('classai_classes', JSON.stringify(classes)) }, [classes])

  // Cross-tab real-time sync
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'classai_classes') {
        try { setClasses(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // ── AUTH ───────────────────────────────────────────────────────────────────
  // POST /api/auth/login — verifica email + contraseña contra MongoDB
  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()

      // 403 = cuenta bloqueada o pendiente de aprobación
      if (res.status === 403) return { success: false, error: json.message }

      if (res.ok) {
        const user = { ...json, id: json.id || json._id }
        setCurrentUser(user)
        localStorage.setItem('classai_session', JSON.stringify(user))
        return { success: true, user }
      }

      // 400 / 401 — credenciales incorrectas
      return { success: false, error: json.message || 'Credenciales incorrectas' }

    } catch {
      // ── Error de red: backend no disponible ───────────────────────────────
      return { success: false, error: 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.' }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('classai_session')
    setActivePage('dashboard')
    setActiveClassId(null)
  }

  // DB STUB: replace with → POST /api/auth/register
  const registerStudent = (data) => {
    if (users.find(u => u.username === data.username)) return { success: false, error: 'El usuario ya existe' }
    if (users.find(u => u.email === data.email)) return { success: false, error: 'El correo ya está registrado' }
    const newUser = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      username: data.username,
      password: data.password,
      role: 'student',
      avatar: data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    setUsers(prev => [...prev, newUser])
    return { success: true, user: newUser }
  }

  // ── USERS ──────────────────────────────────
  // POST /api/teachers — persists to MongoDB and syncs local state
  const createTeacher = async (data) => {
    // ── [4.1] Required fields (instant FE feedback, no round-trip) ───────────
    const required = ['documento', 'nombre', 'apellido', 'telefono', 'correo', 'clave', 'areaDominio', 'anioInicio']
    if (required.some(f => !data[f] || data[f].toString().trim() === ''))
      return { success: false, error: 'Todos los campos son obligatorios' }

    // ── Field format validations ──────────────────────────────────────────────
    if (!/^\d{8,11}$/.test(data.documento))
      return { success: false, error: 'El documento debe tener entre 8 y 11 dígitos numéricos' }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(data.nombre) || data.nombre.length > 32)
      return { success: false, error: 'El nombre solo puede contener letras (máx. 32 caracteres)' }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(data.apellido) || data.apellido.length > 32)
      return { success: false, error: 'El apellido solo puede contener letras (máx. 32 caracteres)' }
    if (!/^\d{10}$/.test(data.telefono))
      return { success: false, error: 'El teléfono debe tener exactamente 10 dígitos numéricos' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo))
      return { success: false, error: 'El formato del correo es inválido' }
    if (data.clave.length < 8)
      return { success: false, error: 'La clave debe tener al menos 8 caracteres' }
    if (!/^\d{4}$/.test(data.anioInicio))
      return { success: false, error: 'El año de inicio debe tener exactamente 4 dígitos numéricos' }

    // ── Call backend API ──────────────────────────────────────────────────────
    try {
      const res = await fetch('http://localhost:3001/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento:   data.documento,
          nombre:      data.nombre.trim(),
          apellido:    data.apellido.trim(),
          telefono:    data.telefono,
          correo:      data.correo.toLowerCase(),
          clave:       data.clave,
          areaDominio: data.areaDominio,
          anioInicio:  data.anioInicio,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        // [4.2] Backend uniqueness or validation errors
        return { success: false, error: json.message || 'Error al crear el profesor' }
      }

      // ── Sync saved teacher into local state so table refreshes ──────────────
      const fullName = `${json.nombre} ${json.apellido}`
      const localUser = {
        id:          json._id,
        name:        fullName,
        email:       json.correo,
        username:    json.documento,
        role:        'teacher',
        avatar:      fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        createdAt:   new Date(json.createdAt).toISOString().split('T')[0],
        // RF-02 extended fields
        documento:   json.documento,
        nombre:      json.nombre,
        apellido:    json.apellido,
        telefono:    json.telefono,
        correo:      json.correo,
        areaDominio: json.areaDominio,
        anioInicio:  json.anioInicio,
        estado:      json.estado,
      }
      setUsers(prev => [...prev, localUser])
      return { success: true, user: localUser }

    } catch (err) {
      // Network / CORS error
      return { success: false, error: 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en el puerto 3001.' }
    }
  }

  // DB STUB: replace with → PUT /api/users/:id
  const updateUser = (id, data) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
  }

  // DB STUB: replace with → DELETE /api/users/:id
  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setCourses(prev => prev.map(c => ({
      ...c,
      teacherId: c.teacherId === id ? null : c.teacherId,
      studentIds: c.studentIds.filter(sid => sid !== id),
    })))
  }

  // ── COURSES ────────────────────────────────
  // DB STUB: replace with → POST /api/courses
  const createCourse = (data) => {
    const newCourse = {
      id: `c${Date.now()}`,
      name: data.name,
      description: data.description,
      category: data.category || 'General',
      teacherId: data.teacherId || null,
      studentIds: [],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setCourses(prev => [...prev, newCourse])
    return { success: true, course: newCourse }
  }

  // DB STUB: replace with → PUT /api/courses/:id
  const updateCourse = (id, data) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  // DB STUB: replace with → DELETE /api/courses/:id
  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id))
    setClasses(prev => prev.filter(cl => cl.courseId !== id))
  }

  // DB STUB: replace with → POST /api/courses/:id/enroll
  const enrollStudent = (courseId, studentId) => {
    setCourses(prev => prev.map(c =>
      c.id === courseId && !c.studentIds.includes(studentId)
        ? { ...c, studentIds: [...c.studentIds, studentId] }
        : c
    ))
  }

  const unenrollStudent = (courseId, studentId) => {
    setCourses(prev => prev.map(c =>
      c.id === courseId ? { ...c, studentIds: c.studentIds.filter(id => id !== studentId) } : c
    ))
  }

  // ── CLASSES ────────────────────────────────
  // DB STUB: replace with → POST /api/classes
  const createClass = (data) => {
    const newClass = {
      id: `cl${Date.now()}`,
      courseId: data.courseId,
      title: data.title,
      date: data.date || new Date().toISOString().split('T')[0],
      startTime: data.startTime || '00:00',
      sessionType: data.sessionType || 'Live',
      isActive: false,
      transcription: [],
      participantIds: [],
      questions: [],
      chatMessages: [],
      attendance: [],
      savedTranscription: null,
      summary: null,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setClasses(prev => [...prev, newClass])
    return { success: true, class: newClass }
  }

  // DB STUB: replace with → PUT /api/classes/:id/activate
  const activateClass = (classId) => {
    setClasses(prev => prev.map(cl =>
      cl.id === classId ? { ...cl, isActive: true } : cl
    ))
  }

  const deactivateClass = (classId) => {
    setClasses(prev => prev.map(cl =>
      cl.id === classId ? { ...cl, isActive: false, participantIds: [] } : cl
    ))
  }

  // DB STUB: replace with → POST /api/classes/:id/join
  const joinClass = (classId, userId) => {
    setClasses(prev => prev.map(cl => {
      if (cl.id !== classId) return cl
      const alreadyIn = cl.participantIds.includes(userId)
      const alreadyAttended = cl.attendance.some(a => a.userId === userId)
      return {
        ...cl,
        participantIds: alreadyIn ? cl.participantIds : [...cl.participantIds, userId],
        attendance: alreadyAttended ? cl.attendance : [
          ...cl.attendance,
          { userId, joinedAt: new Date().toISOString() }
        ],
      }
    }))
  }

  const leaveClass = (classId, userId) => {
    setClasses(prev => prev.map(cl =>
      cl.id === classId
        ? { ...cl, participantIds: cl.participantIds.filter(id => id !== userId) }
        : cl
    ))
  }

  // DB STUB: replace with → POST /api/classes/:id/transcription
  const appendTranscription = useCallback((classId, segment) => {
    setClasses(prev => {
      const updated = prev.map(cl =>
        cl.id === classId
          ? { ...cl, transcription: [...cl.transcription, { ...segment, id: Date.now() }] }
          : cl
      )
      localStorage.setItem('classai_classes', JSON.stringify(updated))
      return updated
    })
  }, [])

  const pauseTranscription = useCallback((classId) => {
    // State managed locally in teacher component; this is intentionally a no-op here
  }, [])

  const clearTranscription = useCallback((classId) => {
    setClasses(prev => {
      const updated = prev.map(cl =>
        cl.id === classId ? { ...cl, transcription: [] } : cl
      )
      localStorage.setItem('classai_classes', JSON.stringify(updated))
      return updated
    })
  }, [])

  const saveTranscription = useCallback((classId) => {
    setClasses(prev => {
      const updated = prev.map(cl => {
        if (cl.id !== classId) return cl
        const text = cl.transcription.map(s => s.text).join(' ')
        return { ...cl, savedTranscription: text }
      })
      localStorage.setItem('classai_classes', JSON.stringify(updated))
      return updated
    })
  }, [])

  const setSummary = (classId, summary) => {
    setClasses(prev => prev.map(cl =>
      cl.id === classId ? { ...cl, summary } : cl
    ))
  }

  // DB STUB: replace with → POST /api/classes/:id/questions
  const sendQuestion = (classId, userId, text, isQuickReply = false) => {
    const user = users.find(u => u.id === userId)
    const question = {
      id: `q${Date.now()}`,
      userId,
      userName: user?.name || 'Estudiante',
      userAvatar: user?.avatar || 'ES',
      text,
      isQuickReply,
      status: 'pending',
      sentAt: new Date().toISOString(),
      upvotes: 0,
    }
    setClasses(prev => {
      const updated = prev.map(cl =>
        cl.id === classId ? { ...cl, questions: [...cl.questions, question] } : cl
      )
      localStorage.setItem('classai_classes', JSON.stringify(updated))
      return updated
    })
  }

  const answerQuestion = (classId, questionId) => {
    setClasses(prev => prev.map(cl =>
      cl.id === classId
        ? { ...cl, questions: cl.questions.map(q => q.id === questionId ? { ...q, status: 'answered', answeredAt: new Date().toISOString() } : q) }
        : cl
    ))
  }

  // ── HELPERS ────────────────────────────────
  const getUserById = (id) => users.find(u => u.id === id)
  const getCourseById = (id) => courses.find(c => c.id === id)
  const getClassById = (id) => classes.find(cl => cl.id === id)
  const getClassesForCourse = (courseId) => classes.filter(cl => cl.courseId === courseId)
  const getCoursesForTeacher = (teacherId) => courses.filter(c => c.teacherId === teacherId)
  const getCoursesForStudent = (studentId) => courses.filter(c => c.studentIds.includes(studentId))
  const getActiveClasses = () => classes.filter(cl => cl.isActive)

  const value = {
    // State
    users, courses, classes, currentUser, activePage, activeClassId,
    // Navigation
    setActivePage, setActiveClassId,
    // Auth
    login, logout, registerStudent,
    // Users
    createTeacher, updateUser, deleteUser,
    // Courses
    createCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent,
    // Classes
    createClass, activateClass, deactivateClass, joinClass, leaveClass,
    appendTranscription, clearTranscription, saveTranscription, setSummary,
    sendQuestion, answerQuestion,
    // Helpers
    getUserById, getCourseById, getClassById, getClassesForCourse,
    getCoursesForTeacher, getCoursesForStudent, getActiveClasses,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
