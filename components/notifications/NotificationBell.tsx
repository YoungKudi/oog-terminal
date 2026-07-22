'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/hooks/useNotifications';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  action: string;
  containerNumber?: string;
  details?: string;
  createdAt: string;
  userId?: string;
  user?: {
    name?: string;
    userId?: string;
  };
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { unreadCount, markAsRead, fetchNotifications, permission } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          const data = await fetchNotifications();
          setNotifications(data);
        } catch (error) {
          console.error('Error loading notifications:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'added':
      case 'receival':
        return '📦';
      case 'devanning':
      case 'started':
        return '🔧';
      case 'unstuffed':
        return '📋';
      case 'cleared':
      case 'loadout':
        return '✅';
      case 'evacuated':
        return '🚛';
      case 'updated':
        return '✏️';
      case 'deleted':
      case 'removed':
        return '🗑️';
      default:
        return '📢';
    }
  };

  const getActionColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('add') || lower.includes('receival')) return 'text-green-600 dark:text-green-400';
    if (lower.includes('devanning')) return 'text-blue-600 dark:text-blue-400';
    if (lower.includes('unstuffed')) return 'text-purple-600 dark:text-purple-400';
    if (lower.includes('clear') || lower.includes('loadout')) return 'text-green-600 dark:text-green-400';
    if (lower.includes('evacuat')) return 'text-orange-600 dark:text-orange-400';
    if (lower.includes('update')) return 'text-yellow-600 dark:text-yellow-400';
    if (lower.includes('delete') || lower.includes('remove')) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getUserDisplay = (notification: Notification) => {
    if (!notification.userId) return 'System';
    if (notification.user?.name) return notification.user.name;
    if (notification.user?.userId) return notification.user.userId;
    return `User ${notification.userId.slice(0, 8)}`;
  };

  const getNotificationLink = (notification: Notification) => {
    // Link to relevant page based on action
    const action = notification.action.toLowerCase();
    if (action.includes('devanning')) return '/dashboard/devanning';
    if (action.includes('unstuffed')) return '/dashboard/unstuffed';
    if (action.includes('clear') || action.includes('loadout')) return '/dashboard/unstuffed';
    if (action.includes('evacuat')) return '/dashboard/evacuation';
    if (action.includes('add') || action.includes('receival')) return '/dashboard/receivals';
    if (action.includes('update') || action.includes('delete')) return '/dashboard/tallies';
    return '/dashboard';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <Link
                href="/dashboard/profile"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View Profile
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-8rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No notifications</p>
                <p className="text-xs mt-1">New activity will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-lg">{getActionIcon(notification.action)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={getNotificationLink(notification)}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className={`font-medium ${getActionColor(notification.action)}`}>
                            {notification.action}
                          </span>
                          {notification.containerNumber && (
                            <span className="font-mono ml-1 text-gray-700 dark:text-gray-300">
                              {notification.containerNumber}
                            </span>
                          )}
                        </p>
                        {notification.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {notification.details}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                          <Link
                            href="/dashboard/profile"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getUserDisplay(notification)}
                          </Link>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {notifications.length} notifications
                </span>
                <Link
                  href="/dashboard/profile"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Go to Profile →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
