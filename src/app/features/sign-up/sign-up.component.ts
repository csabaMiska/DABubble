import { Component, signal, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';
import { MatPseudoCheckboxModule } from '@angular/material/core';

@Component({
  selector: 'app-sign-up',
  imports: [MatSharedModule, ReactiveFormsModule, MatPseudoCheckboxModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  signUpFormCard!: FormGroup;
  hide = signal(true); // Signal für Passwortsichtbarkeit

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signUpFormCard = this.fb.group({
      confirmName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      agree: [false, [Validators.requiredTrue]],
    });
  }

  // Methode zum Umschalten der Passwortsichtbarkeit
  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
