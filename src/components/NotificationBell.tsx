"use client";
import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  target: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {});
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <Bell size={20} style={{ color: "var(--text-secondary)" }} />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {notifications.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg z-50">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Notifications
            </h3>
            <button onClick={() => setOpen(false)}>
              <X size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 border-b border-[var(--border)] last:border-0"
            >
              <h4
                className="font-medium text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {n.title}
              </h4>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {n.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
