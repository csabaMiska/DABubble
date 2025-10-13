import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [],
  templateUrl: './app-sign-up.html',
  styleUrl: './app-sign-up.scss'
})
export class AppSignUp {
  private router = inject(Router);

  navigateTo(page: 'sign-up'): void {
    this.router.navigate([page]);
  }
}
