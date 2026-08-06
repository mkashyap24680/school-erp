import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center page-bg text-center p-6">
      <h1 className="text-6xl font-extrabold text-navy-900">404</h1>
      <p className="text-navy-900/50 mt-2 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
    </div>
  );
}
