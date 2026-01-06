import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNotifications } from '../hooks/useNotifications';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import NotificationItem from '@/components/Notifications/NotificationItem';
dayjs.extend(utc);

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role || 'tutor';
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchAll,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  useEffect(() => {
    console.log('🎯 Component mounted - Fetching all notifications');
    fetchAll();
  }, [fetchAll]);

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  useEffect(() => {
    console.log('📊 Notifications updated:', notifications.length);
    console.log('🔍 Filter:', filter);
    console.log('📋 Filtered:', filteredNotifications.length);
  }, [notifications, filter, filteredNotifications]);
  // const handleNotificationClick = (notification: any) => {
  //   console.log('📬 NotificationsPage - Click notification:', {
  //     type: notification.type,
  //     metadata: notification.metadata,
  //   });

  //   try {
  //     let metadata = notification.metadata;

  //     // ✅ Parse metadata nếu là string
  //     if (typeof metadata === 'string') {
  //       metadata = JSON.parse(metadata);
  //     }

  //     console.log('🔍 Metadata sau parse:', metadata);

  //     // ✅ Mark as read
  //     markAsRead(notification.notification_id);

  //     if (metadata?.targetTab) {
  //       sessionStorage.setItem('targetTab', metadata.targetTab);
  //     }

  //     if (metadata?.targetFilter) {
  //       sessionStorage.setItem('targetFilter', metadata.targetFilter);
  //     }

  //     // ✅ Kiểm tra metadata có targetPage không
  //     if (metadata?.targetPage) {
  //       console.log('🚀 Chuyển trang đến:', metadata.targetPage);
  //       navigate(metadata.targetPage);
  //     } else {
  //       console.log('⚠️ Không có targetPage trong metadata');
  //     }
  //   } catch (error) {
  //     console.error('❌ Lỗi khi xử lý notification:', error);
  //   }
  // };
  return (
    <div className="flex flex-col h-full">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-800">Thông báo</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
            {/* Filter Tabs and Button */}
            <div className="flex justify-between items-center mb-6 gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log('📌 Switching to "all" tab');
                    setFilter('all');
                  }}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => {
                    console.log('📌 Switching to "unread" tab');
                    setFilter('unread');
                  }}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    filter === 'unread'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
              </div>
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Đang tải...</p>
              </div>
            )}

            {/* Notifications List */}
            {!isLoading && filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.notification_id}
                    notification={notification}
                    onClick={() => {
                      console.log('✅ Mark as read:', notification.notification_id);
                      markAsRead(notification.notification_id);

                      // ✅ Xử lý navigation từ metadata
                      try {
                        let metadata = notification.metadata;
                        if (typeof metadata === 'string') {
                          metadata = JSON.parse(metadata);
                        }

                        console.log('🔍 Metadata for navigation:', metadata);

                        if (metadata?.targetPage) {
                          // ✅ Lưu session data
                          if (metadata.tab) {
                            sessionStorage.setItem('targetTab', String(metadata.tab));
                            console.log('💾 Saved targetTab:', metadata.tab);
                          }
                          if (metadata.targetFilter) {
                            sessionStorage.setItem('targetFilter', String(metadata.targetFilter));
                            console.log('💾 Saved targetFilter:', metadata.targetFilter);
                          }

                          // ✅ Map targetPage tới route tương ứng dựa trên role
                          const prefix = userRole === 'student' ? '/student' : '/tutor';
                          
                          const routeMap: { [key: string]: string } = {
                            applications: `${prefix}/applications`,
                            classes: `${prefix}/manage-classes`,
                            'my-classes': `${prefix}/manage-classes`,
                            notifications: `${prefix}/notifications`,
                          };

                          let route = routeMap[metadata.targetPage] || prefix;
                          
                          // ✅ Thêm tab query param nếu có + refresh timestamp
                          if (metadata.tab) {
                            route += `?tab=${metadata.tab}&refresh=${Date.now()}`;
                          } else {
                            route += `?refresh=${Date.now()}`;
                          }

                          navigate(route);
                          console.log('🚀 Navigating to', route, 'for role:', userRole);
                        }
                      } catch (error) {
                        console.error('❌ Error parsing metadata:', error);
                      }
                    }}
                    onDelete={() => {
                      console.log('🗑️ Delete notification:', notification.notification_id);
                      deleteNotification(notification.notification_id);
                    }}
                  />
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">
                    {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
  );
};

export default NotificationsPage;
