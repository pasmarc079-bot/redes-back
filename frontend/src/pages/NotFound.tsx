import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="font-display text-8xl md:text-9xl text-gold tracking-wider mb-4">404</h1>
        <h2 className="font-heading text-2xl text-dark mb-4">Página no encontrada</h2>
        <p className="text-dark-light mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/" className="btn btn-primary">
          <FiArrowLeft /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
