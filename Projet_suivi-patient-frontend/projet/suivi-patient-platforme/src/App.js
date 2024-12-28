import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Aceuill from './components/Aceuill';
import Login from './components/Login'
import AddPatient from './components/AddPatient';
import MapPage from './components/MapPage';

const ProtectedRoute = ({ element, ...rest }) => {
  const userRole = localStorage.getItem('userRole');
  const isLoggedIn = !!userRole;

  return isLoggedIn ? element : <Navigate to="/" replace />;
};

function App() {

  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/map/:patientId" element={<ProtectedRoute element={<MapPage />} />} />
          <Route path="/Aceuill" element={<ProtectedRoute element={<Aceuill />} />} />
          <Route path="/patients" element={<ProtectedRoute element={<AddPatient />} />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
    
  );
}

export default App;
