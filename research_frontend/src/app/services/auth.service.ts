import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

register(data: any) {
  return this.http.post(`${this.baseUrl}/register`, data);
}

login(data: any) {
  return this.http.post(`${this.baseUrl}/login`, data);
}

  saveToken(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        this.logout(); // ← auto logout if expired
        return false;
      }
      return true;
    } catch (e) {
      this.logout(); // ← invalid token, logout
      return false;
    }
}

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}