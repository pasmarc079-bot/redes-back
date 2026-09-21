import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/admin/guards/AuthGuard';
import AdminLayout from '@/admin/components/layout/AdminLayout';
import ToastContainer from '@/admin/components/ui/Toast';
import ConfirmModal from '@/admin/components/ui/ConfirmModal';

const Login = lazy(() => import('@/admin/pages/Login'));
const Dashboard = lazy(() => import('@/admin/pages/Dashboard'));
const EventList = lazy(() => import('@/admin/pages/events/EventList'));
const EventForm = lazy(() => import('@/admin/pages/events/EventForm'));
const PostList = lazy(() => import('@/admin/pages/blog/PostList'));
const PostEditor = lazy(() => import('@/admin/pages/blog/PostEditor'));
const MediaLibrary = lazy(() => import('@/admin/pages/media/MediaLibrary'));
const Settings = lazy(() => import('@/admin/pages/settings/Settings'));
const SystemInfo = lazy(() => import('@/admin/pages/SystemInfo'));

export default function AdminApp() {
  return (
    <>
      <ToastContainer />
      <ConfirmModal />
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando panel...</div>}>
        <Routes>
      <Route path="login" element={<Login />} />

      <Route
        path="dashboard"
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

        {/* Media */}
        <Route path="media" element={<MediaLibrary />} />

        <Route path="settings" element={<Settings />} />

        {/* System Info */}
        <Route path="system" element={<SystemInfo />} />
      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
