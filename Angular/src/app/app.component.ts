import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/api.services';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="container nav-inner">
        <a routerLink="/questions" class="brand">
          <span class="brand-icon">⬡</span>
          <span class="brand-text">Do<em>Connect</em></span>
        </a>

        <div class="nav-links">
          <a routerLink="/questions" routerLinkActive="active" class="nav-link">Questions</a>
          <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" class="nav-link admin-link">Admin</a>
        </div>

        <div class="nav-actions">
          <ng-container *ngIf="isLoggedIn; else authButtons">
            <a routerLink="/questions/ask" class="btn btn-primary btn-sm">Ask Question</a>

            <a routerLink="/notifications" class="notif-btn" [class.has-notif]="unreadCount > 0">
              <span class="notif-icon">🔔</span>
              <span *ngIf="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
            </a>

            <div class="user-menu" (click)="toggleUserMenu()" [class.open]="menuOpen">
              <div class="avatar">{{ currentUser?.username?.charAt(0)?.toUpperCase() }}</div>
              <div class="user-dropdown" *ngIf="menuOpen">
                <a [routerLink]="['/profile', currentUser?.userId]" class="dropdown-item">
                  👤 My Profile
                </a>
                <hr class="dropdown-divider">
                <button class="dropdown-item danger" (click)="logout()">🚪 Logout</button>
              </div>
            </div>
          </ng-container>

          <ng-template #authButtons>
            <a routerLink="/login" class="btn btn-ghost btn-sm">Login</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </nav>

    <main class="page-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(13, 15, 20, 0.92);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      height: 64px;
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 64px; gap: 24px;
    }
    .brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; color: var(--text-primary);
      flex-shrink: 0;
    }
    .brand-icon { font-size: 1.5rem; color: var(--accent); }
    .brand-text { font-family: var(--font-display); font-size: 1.3rem; }
    .brand-text em { color: var(--accent); font-style: normal; }
    .nav-links { display: flex; gap: 8px; }
    .nav-link {
      padding: 6px 14px; border-radius: 8px; text-decoration: none;
      color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;
      transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active { color: var(--text-primary); background: var(--bg-hover); }
    .admin-link { color: var(--warning); }
    .nav-actions { display: flex; align-items: center; gap: 12px; }
    .notif-btn {
      position: relative; width: 38px; height: 38px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; text-decoration: none; transition: all 0.2s;
    }
    .notif-btn:hover { border-color: var(--accent); }
    .notif-btn.has-notif { border-color: var(--accent); box-shadow: 0 0 12px var(--accent-glow); }
    .notif-icon { font-size: 1rem; }
    .notif-badge {
      position: absolute; top: -6px; right: -6px;
      background: var(--accent); color: #fff;
      font-size: 0.65rem; font-weight: 700;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .user-menu { position: relative; cursor: pointer; }
    .avatar {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--accent-glow); border: 2px solid var(--accent);
      color: var(--accent); font-weight: 600; font-size: 0.95rem;
      display: flex; align-items: center; justify-content: center;
    }
    .user-dropdown {
      position: absolute; top: calc(100% + 10px); right: 0;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius); min-width: 180px;
      box-shadow: var(--shadow); overflow: hidden; z-index: 200;
    }
    .dropdown-item {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; text-decoration: none; color: var(--text-secondary);
      font-size: 0.9rem; cursor: pointer; background: none; border: none;
      width: 100%; text-align: left; transition: all 0.15s;
    }
    .dropdown-item:hover { background: var(--bg-hover); color: var(--text-primary); }
    .dropdown-item.danger:hover { color: var(--danger); }
    .dropdown-divider { height: 1px; background: var(--border); border: none; margin: 0; }
    @media (max-width: 600px) {
      .nav-links { display: none; }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  menuOpen = false;
  private sub?: Subscription;

  constructor(
    public authService: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  get isLoggedIn() { return this.authService.isLoggedIn; }
  get isAdmin() { return this.authService.isAdmin; }
  get currentUser() { return this.authService.currentUser; }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) this.startPolling();
      else { this.sub?.unsubscribe(); this.unreadCount = 0; }
    });
    document.addEventListener('click', this.onDocClick.bind(this));
  }

  startPolling() {
    this.notifService.getUnreadCount().subscribe(r => this.unreadCount = r.count);
    this.sub = interval(30000).pipe(
      switchMap(() => this.notifService.getUnreadCount())
    ).subscribe(r => this.unreadCount = r.count);
  }

  toggleUserMenu() { this.menuOpen = !this.menuOpen; }

  onDocClick(e: Event) {
    if (!(e.target as Element).closest('.user-menu')) this.menuOpen = false;
  }

  logout() { this.authService.logout(); this.menuOpen = false; }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    document.removeEventListener('click', this.onDocClick.bind(this));
  }
}
