/**
 * File: components/DocumentPermissionsModal.tsx
 * Mục đích: Modal quản lý quyền truy cập tài liệu
 * Vai trò:
 *   - Hiển thị danh sách học sinh đã có quyền
 *   - Thêm quyền cho học sinh mới
 *   - Thay đổi loại quyền (VIEW/DOWNLOAD)
 *   - Thu hồi quyền
 * Lưu ý:
 *   - Load danh sách học sinh của tutor
 *   - Load permissions hiện tại của document
 *   - Real-time updates khi thay đổi permissions
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  UserPlus,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import {
  fetchDocumentPermissions,
  fetchTutorStudents,
  grantPermissionAsync,
  revokePermissionAsync,
  setShowPermissionsModal,
} from '../store/slices/documentsSlice';

interface DocumentPermissionsModalProps {
  documentId: string;
}

export const DocumentPermissionsModal: React.FC<DocumentPermissionsModalProps> = ({
  documentId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    permissions,
    students,
    showPermissionsModal,
  } = useSelector((state: RootState) => state.documents);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedPermissionType, setSelectedPermissionType] = useState<'VIEW' | 'DOWNLOAD'>('VIEW');
  const [grantingPermission, setGrantingPermission] = useState<string | null>(null);
  const [revokingPermission, setRevokingPermission] = useState<string | null>(null);

  useEffect(() => {
    if (showPermissionsModal && documentId) {
      dispatch(fetchDocumentPermissions(documentId));
      dispatch(fetchTutorStudents());
    }
  }, [dispatch, showPermissionsModal, documentId]);

  const handleClose = () => {
    dispatch(setShowPermissionsModal({ show: false }));
  };

  const handleGrantPermission = async () => {
    if (!selectedStudentId) return;

    setGrantingPermission(selectedStudentId);
    try {
      await dispatch(
        grantPermissionAsync({
          documentId,
          studentId: selectedStudentId,
          permissionType: selectedPermissionType,
        })
      ).unwrap();

      setSelectedStudentId('');
      setSelectedPermissionType('VIEW');
    } catch (error) {
      console.error('Failed to grant permission:', error);
    } finally {
      setGrantingPermission(null);
    }
  };

  const handleRevokePermission = async (studentId: string) => {
    setRevokingPermission(studentId);
    try {
      await dispatch(
        revokePermissionAsync({
          documentId,
          studentId,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to revoke permission:', error);
    } finally {
      setRevokingPermission(null);
    }
  };

  const handleUpdatePermission = async (studentId: string, newPermissionType: 'VIEW' | 'DOWNLOAD') => {
    const existingPermission = permissions.find(p => p.user_id === studentId);
    if (!existingPermission || existingPermission.permission_type === newPermissionType) return;

    setGrantingPermission(studentId);
    try {
      await dispatch(
        grantPermissionAsync({
          documentId,
          studentId,
          permissionType: newPermissionType,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to update permission:', error);
    } finally {
      setGrantingPermission(null);
    }
  };

  // Get available students (not already have permission)
  const availableStudents = students.filter(
    student => !permissions.some(permission => permission.user_id === student.user_id)
  );

  // Get current permissions with student info
  const permissionsWithStudentInfo = permissions.map(permission => {
    const student = students.find(s => s.user_id === permission.user_id);
    return {
      ...permission,
      student_name: student?.name || 'Unknown',
      student_email: student?.email || 'Unknown',
      class_name: student?.class_name || 'Unknown',
    };
  });

  return (
    <Modal
      isOpen={showPermissionsModal}
      onClose={handleClose}
      title="Quản Lý Quyền Truy Cập"
      size="xl"
    >
      <div className="space-y-6">
        {/* Grant New Permission */}
        <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Cấp Quyền Cho Học Sinh Mới
        </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn học sinh</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn học sinh...</option>
                  {availableStudents.map((student) => (
                    <option key={student.user_id} value={student.user_id}>
                      {student.name} - {student.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại quyền</label>
                <select
                  value={selectedPermissionType}
                  onChange={(e) => setSelectedPermissionType(e.target.value as 'VIEW' | 'DOWNLOAD')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VIEW">Chỉ xem</option>
                  <option value="DOWNLOAD">Tải xuống</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGrantPermission}
                  disabled={!selectedStudentId || grantingPermission === selectedStudentId}
                  className="w-full"
                >
                  {grantingPermission === selectedStudentId ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Cấp quyền
                </Button>
              </div>
            </div>

            {availableStudents.length === 0 && (
              <p className="text-sm text-gray-600">
                Tất cả học sinh đã có quyền truy cập tài liệu này
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Current Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Học Sinh Đã Có Quyền Truy Cập ({permissions.length})
            </h3>

            {permissionsWithStudentInfo.length === 0 ? (
              <p className="text-sm text-gray-600">
                Chưa có học sinh nào được cấp quyền truy cập
              </p>
            ) : (
              <div className="space-y-3">
                {permissionsWithStudentInfo.map((permission) => (
                  <div
                    key={permission.permission_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{permission.student_name}</p>
                          <p className="text-sm text-gray-600">{permission.student_email}</p>
                          <p className="text-xs text-gray-500">{permission.class_name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={permission.permission_type}
                        onChange={(e) => handleUpdatePermission(permission.user_id, e.target.value as 'VIEW' | 'DOWNLOAD')}
                        disabled={grantingPermission === permission.user_id}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="VIEW">Chỉ xem</option>
                        <option value="DOWNLOAD">Tải xuống</option>
                      </select>

                      <Badge variant={permission.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {permission.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã thu hồi'}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokePermission(permission.user_id)}
                        disabled={revokingPermission === permission.user_id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {revokingPermission === permission.user_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
};