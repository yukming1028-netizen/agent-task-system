import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import TaskDetail from './pages/TaskDetail';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              user?.role === 'manager' ? (
                <ManagerDashboard />
              ) : (
                <AgentDashboard />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/tasks/:id"
          element={isAuthenticated ? <TaskDetail /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
