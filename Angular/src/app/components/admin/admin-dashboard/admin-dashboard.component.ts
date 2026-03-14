import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService, QuestionService } from '../../../services/api.services';
import { AdminStats } from '../../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="admin-page fade-in">
        <div class="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p class="text-muted">Platform overview and management</p>
          </div>
          <a routerLink="/admin/users" class="btn btn-primary">Manage Users →</a>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid" *ngIf="stats">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <span class="stat-number">{{ stats.totalUsers }}</span>
              <span class="stat-label">Total Users</span>
            </div>
            <div class="stat-sub">{{ stats.activeUsers }} active</div>
          </div>
          <div class="stat-card accent">
            <div class="stat-icon">💬</div>
            <div class="stat-info">
              <span class="stat-number">{{ stats.totalQuestions }}</span>
              <span class="stat-label">Questions</span>
            </div>
            <div class="stat-sub">{{ stats.resolvedQuestions }} resolved</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✍️</div>
            <div class="stat-info">
              <span class="stat-number">{{ stats.totalAnswers }}</span>
              <span class="stat-label">Answers</span>
            </div>
            <div class="stat-sub">Community responses</div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon">✓</div>
            <div class="stat-info">
              <span class="stat-number">{{ resolveRate }}%</span>
              <span class="stat-label">Resolve Rate</span>
            </div>
            <div class="stat-sub">Questions answered</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="section-title">Quick Actions</div>
        <div class="actions-grid">
          <a routerLink="/admin/users" class="action-card">
            <span class="action-icon">👥</span>
            <div>
              <div class="action-name">User Management</div>
              <div class="action-desc">View, activate, and deactivate users</div>
            </div>
            <span class="action-arrow">→</span>
          </a>
          <a routerLink="/questions" class="action-card">
            <span class="action-icon">💬</span>
            <div>
              <div class="action-name">Moderate Questions</div>
              <div class="action-desc">Review and manage all questions</div>
            </div>
            <span class="action-arrow">→</span>
          </a>
        </div>

        <!-- Recent Questions -->
        <div class="section-title">Recent Questions</div>
        <div class="recent-list" *ngIf="recentQuestions.length > 0">
          <div *ngFor="let q of recentQuestions" class="recent-item">
            <div class="recent-info">
              <a [routerLink]="['/questions', q.questionId]" class="recent-title">{{ q.title }}</a>
              <span class="text-muted text-sm">by {{ q.username }} · {{ q.createdAt | date:'MMM d' }}</span>
            </div>
            <div class="recent-stats">
              <span class="badge-resolved" *ngIf="q.isResolved">✓</span>
              <span class="stat-chip">{{ q.answerCount }} ans</span>
              <span class="stat-chip">{{ q.viewCount }} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 40px 0; }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
    .admin-header h1 { margin-bottom: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 24px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s;
    }
    .stat-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
    .stat-card.accent { border-color: rgba(108,142,255,0.3); background: rgba(108,142,255,0.05); }
    .stat-card.success { border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.05); }
    .stat-icon { font-size: 1.5rem; }
    .stat-info { display: flex; flex-direction: column; gap: 2px; }
    .stat-number { font-family: var(--font-mono); font-size: 2rem; font-weight: 600; color: var(--text-primary); }
    .stat-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
    .stat-sub { font-size: 0.78rem; color: var(--text-muted); }
    .section-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 600; margin-bottom: 16px; margin-top: 8px; }
    .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px; }
    .action-card {
      display: flex; align-items: center; gap: 16px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px; text-decoration: none;
      transition: all 0.2s; color: var(--text-primary);
    }
    .action-card:hover { border-color: var(--accent); }
    .action-icon { font-size: 1.5rem; flex-shrink: 0; }
    .action-name { font-weight: 600; margin-bottom: 2px; }
    .action-desc { font-size: 0.82rem; color: var(--text-muted); }
    .action-arrow { margin-left: auto; color: var(--text-muted); }
    .recent-list { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); gap: 12px; }
    .recent-item:last-child { border-bottom: none; }
    .recent-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .recent-title { color: var(--text-primary); text-decoration: none; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .recent-title:hover { color: var(--accent); }
    .recent-stats { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .stat-chip { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; padding: 3px 8px; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr 1fr; } .actions-grid { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  recentQuestions: any[] = [];

  constructor(private userService: UserService, private questionService: QuestionService) {}

  get resolveRate() {
    if (!this.stats || !this.stats.totalQuestions) return 0;
    return Math.round((this.stats.resolvedQuestions / this.stats.totalQuestions) * 100);
  }

  ngOnInit() {
    this.userService.getStats().subscribe(s => this.stats = s);
    this.questionService.getAll({ page: 1, pageSize: 8 }).subscribe(r => this.recentQuestions = r.questions);
  }
}
