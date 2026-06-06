import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements AfterViewInit {

  nameInput!: HTMLInputElement;
  emailInput!: HTMLInputElement;
  passInput!: HTMLInputElement;
  confirmInput!: HTMLInputElement;

  lid!: HTMLElement;
  card!: HTMLElement;
  vaultPaper!: HTMLElement;
  constructor(private authService: AuthService) {}

  ngAfterViewInit(): void {

    this.nameInput = document.getElementById('name') as HTMLInputElement;
    this.emailInput = document.getElementById('email') as HTMLInputElement;
    this.passInput = document.getElementById('password') as HTMLInputElement;
    this.confirmInput = document.getElementById('confirm') as HTMLInputElement;

    this.lid = document.getElementById('lid') as HTMLElement;
    this.card = document.getElementById('card') as HTMLElement;
    this.vaultPaper = document.getElementById('vaultPaper') as HTMLElement;

    /* ---------- LID CLICK ---------- */
    this.lid.addEventListener('click', () => {

      this.lid.style.transform = 'translateX(-50%) rotate(-45deg) translateY(-70px)';
      this.lid.style.transformOrigin = 'left center';

      this.card.style.opacity = '1';
      this.card.style.transform = 'translateX(0)';
      this.card.style.pointerEvents = 'all';

      this.vaultPaper.classList.add('visible');
    });

    /* ---------- LIVE INPUT ---------- */
    this.nameInput.addEventListener('input', () => {
      (document.getElementById('nameView') as HTMLElement).textContent =
        this.nameInput.value || '—';
    });

    this.emailInput.addEventListener('input', () => {
      (document.getElementById('emailView') as HTMLElement).textContent =
        this.emailInput.value || '—';
    });

    this.passInput.addEventListener('input', () => {
      (document.getElementById('passView') as HTMLElement).textContent =
        this.passInput.value.length ? '●'.repeat(this.passInput.value.length) : '—';

      this.checkPassword();
    });

    this.confirmInput.addEventListener('input', () => {
      (document.getElementById('confirmView') as HTMLElement).textContent =
        this.confirmInput.value.length ? '●'.repeat(this.confirmInput.value.length) : '—';

      this.validateConfirm();
    });

    /* ---------- REGISTER BUTTON ---------- */
document.getElementById('registerBtn')?.addEventListener('click', () => {

  const validPassword = this.checkPassword();
  const validConfirm = this.validateConfirm();

  if (
    !this.nameInput.value.trim() ||
    !this.emailInput.value.trim() ||
    !validPassword ||
    !validConfirm
  ) {
    return;
  }

  const data = {
    name: this.nameInput.value,
    email: this.emailInput.value,
    password: this.passInput.value
  };

  this.authService.register(data).subscribe({
    next: (res: any) => {
      console.log("REGISTER SUCCESS:", res);

      // AFTER SUCCESS → run your UI animation
      this.registerSuccess();
    },
    error: (err: any) => {
      console.log("REGISTER FAILED:", err.error?.message || err.message);
    }
  });

});
  }

  /* ---------- SUCCESS FLOW ---------- */
  registerSuccess(): void {

    this.lid.style.top = '165px';
    this.lid.style.transform = 'translateX(-50%) rotate(0deg)';

    setTimeout(() => {
      (document.getElementById('nameView') as HTMLElement).textContent = '';
      (document.getElementById('emailView') as HTMLElement).textContent = '';
      (document.getElementById('passView') as HTMLElement).textContent = '';
      (document.getElementById('confirmView') as HTMLElement).textContent = '';
    }, 400);

    setTimeout(() => {
      this.vaultPaper.style.opacity = '0';
      this.vaultPaper.style.transform = 'scale(0.3)';
    }, 700);

    setTimeout(() => {

      const successBox = document.getElementById('jarSuccess') as HTMLElement;
      successBox.classList.add('show');

      (document.querySelector('.tick') as HTMLElement).style.animation =
        'popTick .8s ease forwards';

      (document.getElementById('greenRing') as HTMLElement).style.opacity = '1';

      const glow = document.getElementById('glow') as HTMLElement;
      glow.style.opacity = '1';
      glow.style.background =
        'radial-gradient(circle, rgba(0,255,100,.25), transparent 70%)';

    }, 1500);

    setTimeout(() => {
      (document.getElementById('success') as HTMLElement).style.opacity = '1';
    }, 2000);
  }

  /* ---------- VALIDATORS ---------- */
  checkPassword(): boolean {

    const password = this.passInput.value;
    const msg = document.getElementById('passwordStrength') as HTMLElement;

    const strongPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/;

    if (password.length === 0) {
      msg.innerHTML = '';
      return false;
    }

    if (!strongPattern.test(password)) {
      msg.className = 'validator warning';
      msg.innerHTML = '⚠ 8+ chars, uppercase, lowercase, number & special character';
      return false;
    }

    msg.className = 'validator success-msg';
    msg.innerHTML = '✓ Strong Password';
    return true;
  }

  validateConfirm(): boolean {

    const confirmMsg = document.getElementById('confirmMessage') as HTMLElement;

    if (this.confirmInput.value.length === 0) {
      confirmMsg.innerHTML = '';
      return false;
    }

    if (this.passInput.value !== this.confirmInput.value) {
      confirmMsg.className = 'validator error';
      confirmMsg.innerHTML = '✗ Passwords do not match';
      return false;
    }

    confirmMsg.className = 'validator success-msg';
    confirmMsg.innerHTML = '✓ Passwords match';
    return true;
  }
}