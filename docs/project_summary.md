# 📘 Resumen Técnico del Proyecto — ClassAI / Gestion_Proyecto

> Documento de referencia para cualquier IA o desarrollador que necesite entender y modificar el proyecto.

---

## 1. Visión General

**ClassAI** es una plataforma de gestión académica web que permite a administradores, profesores y estudiantes gestionar cursos, clases en vivo, asistencia e interacciones mediante IA (Gemini). El proyecto vive en un monorepo:

```
Gestion_Proyecto/
├── backend/         # API REST — Node.js + Express + Mongoose
├── frontend/        # SPA — React 19 + Vite
├── package.json     # Scripts raíz (concurrently)
└── docker-compose.yml
```

---

## 2. Infraestructura y Stack

| Capa | Tecnología |
|---|---|
| Runtime backend | Node.js ≥ 18 |
| Framework HTTP | Express 4 |
| ODM | Mongoose 8 |
| Base de datos | MongoDB Atlas (cluster `ClusterProyect0`) |
| Hashing passwords | bcryptjs |
| Frontend framework | React 19 |
| Bundler | Vite 5 |
| Estilos | Vanilla CSS (`index.css`) — sin Tailwind |
| Estado global | React Context (`AppContext`) + `localStorage` |
| IA / sumario | Google Gemini API (opcional) |

### Variables de entorno backend (`backend/.env`)
```
MONGO_URI=mongodb+srv://...@clusterproyect0.du8akfa.mongodb.net/gestion_proyecto?retryWrites=true&w=majority
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=  # opcional
```

### Scripts de arranque (raíz)
```bash
npm run dev           # inicia frontend + backend en paralelo
npm run dev:backend   # nodemon src/server.js  (puerto 3001)
npm run dev:frontend  # vite                   (puerto 5173)
```

---

## 3. Backend — Estructura

```
backend/src/
├── server.js          # Punto de entrada: carga .env, conecta DB, arranca Express
├── app.js             # Configura CORS, JSON, monta rutas
├── config/db.js       # connectDB() con mongoose.connect()
├── models/
│   ├── User.js        # Administradores
│   ├── Teacher.js     # Profesores (colección separada)
│   ├── Student.js     # Estudiantes (colección separada)
│   ├── Course.js      # Cursos
│   └── Class.js       # Sesiones/clases
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── teacherRoutes.js
│   ├── studentRoutes.js
│   ├── courseRoutes.js
│   └── classRoutes.js
├── controllers/
│   ├── courseController.js
│   ├── classController.js
│   └── userController.js
└── services/          # (Gemini u otros servicios auxiliares)
```

---

## 4. Modelos de Datos (MongoDB / Mongoose)

### `User` — Administradores
```js
{ name, email(unique), username(unique), password(hash), role: ['admin','teacher','student'], avatar, createdAt }
```

### `Teacher` — Profesores
```js
{ documento(unique,8-11dig), nombre(max32), apellido(max32), telefono(unique,10dig),
  correo(unique,email), clave(hash,min8), areaDominio(enum), anioInicio(4dig),
  estado(bool,default:true), createdAt }
```
`DOMAIN_AREAS`: `['Informática','Matemáticas','Ciencias','Historia','Idiomas','Arte','Ingeniería','Física','Química','Literatura','Educación Física','General']`

### `Student` — Estudiantes
```js
{ documento(unique,8-11dig), nombre(max32), apellido(max32), anioNacimiento(4dig),
  telefono(unique,10dig), correo(unique,email), clave(hash,min8),
  institucion, estado(bool,default:true), aprobado(bool,default:false), createdAt }
```
> ⚠️ `aprobado:false` bloquea el login con código `PENDING_APPROVAL`. Un admin debe aprobar al estudiante.

### `Course` — Cursos
```js
{ name, description, category, teacherId(ref:User), studentIds([ref:User]),
  status: ['active','inactive'], createdAt }
```

### `Class` — Sesiones de clase
```js
{ courseId(ref:Course), title, date, startTime, sessionType:['Live','In-Person','Workshop'],
  isActive(bool), transcription([{text,timestamp,isFinal}]), savedTranscription,
  summary, participantIds([ref:User]), questions([QuestionSchema]),
  attendance([{userId,joinedAt}]), createdAt }
```

---

