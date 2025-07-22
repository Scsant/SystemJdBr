import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interface simulada para User
interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

// Interface simulada para Session
interface MockSession {
  access_token: string;
  refresh_token: string;
  user: MockUser;
  expires_at: number;
}

export interface AuthState {
  user: MockUser | null;
  session: MockSession | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    session: null,
    loading: false
  });

  private MOCK_USER: MockUser = {
    id: 'mock-user-123',
    email: 'admin@agro-telematics.com',
    user_metadata: {
      full_name: 'Administrador Sistema'
    }
  };

  private MOCK_SESSION: MockSession = {
    access_token: 'mock-token-123',
    refresh_token: 'mock-refresh-123',
    user: this.MOCK_USER,
    expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };

  constructor(private router: Router) {
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    try {
      const savedSession = localStorage.getItem('mock-auth-session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.expires_at > Date.now()) {
          this.updateAuthState({
            user: session.user,
            session: session,
            loading: false
          });
        } else {
          localStorage.removeItem('mock-auth-session');
        }
      }
    } catch (error) {
      console.warn('Erro ao verificar sessão existente:', error);
    }
  }

  private updateAuthState(newState: Partial<AuthState>): void {
    const currentState = this.authState.value;
    this.authState.next({ ...currentState, ...newState });
  }

  getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  get isAuthenticated(): boolean {
    return !!this.authState.value.session;
  }

  get currentUser(): MockUser | null {
    return this.authState.value.user;
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.updateAuthState({ loading: true });

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar credenciais mockadas
      if (email === 'admin@agro-telematics.com' && password === 'admin123') {
        // Salvar sessão no localStorage
        localStorage.setItem('mock-auth-session', JSON.stringify(this.MOCK_SESSION));
        
        this.updateAuthState({
          user: this.MOCK_USER,
          session: this.MOCK_SESSION,
          loading: false
        });

        // Redirecionar para dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 100);

        return { success: true };
      } else {
        this.updateAuthState({ loading: false });
        return { 
          success: false, 
          error: 'Credenciais inválidas. Use: admin@agro-telematics.com / admin123' 
        };
      }
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { success: false, error: 'Erro inesperado durante o login' };
    }
  }

  async signOut(): Promise<void> {
    try {
      this.updateAuthState({ loading: true });
      
      // Remover sessão do localStorage
      localStorage.removeItem('mock-auth-session');
      
      this.updateAuthState({
        user: null,
        session: null,
        loading: false
      });

      // Redirecionar para login
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      this.updateAuthState({ loading: false });
    }
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.updateAuthState({ loading: true });

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Para demonstração, aceitar qualquer email/senha válidos
      if (email && password && email.includes('@') && password.length >= 6) {
        this.updateAuthState({ loading: false });
        return { 
          success: true 
        };
      } else {
        this.updateAuthState({ loading: false });
        return { 
          success: false, 
          error: 'Email deve conter @ e senha deve ter pelo menos 6 caracteres' 
        };
      }
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { success: false, error: 'Erro inesperado durante o registro' };
    }
  }
}
