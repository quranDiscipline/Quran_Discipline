import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';

// Placeholder routes for Phase 1
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Quran Discipline Academy
              </h1>
              <p className="text-gray-600">Phase 1 — Project Setup Complete</p>
            </div>
          </div>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
