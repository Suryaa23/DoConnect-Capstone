import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-header">
          <span class="auth-icon">⬡</span>
          <h1>Join DoConnect</h1>
          <p class="text-muted">Create your account</p>
        </div>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input type="text" formControlName="username" class="form-control"
              [class.is-invalid]="submitted && f['username'].errors"
              placeholder="your_username">
            <small *ngIf="submitted && f['username'].errors?.['required']" class="field-error">Username is required</small>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" class="form-control"
              [class.is-invalid]="submitted && f['email'].errors"
              placeholder="you@example.com">
            <small *ngIf="submitted && f['email'].errors?.['email']" class="field-error">Enter a valid email</small>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" class="form-control"
              [class.is-invalid]="submitted && f['password'].errors"
              placeholder="Min. 6 characters">
            <small *ngIf="submitted && f['password'].errors?.['minlength']" class="field-error">Password must be at least 6 characters</small>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 40px 20px;
      background: radial-gradient(ellipse at 40% 70%, rgba(108,142,255,0.06) 0%, transparent 60%);
    }
    .auth-card {
      width: 100%; max-width: 420px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 16px; padding: 40px;
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-icon { font-size: 2.5rem; color: var(--accent); display: block; margin-bottom: 12px; }
    .auth-header h1 { font-size: 1.8rem; margin-bottom: 6px; }
    .btn.w-full { width: 100%; justify-content: center; padding: 13px; font-size: 1rem; margin-top: 8px; }
    .auth-footer { text-align: center; margin-top: 24px; color: var(--text-secondary); font-size: 0.9rem; }
    .auth-footer a { color: var(--accent); text-decoration: none; font-weight: 500; }
    .field-error { color: var(--danger); font-size: 0.78rem; margin-top: 4px; display: block; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed.';
        this.loading = false;
      }
    });
  }
}
