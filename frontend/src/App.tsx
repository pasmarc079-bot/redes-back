import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Community from './pages/Community';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const AdminApp = lazy(() => import('./admin/App'));

function App() {
  return (
    <Routes>
      {/* Admin Routes - fuera del Layout público */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Cargando panel...</div>}>
            <AdminApp />
          </Suspense>
        }
      />

      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="nosotros" element={<About />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="eventos" element={<Events />} />
        <Route path="eventos/:slug" element={<EventDetail />} />
        <Route path="comunidad" element={<Community />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
