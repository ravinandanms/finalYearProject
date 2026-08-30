import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, UserPlus, Calendar, Activity, LogOut, CheckCircle, XCircle, ShieldOff, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: Activity },
    { name: 'Doctors', path: '/admin/doctors', icon: UserPlus },
    { name: 'Patients', path: '/admin/patients', icon: Users },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </header>
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/doctors" element={<DoctorsManager />} />
            <Route path="/patients" element={<PatientsManager />} />
            <Route path="/appointments" element={<AppointmentsViewer />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('teleseva_token');
        const res = await fetch('/api/admin/statistics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Loading statistics...</div>;

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, color: 'text-green-600' },
    { label: 'Total Doctors', value: stats.totalDoctors, color: 'text-blue-600' },
    { label: 'Pending Doctors', value: stats.pendingDoctors, color: 'text-amber-600' },
    { label: 'Total Appointments', value: stats.totalAppointments, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map(stat => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-2">{stat.label}</h3>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function DoctorsManager() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const token = localStorage.getItem('teleseva_token');
    const res = await fetch('/api/admin/doctors', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setDoctors(await res.json());
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to change this doctor's status to ${status}?`)) return;
    
    const token = localStorage.getItem('teleseva_token');
    await fetch(`/api/admin/doctors/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    fetchDoctors();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4 font-medium text-slate-600">Name</th>
            <th className="p-4 font-medium text-slate-600">Specialization</th>
            <th className="p-4 font-medium text-slate-600">Status</th>
            <th className="p-4 font-medium text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {doctors.map(doc => (
            <tr key={doc._id} className="hover:bg-slate-50">
              <td className="p-4">
                <p className="font-medium text-slate-800">{doc.name}</p>
                <p className="text-sm text-slate-500">{doc.email}</p>
              </td>
              <td className="p-4 text-slate-600">{doc.specialization || 'General'}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  doc.status === 'active' ? 'bg-green-100 text-green-700' :
                  doc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {doc.status}
                </span>
              </td>
              <td className="p-4 text-right space-x-2">
                {doc.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(doc._id, 'active')} className="text-green-600 hover:text-green-800" title="Approve"><CheckCircle size={20}/></button>
                    <button onClick={() => updateStatus(doc._id, 'rejected')} className="text-red-600 hover:text-red-800" title="Reject"><XCircle size={20}/></button>
                  </>
                )}
                {doc.status === 'active' && (
                  <button onClick={() => updateStatus(doc._id, 'suspended')} className="text-amber-600 hover:text-amber-800" title="Suspend"><ShieldAlert size={20}/></button>
                )}
                {doc.status === 'suspended' && (
                  <button onClick={() => updateStatus(doc._id, 'active')} className="text-blue-600 hover:text-blue-800" title="Reactivate"><CheckCircle size={20}/></button>
                )}
              </td>
            </tr>
          ))}
          {doctors.length === 0 && (
            <tr><td colSpan="4" className="p-4 text-center text-slate-500">No doctors found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PatientsManager() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const token = localStorage.getItem('teleseva_token');
    const res = await fetch('/api/admin/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setPatients(await res.json());
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to change this patient's status to ${status}?`)) return;
    
    const token = localStorage.getItem('teleseva_token');
    await fetch(`/api/admin/patients/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    fetchPatients();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4 font-medium text-slate-600">Name</th>
            <th className="p-4 font-medium text-slate-600">Phone</th>
            <th className="p-4 font-medium text-slate-600">Status</th>
            <th className="p-4 font-medium text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {patients.map(p => (
            <tr key={p._id} className="hover:bg-slate-50">
              <td className="p-4">
                <p className="font-medium text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">{p.email}</p>
              </td>
              <td className="p-4 text-slate-600">{p.phone || 'N/A'}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {p.status}
                </span>
              </td>
              <td className="p-4 text-right space-x-2">
                {p.status === 'active' ? (
                  <button onClick={() => updateStatus(p._id, 'suspended')} className="text-amber-600 hover:text-amber-800" title="Suspend"><ShieldOff size={20}/></button>
                ) : (
                  <button onClick={() => updateStatus(p._id, 'active')} className="text-green-600 hover:text-green-800" title="Reactivate"><CheckCircle size={20}/></button>
                )}
              </td>
            </tr>
          ))}
          {patients.length === 0 && (
            <tr><td colSpan="4" className="p-4 text-center text-slate-500">No patients found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentsViewer() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('teleseva_token');
    const res = await fetch('/api/admin/appointments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setAppointments(await res.json());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4 font-medium text-slate-600">Patient</th>
            <th className="p-4 font-medium text-slate-600">Doctor</th>
            <th className="p-4 font-medium text-slate-600">Date/Time</th>
            <th className="p-4 font-medium text-slate-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map(appt => (
            <tr key={appt._id} className="hover:bg-slate-50">
              <td className="p-4">
                <p className="font-medium text-slate-800">{appt.patientId?.name}</p>
              </td>
              <td className="p-4">
                <p className="font-medium text-slate-800">{appt.doctorId?.name}</p>
                <p className="text-sm text-slate-500">{appt.doctorId?.specialization}</p>
              </td>
              <td className="p-4 text-slate-600">
                {new Date(appt.date).toLocaleDateString()} at {appt.time}
              </td>
              <td className="p-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {appt.status}
                </span>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr><td colSpan="4" className="p-4 text-center text-slate-500">No appointments found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
