import { Component } from '@angular/core';
import { HeaderSearchBarComponent } from '../../core/header/header-search-bar/header-search-bar.component';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderSearchBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
