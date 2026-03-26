import { AppProvider, useApp } from './context/AppContext'
import './index.css'

// Pages – Auth
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Pages – Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import UsersPage from './pages/admin/UsersPage'
import CoursesPage from './pages/admin/CoursesPage'
import ReportsPage from './pages/admin/ReportsPage'
import EnrollmentRequestsPage from './pages/admin/EnrollmentRequestsPage'

// Pages – Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ClassroomTeacher from './pages/teacher/ClassroomTeacher'

// Pages – Student
import StudentDashboard from './pages/student/StudentDashboard'
import ClassroomStudent from './pages/student/ClassroomStudent'

// Shared layout
import Sidebar from './components/Sidebar'

function InnerApp() {
  const { currentUser, activePage, activeClassId } = useApp()

  // Not authenticated → auth pages
  if (!currentUser) {
    if (activePage === 'register') return <RegisterPage />
    return <LoginPage />
  }

  // Normal layout with sidebar
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {currentUser.role === 'admin'   && <AdminRouter   page={activePage} classId={activeClassId} />}
        {currentUser.role === 'teacher' && <TeacherRouter page={activePage} classId={activeClassId} />}
        {currentUser.role === 'student' && <StudentRouter page={activePage} classId={activeClassId} />}
      </div>
    </div>
  )
}

function AdminRouter({ page, classId }) {
  switch (page) {
    case 'users':      return <UsersPage />
    case 'courses':    return <CoursesPage />
    case 'reports':    return <ReportsPage />
    case 'enrollment': return <EnrollmentRequestsPage />
    case 'classroom':  return classId ? <ClassroomTeacher classId={classId} /> : <AdminDashboard />
    default:           return <AdminDashboard />
  }
}

function TeacherRouter({ page, classId }) {
  switch (page) {
    case 'classroom': return classId ? <ClassroomTeacher classId={classId} /> : <TeacherDashboard />
    default: return <TeacherDashboard />
  }
}

function StudentRouter({ page, classId }) {
  switch (page) {
    case 'classroom': return classId ? <ClassroomStudent classId={classId} /> : <StudentDashboard />
    default: return <StudentDashboard />
  }
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  )
}
