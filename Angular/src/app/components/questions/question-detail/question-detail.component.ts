import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService, AnswerService } from '../../../services/api.services';
import { AuthService } from '../../../services/auth.service';
import { Question, Answer } from '../../../models/models';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container">
      <div class="detail-page" *ngIf="!loading; else loader">

        <a routerLink="/questions" class="back-link">← All Questions</a>

        <!-- Question -->
        <div class="question-section" *ngIf="question">
          <div class="q-header">
            <div class="q-title-area">
              <div class="q-badges">
                <span *ngIf="question.isResolved" class="badge-resolved">✓ Resolved</span>
                <span *ngIf="!question.isResolved" class="badge-unresolved">Open</span>
              </div>
              <h1>{{ question.title }}</h1>
              <div class="q-meta-row">
                <span class="text-muted">Asked by <strong class="author">{{ question.username }}</strong></span>
                <span class="text-muted">· {{ question.createdAt | date:'MMM d, yyyy' }}</span>
                <span class="text-muted">· {{ question.viewCount }} views</span>
              </div>
            </div>
          </div>

          <div class="content-row">
            <!-- Votes -->
            <div class="vote-btn">
              <button (click)="voteQuestion('up')" title="Upvote">▲</button>
              <span class="count">{{ question.voteCount }}</span>
              <button (click)="voteQuestion('down')" title="Downvote">▼</button>
            </div>

            <div class="q-body-area">
              <div class="q-body-text">{{ question.body }}</div>

              <div class="q-tags" *ngIf="question.tags">
                <span *ngFor="let tag of getTags(question.tags)" class="tag">{{ tag }}</span>
              </div>

              <!-- Author actions -->
              <div class="q-actions" *ngIf="isQuestionOwner">
                <button class="btn btn-ghost btn-sm" (click)="editMode = !editMode">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" (click)="deleteQuestion()">🗑 Delete</button>
                <button *ngIf="!question.isResolved" class="btn btn-success btn-sm" (click)="markResolved()">✓ Mark Resolved</button>
              </div>

              <!-- Edit form -->
              <div class="edit-form" *ngIf="editMode">
                <div class="form-group mt-16">
                  <label>Title</label>
                  <input type="text" [(ngModel)]="editTitle" class="form-control">
                </div>
                <div class="form-group">
                  <label>Body</label>
                  <textarea [(ngModel)]="editBody" class="form-control" rows="6"></textarea>
                </div>
                <div class="form-group">
                  <label>Tags</label>
                  <input type="text" [(ngModel)]="editTags" class="form-control">
                </div>
                <div class="flex gap-8">
                  <button class="btn btn-primary btn-sm" (click)="saveEdit()">Save</button>
                  <button class="btn btn-ghost btn-sm" (click)="editMode = false">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Answers -->
        <div class="answers-section">
          <h2>{{ answers.length }} {{ answers.length === 1 ? 'Answer' : 'Answers' }}</h2>

          <div class="answers-list" *ngIf="answers.length > 0">
            <div *ngFor="let a of answers" class="answer-card" [class.accepted]="a.isAccepted">
              <div class="accepted-banner" *ngIf="a.isAccepted">✓ Accepted Answer</div>

              <div class="content-row">
                <div class="vote-btn">
                  <button (click)="voteAnswer(a, 'up')">▲</button>
                  <span class="count">{{ a.voteCount }}</span>
                  <button (click)="voteAnswer(a, 'down')">▼</button>
                  <button *ngIf="isQuestionOwner && !question?.isResolved"
                    class="accept-btn" title="Accept this answer"
                    (click)="acceptAnswer(a.answerId)">✓</button>
                </div>

                <div class="answer-body-area">
                  <div class="answer-body" *ngIf="editingAnswerId !== a.answerId">{{ a.body }}</div>

                  <!-- Edit answer -->
                  <div *ngIf="editingAnswerId === a.answerId">
                    <textarea [(ngModel)]="editAnswerBody" class="form-control" rows="5"></textarea>
                    <div class="flex gap-8 mt-8">
                      <button class="btn btn-primary btn-sm" (click)="saveAnswerEdit(a)">Save</button>
                      <button class="btn btn-ghost btn-sm" (click)="editingAnswerId = null">Cancel</button>
                    </div>
                  </div>

                  <div class="answer-meta">
                    <span class="text-muted">{{ a.username }} · {{ a.createdAt | date:'MMM d, yyyy' }}</span>
                    <div class="flex gap-8" *ngIf="currentUserId === a.userId || isAdmin">
                      <button class="btn btn-ghost btn-sm" (click)="startEditAnswer(a)">Edit</button>
                      <button class="btn btn-danger btn-sm" (click)="deleteAnswer(a.answerId)">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Post answer -->
          <div class="post-answer-section" *ngIf="isLoggedIn">
            <h3>Your Answer</h3>
            <div *ngIf="answerError" class="alert alert-error">{{ answerError }}</div>
            <textarea [(ngModel)]="newAnswerBody" class="form-control" rows="8"
              placeholder="Write a detailed answer..."></textarea>
            <button class="btn btn-primary mt-16" (click)="postAnswer()" [disabled]="answerLoading || !newAnswerBody.trim()">
              {{ answerLoading ? 'Posting...' : 'Post Answer' }}
            </button>
          </div>

          <div class="login-prompt" *ngIf="!isLoggedIn">
            <a routerLink="/login" class="btn btn-primary">Login to Answer</a>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loader><div class="spinner"></div></ng-template>
  `,
  styles: [`
    .detail-page { max-width: 860px; margin: 0 auto; padding: 32px 0 60px; }
    .back-link { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; display: block; margin-bottom: 24px; }
    .back-link:hover { color: var(--accent); }
    .question-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin-bottom: 32px; }
    .q-header { margin-bottom: 24px; }
    .q-badges { margin-bottom: 10px; }
    .q-header h1 { font-size: 1.6rem; line-height: 1.3; margin-bottom: 10px; }
    .q-meta-row { display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.85rem; }
    .author { color: var(--accent); }
    .content-row { display: flex; gap: 20px; }
    .q-body-area, .answer-body-area { flex: 1; }
    .q-body-text, .answer-body { color: var(--text-primary); line-height: 1.7; white-space: pre-wrap; font-size: 0.95rem; }
    .q-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 16px; }
    .q-actions { display: flex; gap: 8px; margin-top: 16px; }
    .answers-section { }
    .answers-section h2 { font-family: var(--font-body); font-size: 1.1rem; font-weight: 600; margin-bottom: 20px; color: var(--text-secondary); }
    .answers-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
    .answer-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
    .answer-card.accepted { border-color: var(--success); background: rgba(52,211,153,0.04); }
    .accepted-banner { color: var(--success); font-size: 0.85rem; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
    .answer-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 8px; }
    .accept-btn {
      background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.3);
      color: var(--success); width: 36px; height: 36px; border-radius: 8px;
      cursor: pointer; font-size: 1rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    }
    .accept-btn:hover { background: rgba(74,222,128,0.25); }
    .post-answer-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; }
    .post-answer-section h3 { font-family: var(--font-body); font-size: 1rem; font-weight: 600; margin-bottom: 16px; }
    .login-prompt { text-align: center; padding: 32px; }
    .edit-form { margin-top: 16px; background: var(--bg-secondary); border-radius: var(--radius-sm); padding: 16px; }
  `]
})
export class QuestionDetailComponent implements OnInit {
  question: Question | null = null;
  answers: Answer[] = [];
  loading = true;
  editMode = false;
  editTitle = '';
  editBody = '';
  editTags = '';
  newAnswerBody = '';
  answerLoading = false;
  answerError = '';
  editingAnswerId: number | null = null;
  editAnswerBody = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private answerService: AnswerService,
    public authService: AuthService
  ) {}

  get isLoggedIn() { return this.authService.isLoggedIn; }
  get isAdmin() { return this.authService.isAdmin; }
  get currentUserId() { return this.authService.currentUser?.userId; }
  get isQuestionOwner() { return this.question && this.currentUserId === this.question.userId; }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.questionService.getById(id).subscribe({
      next: (res) => {
        this.question = res.question;
        this.answers = res.answers;
        this.editTitle = res.question.title;
        this.editBody = res.question.body;
        this.editTags = res.question.tags || '';
        this.loading = false;
      },
      error: () => this.router.navigate(['/questions'])
    });
  }

  getTags(tags?: string): string[] { return tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []; }

  voteQuestion(type: 'up' | 'down') {
    if (!this.isLoggedIn) return;
    this.questionService.vote(this.question!.questionId, type).subscribe(r => this.question!.voteCount = r.voteCount);
  }

  saveEdit() {
    this.questionService.update(this.question!.questionId, { title: this.editTitle, body: this.editBody, tags: this.editTags }).subscribe(() => {
      this.question!.title = this.editTitle;
      this.question!.body = this.editBody;
      this.question!.tags = this.editTags;
      this.editMode = false;
    });
  }

  deleteQuestion() {
    if (!confirm('Delete this question?')) return;
    this.questionService.delete(this.question!.questionId).subscribe(() => this.router.navigate(['/questions']));
  }

  markResolved() {
    this.questionService.resolve(this.question!.questionId).subscribe(() => this.question!.isResolved = true);
  }

  acceptAnswer(answerId: number) {
    this.questionService.resolve(this.question!.questionId, answerId).subscribe(() => {
      this.question!.isResolved = true;
      this.question!.acceptedAnswerId = answerId;
      this.answers.forEach(a => a.isAccepted = a.answerId === answerId);
    });
  }

  postAnswer() {
    if (!this.newAnswerBody.trim()) return;
    this.answerLoading = true;
    this.answerError = '';
    this.answerService.create({ body: this.newAnswerBody, questionId: this.question!.questionId }).subscribe({
      next: () => {
        this.newAnswerBody = '';
        this.answerLoading = false;
        this.ngOnInit();
      },
      error: (err) => { this.answerError = err.error?.message || 'Failed to post answer.'; this.answerLoading = false; }
    });
  }

  voteAnswer(a: Answer, type: 'up' | 'down') {
    if (!this.isLoggedIn) return;
    this.answerService.vote(a.answerId, type).subscribe(r => a.voteCount = r.voteCount);
  }

  startEditAnswer(a: Answer) { this.editingAnswerId = a.answerId; this.editAnswerBody = a.body; }

  saveAnswerEdit(a: Answer) {
    this.answerService.update(a.answerId, this.editAnswerBody).subscribe(() => {
      a.body = this.editAnswerBody;
      this.editingAnswerId = null;
    });
  }

  deleteAnswer(id: number) {
    if (!confirm('Delete this answer?')) return;
    this.answerService.delete(id).subscribe(() => this.answers = this.answers.filter(a => a.answerId !== id));
  }
}