## 5. API REST (`/api`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login multi-rol (busca en User → Teacher → Student) |
| GET | `/api/users` | Listar usuarios |
| GET/POST | `/api/teachers` | Listar / Crear profesor |
| GET/POST | `/api/students` | Listar / Crear estudiante (RF-01) |
| GET | `/api/students/pending` | Estudiantes pendientes de aprobación |
| PATCH | `/api/students/:id/approve` | Aprobar estudiante |
| GET | `/api/courses` | Listar todos los cursos |
| GET | `/api/courses/teacher/:teacherId` | Cursos de un profesor |
| GET | `/api/courses/student/:studentId` | Cursos de un estudiante |
| POST | `/api/courses/:id/enroll` | **Inscribir estudiante** `{ studentId }` |
| POST | `/api/courses/:id/unenroll` | **Desinscribir estudiante** |
| POST/GET | `/api/courses` | CRUD de cursos |
| GET/POST | `/api/classes` | Listar / Crear clase |
| PATCH | `/api/classes/:id/activate` | Activar clase en vivo |
| GET | `/api/health` | Health check |

---

## 6. Frontend — Estructura

```
frontend/src/
├── main.jsx          # Renderiza <App> en #root
├── App.jsx           # Router condicional por rol: AdminRouter/TeacherRouter/StudentRouter
├── App.css / index.css
├── context/
│   └── AppContext.jsx  # Estado global + helpers + llamadas API
├── components/
│   └── Sidebar.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersPage.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── EnrollmentRequestsPage.jsx
│   ├── teacher/
│   │   ├── TeacherDashboard.jsx
│   │   └── ClassroomTeacher.jsx
│   └── student/
│       ├── StudentDashboard.jsx
│       └── ClassroomStudent.jsx
└── services/
    └── geminiService.js
```

### AppContext — Patrón
- Todo el estado vive en `AppContext.jsx` (`useState`).
- Se persiste en `localStorage` (clave `classai_*`).
- **Funciones que ya llaman a la API real**: `login`, `createTeacher`.
- **Funciones que aún son stubs locales** (marcadas `// DB STUB`): `createCourse`, `enrollStudent`, `unenrollStudent`, `createClass`, etc.
- El contexto expone: `users, courses, classes, currentUser, activePage, activeClassId` + todas las funciones.

### Renderizado por rol (`App.jsx`)
- `admin` → `AdminRouter` (pages: dashboard, users, courses, reports, enrollment)
- `teacher` → `TeacherRouter` (page: dashboard)
- `student` → `StudentRouter` (page: dashboard — solo `StudentDashboard`)
- Classroom especial para teacher/student cuando `activePage === 'classroom'`

---

## 7. Flujo de Autenticación

1. `LoginPage` llama a `login(email, password)` del contexto.
2. `login()` hace `POST /api/auth/login`.
3. El backend busca en `User` → `Teacher` → `Student` en ese orden.
4. Devuelve `{ id, name, email, username, role, avatar, ... }`.
5. Se guarda en `localStorage` como `classai_session`.
6. Casos especiales: `403 PENDING_APPROVAL` (estudiante no aprobado), `403` cuenta inactiva.

---

## 8. Casos de Uso / RFs implementados

| RF | Nombre | Estado |
|---|---|---|
| RF-01 | Registro de estudiante | ✅ Backend completo (API + aprobación admin) |
| RF-02 | Registro de profesor | ✅ Backend + frontend (AdminDashboard → UsersPage) |
| RF-08 | Inscripción en curso | 🟡 Backend completo — frontend aún usa stub local |

---

## 9. Reglas de negocio importantes

1. **Estudiante no puede loguear** hasta ser `aprobado:true` por el admin.
2. **Profesor/Teacher tiene estado** (`estado`); si es `false`, no puede loguear.
3. **Inscripción en curso**: usa `$addToSet` en MongoDB → no se puede repetir la misma inscripción.
4. **Passwords**: siempre hasheados con `bcryptjs` antes de guardar.
5. **Documento, teléfono, correo** son únicos en cada colección.
6. **CORS**: sólo acepta peticiones de `http://localhost:5173` (configurable en `.env`).

---

## 10. Notas para extender el proyecto

- Para añadir una nueva ruta: crear archivo en `routes/`, controlador en `controllers/`, importar en `app.js`.
- Para añadir una nueva página: crear en `pages/<rol>/`, importar en `App.jsx` y añadir case en el router.
- Para migrar un stub a API real: reemplazar la función en `AppContext.jsx` con un `fetch` al backend.
- El seed data en `AppContext` es solo para desarrollo local sin DB; cuando el backend está activo, los datos vienen de MongoDB.
- CSS: todas las clases están en `index.css`. Usar clases existentes (`btn`, `card`, `form-input`, `badge-*`, etc.) antes de crear nuevas.
