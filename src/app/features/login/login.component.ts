import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onLogin(): void {
    if (this.email && this.password) {
      // Aqui poderia chamar um SupabaseService.login(email, password)
      console.log('Autenticando...');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Preencha os campos!');
    }
  }
}
