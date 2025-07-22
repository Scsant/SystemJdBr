import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar se já está autenticado
    this.authService.getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        if (authState.session && !authState.loading) {
          this.router.navigate(['/dashboard']);
        }
        this.loading = authState.loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.signIn(this.email, this.password);
      
      if (!result.success) {
        this.errorMessage = result.error || 'Erro no login';
        this.loading = false;
      }
      // Se sucesso, o redirecionamento será feito automaticamente pelo AuthService
    } catch (error) {
      this.errorMessage = 'Erro inesperado. Tente novamente.';
      this.loading = false;
    }
  }
}
