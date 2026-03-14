import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../../services/api.services';
import { Question } from '../../../models/models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Questions</h1>
          <p class="text-muted">{{ total }} questions in the community</p>
        </div>
        <a *ngIf="isLoggedIn" routerLink="/questions/ask" class="btn btn-primary">
          ✦ Ask Question
        </a>
      </div>
      <div class="filters-bar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="search()"
            placeholder="Search questions..." class="search-input">
        </div>
        <div class="filter-group">
          <button class="filter-btn" [class.active]="!resolvedFilter" (click)="setFilter(null)">All</button>
          <button class="filter-btn" [class.active]="resolvedFilter === false" (click)="setFilter(false)">Open</button>
          <button class="filter-btn" [class.active]="resolvedFilter === true" (click)="setFilter(true)">Resolved</button>
        </div>
      </div>
      <div *ngIf="loading" class="spinner"></div>
      <div *ngIf="!loading">
        <div *ngIf="questions.length === 0" class="empty-state">
          <p>No questions found.</p>
        </div>
        <div class="questions-list">
          <div *ngFor="let q of questions" class="question-card fade-in" [routerLink]="['/questions', q.questionId]">
            <div class="q-stats">
              <div class="stat">
                <span class="stat-value">{{ q.voteCount }}</span>
                <span class="stat-label">votes</span>
              </div>
              <div class="stat" [class.resolved]="q.isResolved">
                <span class="stat-value">{{ q.answerCount }}</span>
                <span class="stat-label">{{ q.isResolved ? '✓ ans' : 'answers' }}</span>
              </div>
            </div>
            <div class="q-content">
              <div class="q-title-row">
                <h3 class="q-title">{{ q.title }}</h3>
                <span *ngIf="q.isResolved" class="badge-resolved">✓ Resolved</span>
              </div>
              <p class="q-body">{{ q.body | slice:0:180 }}{{ q.body.length > 180 ? '...' : '' }}</p>
              <div class="q-meta">
                <div class="q-tags">
                  <span *ngFor="let tag of getTags(q.tags)" class="tag">{{ tag }}</span>
                </div>
                <div class="q-author">
                  <span class="author-avatar">{{ q.username.charAt(0).toUpperCase() }}</span>
                  <span class="author-name" [routerLink]="['/profile', q.userId]" (click)="$event.stopPropagation()">{{ q.username }}</span>
                  <span class="q-date">· {{ q.createdAt | date:'MMM d' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pagination" *ngIf="totalPages > 1">
          <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">‹ Prev</button>
          <button *ngFor="let p of pageNumbers" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
          <button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Next ›</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 40px 0 28px; }
    .page-header h1 { margin-bottom: 4px; }
    .filters-bar { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 20px; }
    .search-wrap { flex: 1; min-width: 200px; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search-input { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px 10px 36px; color: var(--text-primary); font-size: 0.9rem; outline: none; }
    .search-input:focus { border-color: var(--accent); }
    .filter-group { display: flex; gap: 6px; }
    .filter-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
    .filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .questions-list { display: flex; flex-direction: column; gap: 12px; }
    .question-card { display: flex; gap: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; cursor: pointer; transition: all 0.2s; }
    .question-card:hover { border-color: var(--accent); transform: translateY(-1px); }
    .q-stats { display: flex; flex-direction: column; gap: 12px; min-width: 64px; align-items: center; }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 1rem; font-weight: 600; }
    .stat-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }
    .stat.resolved .stat-value { color: var(--success); }
    .q-content { flex: 1; }
    .q-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .q-title { font-size: 1rem; font-weight: 600; }
    .q-body { color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 12px; }
    .q-meta { display: flex; justify-content: space-between; align-items: center; }
    .q-tags { display: flex; gap: 6px; }
    .q-author { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.82rem; }
    .author-avatar { width: 22px; height: 22px; border-radius: 6px; background: var(--accent-glow); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
    .author-name { color: var(--accent); font-weight: 500; cursor: pointer; }
    .author-name:hover { text-decoration: underline; }
  `]
})
export class QuestionListComponent implements OnInit {
  questions: Question[] = [];
  loading = true;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  searchQuery = '';
  resolvedFilter: boolean | null = null;
  tagFilter = '';

  constructor(public questionService: QuestionService, public authService: AuthService) {}

  get isLoggedIn() { return this.authService.isLoggedIn; }
  get totalPages() { return Math.ceil(this.total / this.pageSize); }
  get pageNumbers() {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const params: any = { page: this.currentPage, pageSize: this.pageSize };
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.tagFilter) params.tag = this.tagFilter;
    if (this.resolvedFilter !== null) params.resolved = this.resolvedFilter;
    this.questionService.getAll(params).subscribe({
      next: (res) => { this.questions = res.questions; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  search() { this.currentPage = 1; this.load(); }
  setFilter(val: boolean | null) { this.resolvedFilter = val; this.currentPage = 1; this.load(); }
  goToPage(p: number) { this.currentPage = p; this.load(); window.scrollTo(0, 0); }
  getTags(tags?: string): string[] { return tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []; }
}