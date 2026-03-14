import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-header">
          <span class="auth-icon">&#9651;</span>
          <h1>Welcome back</h1>
          <p class="text-muted">Sign in to DoConnect</p>
        </div>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" class="form-control"
              [class.is-invalid]="submitted && f['email'].errors"
              placeholder="you&#64;example.com">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" class="form-control"
              [class.is-invalid]="submitted && f['password'].errors"
              placeholder="••••••••">
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            <span *ngIf="loading">Signing in...</span>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>

        <p class="auth-footer">
          No account? <a routerLink="/register">Create one</a>
        </p>

        <div class="demo-hint">
          <strong>Demo Admin:</strong> admin&#64;doconnect.com / test1234
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 40px 20px;
      background: radial-gradient(ellipse at 60% 20%, rgba(108,142,255,0.06) 0%, transparent 60%);
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
    .demo-hint {
      margin-top: 20px; padding: 12px; border-radius: var(--radius-sm);
      background: var(--accent-glow); border: 1px solid rgba(108,142,255,0.2);
      font-size: 0.8rem; color: var(--text-secondary); text-align: center;
    }
    .demo-hint strong { color: var(--accent); }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;

    this.loading = true;
    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.router.navigate(res.role === 'Admin' ? ['/admin'] : ['/questions']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
