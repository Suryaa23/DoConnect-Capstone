import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../services/api.services';
import { Notification } from '../../../models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="notif-page fade-in">
        <div class="page-header">
          <div>
            <h1>Notifications</h1>
            <p class="text-muted">{{ unreadCount }} unread</p>
          </div>
          <button *ngIf="unreadCount > 0" class="btn btn-ghost" (click)="markAllRead()">
            ✓ Mark all read
          </button>
        </div>

        <div *ngIf="loading" class="spinner"></div>

        <div *ngIf="!loading && notifications.length === 0" class="empty-state">
          <div class="icon">🔔</div>
          <p>No notifications yet</p>
        </div>

        <div *ngIf="!loading" class="notif-list">
          <div *ngFor="let n of notifications"
            class="notif-item"
            [class.unread]="!n.isRead"
            (click)="markRead(n)">
            <div class="notif-icon-wrap" [class]="'type-' + n.type.toLowerCase()">
              <span>{{ getIcon(n.type) }}</span>
            </div>
            <div class="notif-content">
              <p class="notif-message">{{ n.message }}</p>
              <span class="notif-time">{{ n.createdAt | date:'MMM d, h:mm a' }}</span>
            </div>
            <div class="notif-actions">
              <a *ngIf="n.questionId" [routerLink]="['/questions', n.questionId]"
                class="btn btn-ghost btn-sm" (click)="$event.stopPropagation()">View →</a>
              <button class="delete-btn" (click)="delete(n, $event)" title="Delete">×</button>
            </div>
            <div class="unread-dot" *ngIf="!n.isRead"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-page { max-width: 680px; margin: 0 auto; padding: 40px 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .page-header h1 { margin-bottom: 4px; }
    .notif-list { display: flex; flex-direction: column; gap: 8px; }
    .notif-item {
      display: flex; align-items: center; gap: 16px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px 20px;
      cursor: pointer; transition: all 0.2s; position: relative;
    }
    .notif-item:hover { border-color: var(--border-light); }
    .notif-item.unread { border-left: 3px solid var(--accent); background: rgba(108,142,255,0.04); }
    .notif-icon-wrap {
      width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
      background: var(--bg-secondary);
    }
    .type-answer { background: rgba(108,142,255,0.1); }
    .type-system { background: rgba(251,146,60,0.1); }
    .notif-content { flex: 1; min-width: 0; }
    .notif-message { font-size: 0.9rem; color: var(--text-primary); margin-bottom: 4px; }
    .notif-time { font-size: 0.78rem; color: var(--text-muted); }
    .notif-actions { display: flex; align-items: center; gap: 8px; }
    .delete-btn {
      background: none; border: none; color: var(--text-muted); cursor: pointer;
      font-size: 1.2rem; padding: 4px 8px; border-radius: 6px; transition: all 0.15s;
    }
    .delete-btn:hover { color: var(--danger); background: rgba(248,113,113,0.1); }
    .unread-dot {
      position: absolute; top: 14px; right: 14px;
      width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(private notifService: NotificationService) {}

  get unreadCount() { return this.notifications.filter(n => !n.isRead).length; }

  ngOnInit() {
    this.notifService.getAll().subscribe({
      next: (n) => { this.notifications = n; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = { Answer: '💬', Mention: '📌', System: '🔔', Info: 'ℹ️' };
    return icons[type] || '🔔';
  }

  markRead(n: Notification) {
    if (n.isRead) return;
    this.notifService.markRead(n.notificationId).subscribe(() => n.isRead = true);
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe(() => this.notifications.forEach(n => n.isRead = true));
  }

  delete(n: Notification, e: Event) {
    e.stopPropagation();
    this.notifService.delete(n.notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(x => x.notificationId !== n.notificationId);
    });
  }
}
