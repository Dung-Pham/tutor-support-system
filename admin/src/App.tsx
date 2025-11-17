/**
 * File: App.tsx
 * Purpose: Admin dashboard main app component
 */

import { BrowserRouter } from "react-router-dom";
import { AdminRoutes } from "./routes";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <AdminRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
