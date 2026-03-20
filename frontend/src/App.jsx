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

  // In classroom (teacher)
  if (currentUser.role === 'teacher' && activePage === 'classroom' && activeClassId) {
    return <ClassroomTeacher classId={activeClassId} />
  }

  // In classroom (student)
  if (currentUser.role === 'student' && activePage === 'classroom' && activeClassId) {
    return <ClassroomStudent classId={activeClassId} />
  }

  // Normal layout with sidebar
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {currentUser.role === 'admin'   && <AdminRouter   page={activePage} />}
        {currentUser.role === 'teacher' && <TeacherRouter page={activePage} />}
        {currentUser.role === 'student' && <StudentRouter page={activePage} />}
      </div>
    </div>
  )
}

function AdminRouter({ page }) {
  switch (page) {
    case 'users':    return <UsersPage />
    case 'courses':  return <CoursesPage />
    case 'reports':  return <ReportsPage />
    default:         return <AdminDashboard />
  }
}

function TeacherRouter({ page }) {
  switch (page) {
    default: return <TeacherDashboard />
  }
}

function StudentRouter({ page }) {
  switch (page) {
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
