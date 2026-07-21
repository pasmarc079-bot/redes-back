import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/guards/AuthGuard';
import Login from '@/pages/Login';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import EventList from '@/pages/events/EventList';
import EventForm from '@/pages/events/EventForm';
import PostList from '@/pages/blog/PostList';
import PostEditor from '@/pages/blog/PostEditor';
import BadgeList from '@/pages/badges/BadgeList';
import BadgeForm from '@/pages/badges/BadgeForm';

function StubPage({ title }: { title: string }) {
  return (
    <div className="text-center py-16">
      <h2 className="font-heading text-2xl text-gray-600">{title}</h2>
      <p className="text-gray-400 mt-2">Módulo en desarrollo</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Events */}
        <Route path="events" element={<EventList />} />
        <Route path="events/new" element={<EventForm />} />
        <Route path="events/:id" element={<EventForm />} />

        {/* Blog */}
        <Route path="blog" element={<PostList />} />
        <Route path="blog/new" element={<PostEditor />} />
        <Route path="blog/:id" element={<PostEditor />} />

        {/* Badges */}
        <Route path="badges" element={<BadgeList />} />
        <Route path="badges/new" element={<BadgeForm />} />
        <Route path="badges/:id" element={<BadgeForm />} />

        {/* Stubs */}
        <Route path="members" element={<StubPage title="Gestión de Miembros" />} />
        <Route path="media" element={<StubPage title="Biblioteca de Media" />} />
        <Route path="settings" element={<StubPage title="Configuración" />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
