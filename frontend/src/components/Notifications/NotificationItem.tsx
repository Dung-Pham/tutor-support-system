import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Notification } from '../../types';
import { RootState } from '../../store';
import styles from './styles/notification.module.css';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
  onTabChange?: (tab: string) => void;
  onNavigate?: (path: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onDelete,
}) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Get base route based on user role
  const getBaseRoute = () => {
    const role = user?.role?.toLowerCase();
    return role === 'tutor' ? '/tutor' : '/student';
  };
  /**
   * Get icon based on type
   */
  const getIcon = () => {
    const icons: { [key: string]: string } = {
      TUTOR_INVITED: '📨',
      APPLICATION_APPROVED: '🎉',
      APPLICATION_REJECTED: '❌',
      CLASS_UPDATED: '📝',
      CLASS_CANCELLED: '🚫',
      CLASS_CONFIRMED_BY_TUTOR: '✅',
      CLASS_REJECTED_BY_TUTOR: '❌',
      APPLICATION_SUBMITTED: '📋',
    };
    return icons[notification.type] || '🔔';
  };

  /**
   * Format time
   */
  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}m trước`;
    if (hours < 24) return `${hours}h trước`;
    if (days < 7) return `${days}d trước`;

    return notifDate.toLocaleDateString('vi-VN');
  };
  const handleClick = () => {
    console.log('📬 Click notification:', {
      type: notification.type,
      metadata: notification.metadata,
    });

    try {
      let metadata = notification.metadata;
      if (typeof metadata === 'string') {
        metadata = JSON.parse(metadata);
        console.log('📝 Parsed metadata:', metadata);
      }

      console.log('🔍 Metadata:', metadata);
      
      // ✅ Kiểm tra metadata có targetPage không
      if (metadata?.tab) {
        sessionStorage.setItem('targetTab', String(metadata.tab));
        console.log('💾 Lưu targetTab:', metadata.tab);
      }

      // ✅ THÊM: Lưu targetFilter (cho ManageClassesPage)
      if (metadata?.targetFilter) {
        sessionStorage.setItem('targetFilter', String(metadata.targetFilter));
        console.log('💾 Lưu targetFilter:', metadata.targetFilter);
      }

      // ✅ Navigate đến trang tương ứng dựa trên targetPage
      if (metadata?.targetPage) {
        const baseRoute = getBaseRoute();
        let targetPath = '';
        
        // Map targetPage to actual route
        switch (metadata.targetPage) {
          case 'classes':
          case 'my-classes':
            targetPath = `${baseRoute}/classes`;
            break;
          case 'applications':
            targetPath = `${baseRoute}/applications`;
            break;
          case 'search':
            targetPath = `${baseRoute}/search`;
            break;
          case 'manage-classes':
            targetPath = `${baseRoute}/manage-classes`;
            break;
          case 'notifications':
            targetPath = `${baseRoute}/notifications`;
            break;
          default:
            targetPath = `${baseRoute}/${metadata.targetPage}`;
        }
        
        console.log('🚀 Navigate to:', targetPath);
        navigate(targetPath);
      }

      // ✅ Gọi onClick callback nếu có (để mark as read, close dropdown, etc.)
      onClick?.();
    } catch (error) {
      console.error('❌ Lỗi khi xử lý notification:', error);
      onClick?.();
    }
  };
  return (
    <div
      className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={styles.icon}>{getIcon()}</div>

      {/* Content */}
      <div className={styles.content}>
        <h4 className={styles.title}>{notification.title}</h4>
        <p className={styles.message}>{notification.message}</p>
        <span className={styles.time}>{formatTime(notification.created_at)}</span>
      </div>

      {/* Delete Button */}
      <button
        className={styles.deleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete"
      >
        ✕
      </button>

      {/* Unread Indicator */}
      {!notification.is_read && <div className={styles.unreadDot} />}
    </div>
  );
};

export default NotificationItem;
