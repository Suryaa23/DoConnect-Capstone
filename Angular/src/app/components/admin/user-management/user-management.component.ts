import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/api.services';
import { User } from '../../../models/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="admin-page fade-in">
        <div class="page-header">
          <div>
            <a routerLink="/admin" class="back-link">← Dashboard</a>
            <h1>User Management</h1>
            <p class="text-muted">{{ total }} total users</p>
          </div>
        </div>

        <!-- Search -->
        <div class="search-bar">
          <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="search()"
            placeholder="Search by username or email..." class="search-input">
          <button class="btn btn-ghost" (click)="search()">Search</button>
        </div>

        <div *ngIf="loading" class="spinner"></div>

        <div *ngIf="!loading" class="users-table">
          <div class="table-header">
            <span>User</span>
            <span>Role</span>
            <span>Activity</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <div *ngFor="let user of users" class="table-row" [class.inactive]="!user.isActive">
            <div class="user-cell">
              <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
              <div>
                <div class="username">{{ user.username }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <div>
              <span class="role-badge" [class.admin-badge]="user.role === 'Admin'">{{ user.role }}</span>
            </div>
            <div class="activity-cell">
              <span class="activity-item">💬 {{ user.questionCount }}</span>
              <span class="activity-item">✍️ {{ user.answerCount }}</span>
            </div>
            <div class="text-muted text-sm">{{ user.createdAt | date:'MMM d, yyyy' }}</div>
            <div>
              <span class="status-dot" [class.active]="user.isActive"></span>
              <span class="text-sm" [style.color]="user.isActive ? 'var(--success)' : 'var(--danger)'">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="actions-cell">
              <a [routerLink]="['/profile', user.userId]" class="btn btn-ghost btn-sm">View</a>
              <button class="btn btn-sm"
                [class.btn-success]="!user.isActive"
                [class.btn-danger]="user.isActive"
                (click)="toggleStatus(user)"
                [disabled]="user.role === 'Admin'">
                {{ user.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">‹</button>
          <button *ngFor="let p of pageNumbers" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
          <button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">›</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 40px 0; }
    .page-header { margin-bottom: 28px; }
    .back-link { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; display: block; margin-bottom: 12px; }
    .back-link:hover { color: var(--accent); }
    .page-header h1 { margin-bottom: 4px; }
    .search-bar { display: flex; gap: 12px; margin-bottom: 24px; }
    .search-input {
      flex: 1; background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 11px 16px; color: var(--text-primary);
      font-family: var(--font-body); font-size: 0.9rem; outline: none; transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    .users-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .table-header {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
      padding: 12px 20px; background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-muted); font-weight: 600;
    }
    .table-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      align-items: center; transition: background 0.15s;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: var(--bg-hover); }
    .table-row.inactive { opacity: 0.6; }
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--accent-glow); color: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem; flex-shrink: 0;
    }
    .username { font-weight: 500; font-size: 0.9rem; }
    .user-email { font-size: 0.78rem; color: var(--text-muted); }
    .role-badge {
      padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;
      background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border);
    }
    .role-badge.admin-badge { background: rgba(248,113,113,0.1); color: var(--danger); border-color: rgba(248,113,113,0.2); }
    .activity-cell { display: flex; gap: 10px; }
    .activity-item { font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; background: var(--danger); }
    .status-dot.active { background: var(--success); }
    .actions-cell { display: flex; gap: 8px; }
    @media (max-width: 900px) { .table-header, .table-row { grid-template-columns: 2fr 1fr 1.5fr; }
      .table-header span:nth-child(3), .table-row > div:nth-child(3),
      .table-header span:nth-child(4), .table-row > div:nth-child(4) { display: none; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  total = 0;
  currentPage = 1;
  pageSize = 15;
  searchQuery = '';

  constructor(private userService: UserService) {}

  get totalPages() { return Math.ceil(this.total / this.pageSize); }
  get pageNumbers() {
    const pages = [];
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) pages.push(i);
    return pages;
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const params: any = { page: this.currentPage, pageSize: this.pageSize };
    if (this.searchQuery) params.search = this.searchQuery;
    this.userService.getAll(params).subscribe({
      next: (res) => { this.users = res.users; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  search() { this.currentPage = 1; this.load(); }
  goToPage(p: number) { this.currentPage = p; this.load(); }

  toggleStatus(user: User) {
    this.userService.toggleStatus(user.userId).subscribe(res => user.isActive = res.isActive);
  }
}
