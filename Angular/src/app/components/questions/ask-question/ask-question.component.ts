import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuestionService } from '../../../services/api.services';

@Component({
  selector: 'app-ask-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="ask-page">
        <div class="ask-header">
          <a routerLink="/questions" class="back-link">← Back to Questions</a>
          <h1>Ask a Question</h1>
          <p class="text-muted">Share your question with the community</p>
        </div>

        <div class="ask-layout">
          <div class="ask-form-wrap">
            <div *ngIf="error" class="alert alert-error">{{ error }}</div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label>Question Title *</label>
                <input type="text" formControlName="title" class="form-control"
                  [class.is-invalid]="submitted && f['title'].errors"
                  placeholder="What's your question? Be specific.">
                <small *ngIf="submitted && f['title'].errors?.['required']" class="field-error">Title is required</small>
                <small *ngIf="submitted && f['title'].errors?.['minlength']" class="field-error">Title must be at least 15 characters</small>
              </div>

              <div class="form-group">
                <label>Body / Details *</label>
                <textarea formControlName="body" class="form-control" rows="10"
                  [class.is-invalid]="submitted && f['body'].errors"
                  placeholder="Include all relevant details. Paste code, error messages, or describe what you've tried..."></textarea>
                <small *ngIf="submitted && f['body'].errors?.['required']" class="field-error">Question body is required</small>
              </div>

              <div class="form-group">
                <label>Tags <span class="optional">(optional)</span></label>
                <input type="text" formControlName="tags" class="form-control"
                  placeholder="e.g. angular, csharp, sql (comma separated)">
                <small class="hint">Add up to 5 tags to describe your question's topic</small>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="loading">
                  {{ loading ? 'Posting...' : '✦ Post Question' }}
                </button>
                <a routerLink="/questions" class="btn btn-ghost">Cancel</a>
              </div>
            </form>
          </div>

          <div class="ask-tips">
            <h3>Writing a good question</h3>
            <ul>
              <li>📌 Summarize your problem in a single sentence for the title</li>
              <li>🔍 Describe what you've already tried</li>
              <li>💻 Include relevant code snippets or error messages</li>
              <li>🎯 Be specific — avoid vague questions</li>
              <li>🏷️ Add tags to help others find your question</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ask-page { padding: 40px 0; max-width: 960px; margin: 0 auto; }
    .ask-header { margin-bottom: 32px; }
    .back-link { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; display: block; margin-bottom: 16px; }
    .back-link:hover { color: var(--accent); }
    .ask-header h1 { margin-bottom: 4px; }
    .ask-layout { display: grid; grid-template-columns: 1fr 300px; gap: 28px; }
    .ask-form-wrap { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .optional { color: var(--text-muted); font-weight: 400; font-size: 0.8rem; }
    .hint { color: var(--text-muted); font-size: 0.78rem; margin-top: 4px; display: block; }
    .field-error { color: var(--danger); font-size: 0.78rem; margin-top: 4px; display: block; }
    .ask-tips {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 24px; height: fit-content; position: sticky; top: 80px;
    }
    .ask-tips h3 { font-family: var(--font-body); font-size: 0.95rem; font-weight: 600; margin-bottom: 16px; color: var(--text-secondary); }
    .ask-tips ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .ask-tips li { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }
    @media (max-width: 768px) { .ask-layout { grid-template-columns: 1fr; } .ask-tips { display: none; } }
  `]
})
export class AskQuestionComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(private fb: FormBuilder, private questionService: QuestionService, private router: Router) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(15)]],
      body: ['', Validators.required],
      tags: ['']
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;

    this.questionService.create(this.form.value).subscribe({
      next: (res) => this.router.navigate(['/questions', res.questionId]),
      error: (err) => { this.error = err.error?.message || 'Failed to post question.'; this.loading = false; }
    });
  }
}
