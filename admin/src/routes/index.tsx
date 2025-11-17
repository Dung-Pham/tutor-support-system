/**
 * File: routes/index.tsx
 * Purpose: Admin routing configuration
 */

import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import UserManagement from "@/pages/users/UserManagement";
import TutorManagement from "@/pages/tutors/TutorManagement";
import ClassManagement from "@/pages/classes/ClassManagement";

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="tutors" element={<TutorManagement />} />
        <Route path="classes" element={<ClassManagement />} />
      </Route>
    </Routes>
  );
};
