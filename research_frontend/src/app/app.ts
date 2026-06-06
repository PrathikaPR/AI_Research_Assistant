import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {

  isLoggedIn = false;
  userName = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoggedIn = this.auth.isLoggedIn();
        const user = this.auth.getUser();
        this.userName = user?.name || '';
      }
    });

    this.isLoggedIn = this.auth.isLoggedIn();
    const user = this.auth.getUser();
    this.userName = user?.name || '';
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
    this.userName = '';
  }
}