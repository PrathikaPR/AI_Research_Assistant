import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  Renderer2,
   ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, AfterViewInit, OnDestroy {

  loginForm!: FormGroup;
  isLoading = false;
  lampOn = false;
  errorMessage = '';

  private dragging = false;
  private startY = 0;
  private pullDistance = 0;
  private onMouseMove!: (e: MouseEvent) => void;
  private onMouseUp!: (e: MouseEvent) => void;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {}

  // ── LIFECYCLE ────────────────────────────────────────────────

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit(): void {
    this.generateParticles();
    this.setupChainDrag();
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  // ── LAMP TOGGLE ──────────────────────────────────────────────

  toggleLamp(): void {
    this.lampOn = !this.lampOn;

    const lampWrap   = this.el.nativeElement.querySelector('#lampWrap')   as HTMLElement;
    const glowBg     = this.el.nativeElement.querySelector('#lampGlowBg') as HTMLElement;
    const particles  = this.el.nativeElement.querySelector('#particles')  as HTMLElement;
    const roomFloor  = this.el.nativeElement.querySelector('#roomFloor')  as HTMLElement;
    const loginCard  = this.el.nativeElement.querySelector('#loginCard')  as HTMLElement;
    const shadeMain  = this.el.nativeElement.querySelector('#shadeMain');
    const statusText = this.el.nativeElement.querySelector('#statusText') as HTMLElement;
    const statusIcon = this.el.nativeElement.querySelector('#statusIcon') as HTMLElement;
    const statusDot  = this.el.nativeElement.querySelector('.status-dot') as HTMLElement;

    if (this.lampOn) {
      // Lamp ON
      this.renderer.addClass(lampWrap, 'lamp-on');
      this.renderer.addClass(loginCard, 'lamp-on-state');
      this.renderer.setStyle(glowBg, 'opacity', '1');
      this.renderer.setStyle(particles, 'opacity', '1');
      this.renderer.setStyle(roomFloor, 'opacity', '1');
      shadeMain?.setAttribute('fill', 'url(#shadeOn)');
      statusText.textContent = 'Lamp: ON';
      statusIcon.textContent = '☀️';
      this.renderer.setStyle(statusDot, 'background', '#E8B84B');
      this.renderer.setStyle(statusDot, 'box-shadow', '0 0 6px #E8B84B');
    } else {
      // Lamp OFF
      this.renderer.removeClass(lampWrap, 'lamp-on');
      this.renderer.removeClass(loginCard, 'lamp-on-state');
      this.renderer.setStyle(glowBg, 'opacity', '0');
      this.renderer.setStyle(particles, 'opacity', '0');
      this.renderer.setStyle(roomFloor, 'opacity', '0');
      shadeMain?.setAttribute('fill', 'url(#shadeOff)');
      statusText.textContent = 'Lamp: OFF';
      statusIcon.textContent = '🌙';
      this.renderer.setStyle(statusDot, 'background', '#7a6e5c');
      this.renderer.setStyle(statusDot, 'box-shadow', 'none');
    }
  }

  // ── FORM SUBMIT ──────────────────────────────────────────────

onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = ''; // ← clear previous error

  const { email, password } = this.loginForm.value;

  this.authService.login({ email, password }).subscribe({
    next: (res: any) => {
      this.isLoading = false;

      if (res?.success) {
        this.authService.saveToken(res.token, res.user);
        this.router.navigate(['/dashboard']); // 
      } else {
        this.errorMessage = res?.message || 'Invalid credentials!'; 
        this.cdr.detectChanges();
      }
    },

    error: (err: any) => {
      this.isLoading = false;
      this.errorMessage = err.error?.message || 'Invalid email or password!'; 
      this.cdr.detectChanges();
    }
  });
}

  // ── SOCIAL LOGIN ─────────────────────────────────────────────

loginWithGoogle(): void {
  this.isLoading = true;

  setTimeout(() => {
    this.isLoading = false;
    alert('Redirecting to Google...');
  }, 800);
}

  loginWithGithub(): void {
    window.location.href = 'http://localhost:3000/auth/github';
  }

  // ── PARTICLES ────────────────────────────────────────────────

  private generateParticles(): void {
    const container = this.el.nativeElement.querySelector('#particles');
    if (!container) return;

    for (let i = 0; i < 22; i++) {
      const p = this.renderer.createElement('div');
      this.renderer.addClass(p, 'particle');
      const left   = 30 + Math.random() * 40;
      const bottom = 30 + Math.random() * 20;
      const delay  = Math.random() * 5;
      const dur    = 3 + Math.random() * 3;
      const dx     = (Math.random() - 0.5) * 60;
      p.setAttribute(
        'style',
        `left:${left}%;bottom:${bottom}%;animation-delay:${delay}s;animation-duration:${dur}s;--dx:${dx}px;`
      );
      this.renderer.appendChild(container, p);
    }
  }

  // ── CHAIN DRAG ───────────────────────────────────────────────

  private setupChainDrag(): void {
    const chainBall = this.el.nativeElement.querySelector('#chainBall') as SVGCircleElement | null;
    const chainLine = this.el.nativeElement.querySelector('#chainLine') as SVGLineElement | null;
    const pullChain = this.el.nativeElement.querySelector('#pullChain') as SVGGElement | null;

    if (!chainBall || !chainLine || !pullChain) return;

    chainBall.addEventListener('mousedown', (e: MouseEvent) => {
      this.dragging = true;
      this.startY = e.clientY;
      chainBall.style.cursor = 'grabbing';
    });

    this.onMouseMove = (e: MouseEvent) => {
      if (!this.dragging) return;
      this.pullDistance = Math.min(50, Math.max(0, e.clientY - this.startY));
      chainLine.setAttribute('y2', String(240 + this.pullDistance));
      chainBall.setAttribute('cy', String(243 + this.pullDistance));
      const bend = this.pullDistance * 0.15;
      pullChain.style.transform = `translateX(${bend}px) rotate(${bend}deg)`;
    };

    this.onMouseUp = () => {
      if (!this.dragging) return;
      this.dragging = false;
      chainBall.style.cursor = 'grab';
      chainLine.setAttribute('y2', '240');
      chainBall.setAttribute('cy', '243');
      pullChain.style.transition = 'transform 0.2s ease';
      pullChain.style.transform = 'translateY(0px)';
      if (this.pullDistance >= 20) this.toggleLamp();
      this.pullDistance = 0;
    };

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }
}