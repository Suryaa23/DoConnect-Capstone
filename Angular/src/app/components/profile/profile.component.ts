import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

const BASE = 'https://localhost:7001/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container" *ngIf="user">
      <div class="profile-page fade-in">
        <div class="profile-header">
          <div class="profile-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
          <div class="profile-info">
            <h1>{{ user.username }}</h1>
            <span class="role-tag">{{ user.role }}</span>
            <p class="text-muted text-sm">Joined {{ user.createdAt | date:'MMMM yyyy' }}</p>
          </div>
        </div>
        <div class="profile-body">
          <div class="profile-section">
            <h2>Questions</h2>
            <div *ngIf="questions.length === 0" class="empty-state" style="padding:30px 0"><p>No questions yet</p></div>
            <div *ngFor="let q of questions" class="question-item" [routerLink]="['/questions', q.questionId]">
              <span>{{ q.title }}</span>
            </div>
          </div>
          <div class="profile-section">
            <h2>Reviews ({{ reviews.length }})</h2>
            <div *ngIf="canReview" class="review-form">
              <h4>Leave a Review</h4>
              <div class="star-picker">
                <span *ngFor="let s of [1,2,3,4,5]" class="star-pick"
                  [class.selected]="newRating >= s" (click)="newRating = s">★</span>
              </div>
              <textarea [(ngModel)]="newReviewContent" class="form-control" rows="3"
                placeholder="Share your experience..."></textarea>
              <button class="btn btn-primary btn-sm" style="margin-top:8px" (click)="submitReview()"
                [disabled]="!newRating || !newReviewContent.trim()">Submit Review</button>
            </div>
            <div *ngFor="let r of reviews" class="review-card">
              <strong>{{ r.username }}</strong>
              <span *ngFor="let s of [1,2,3,4,5]" [style.color]="s <= r.rating ? '#fbbf24' : '#555'">★</span>
              <p>{{ r.content }}</p>
            </div>
            <div *ngIf="reviews.length === 0" class="empty-state" style="padding:30px 0"><p>No reviews yet</p></div>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="loading" class="spinner"></div>
  `,
  styles: [`
    .profile-page { padding: 40px 0; }
    .profile-header { display: flex; gap: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; margin-bottom: 28px; align-items: center; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 20px; background: var(--accent-glow); border: 3px solid var(--accent); color: var(--accent); font-size: 2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .profile-info h1 { font-size: 1.8rem; margin-bottom: 6px; }
    .role-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border); }
    .profile-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .profile-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
    .profile-section h2 { font-size: 1rem; font-weight: 600; margin-bottom: 20px; }
    .question-item { padding: 12px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
    .review-form { background: var(--bg-secondary); border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .review-form h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 10px; }
    .star-picker { display: flex; gap: 4px; margin-bottom: 10px; }
    .star-pick { font-size: 1.5rem; color: #555; cursor: pointer; }
    .star-pick.selected { color: #fbbf24; }
    .review-card { padding: 14px 0; border-bottom: 1px solid var(--border); }
    .review-card p { font-size: 0.88rem; color: var(--text-secondary); margin-top: 4px; }
    @media (max-width: 768px) { .profile-body { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = null;
  questions: any[] = [];
  reviews: any[] = [];
  loading = true;
  newRating = 0;
  newReviewContent = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService
  ) {}

  get isOwnProfile() { return this.authService.currentUser?.userId === this.user?.userId; }
  get canReview() { return this.authService.isLoggedIn && !this.isOwnProfile; }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.http.get(`${BASE}/users/${id}`).subscribe((u: any) => {
      this.user = u; this.loading = false;
    });
    this.http.get(`${BASE}/questions/user/${id}`).subscribe((q: any) => this.questions = q);
    this.http.get(`${BASE}/reviews/user/${id}`).subscribe((r: any) => {
      this.reviews = r.reviews;
    });
  }

  submitReview() {
    this.http.post(`${BASE}/reviews`, {
      content: this.newReviewContent,
      rating: this.newRating,
      reviewedUserId: this.user.userId
    }).subscribe(() => {
      this.newReviewContent = '';
      this.newRating = 0;
      this.http.get(`${BASE}/reviews/user/${this.user.userId}`).subscribe((r: any) => {
        this.reviews = r.reviews;
      });
    });
  }
}