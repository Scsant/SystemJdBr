import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { supabase } from './supabase-simple'; // Usar cliente sem LockManager
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  private initialized = false;

  constructor(private router: Router) {
    // Limpar qualquer storage conflitante antes de inicializar
    this.clearConflictingStorage();
    this.initializeAuth();
  }

  private clearConflictingStorage(): void {
    try {
      // Limpar todos os storages relacionados ao Supabase que podem causar conflito
      const keysToRemove = [
        'sb-qktpnoekulrlporjoqqw-auth-token',
        'agro-telematics-auth-token',
        'agro-app-auth-token',
        'session-v3'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(`agro-app-${key}`);
      });
      
      console.log('Conflicting storage cleared');
    } catch (error) {
      console.warn('Error clearing storage:', error);
    }
  }

  private async initializeAuth(): Promise<void> {
    if (this.initialized) return;

    try {
      // Evitar múltiplas inicializações
      this.initialized = true;

      // Verificar sessão existente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Erro ao obter sessão:', error);
      }

      this.updateAuthState({
        user: session?.user || null,
        session: session,
        loading: false
      });

      // Escutar mudanças de autenticação
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        this.updateAuthState({
          user: session?.user || null,
          session: session,
          loading: false
        });

        // Redirecionamento baseado no estado
        if (event === 'SIGNED_IN' && session) {
          this.router.navigate(['/dashboard']);
        } else if (event === 'SIGNED_OUT') {
          this.router.navigate(['/login']);
        }
      });

    } catch (error) {
      console.error('Erro na inicialização da autenticação:', error);
      this.updateAuthState({
        user: null,
        session: null,
        loading: false
      });
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

  get currentUser(): User | null {
    return this.authState.value.user;
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.updateAuthState({ loading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.updateAuthState({ loading: false });
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { success: false, error: 'Erro inesperado durante o login' };
    }
  }

  async signOut(): Promise<void> {
    try {
      this.updateAuthState({ loading: true });
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      this.updateAuthState({ loading: false });
    }
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.updateAuthState({ loading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        this.updateAuthState({ loading: false });
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { success: false, error: 'Erro inesperado durante o registro' };
    }
  }
}
