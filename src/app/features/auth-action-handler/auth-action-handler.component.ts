import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-action-handler',
  imports: [],
  templateUrl: './auth-action-handler.component.html',
  styleUrl: './auth-action-handler.component.scss'
})
export class AuthActionHandlerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      const oobCode = params['oobCode'];

      if (!mode || !oobCode) {
        this.router.navigate(['/']);
        return;
      }

      if (mode === 'resetPassword') {
        this.router.navigate(['pass-new'], { queryParams: { oobCode } });
      } else if (mode === 'verifyEmail') {
        this.router.navigate(['verify-email'], { queryParams: { oobCode } });
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}
