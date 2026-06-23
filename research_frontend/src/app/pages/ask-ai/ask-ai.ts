import { Component, OnInit, AfterViewChecked, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-ask-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ask-ai.html',
  styleUrls: ['./ask-ai.css']
})
export class AskAi implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {

  @ViewChild('chatBottom') chatBottom!: ElementRef;
  @ViewChild('threadCanvas') threadCanvasRef!: ElementRef<HTMLCanvasElement>;

  userQuestion: string = '';
  chats: any[] = [];
  loading: boolean = false;
  paperId: string = '';
  hasPaper: boolean = false;
  typingText: string = '';

  private animationId!: number;
  private resizeHandler = () => this.resizeCanvas();

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.paperId = localStorage.getItem('paperId') || '';
    this.hasPaper = !!this.paperId;

    const savedChats = localStorage.getItem('askAIChats');
    const savedChatPaperId = localStorage.getItem('askAIChatPaperId');

    if (savedChats && savedChatPaperId === this.paperId) {
      this.chats = JSON.parse(savedChats);
    } else {
      this.chats = [];
      localStorage.removeItem('askAIChats');
    }

    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.initThreadBackground();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeHandler);
    window.speechSynthesis.cancel();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      if (this.chatBottom) {
        this.chatBottom.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {}
  }

  private resizeCanvas(): void {
    const canvas = this.threadCanvasRef?.nativeElement;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  private initThreadBackground(): void {

const canvas=this.threadCanvasRef.nativeElement;
const ctx=canvas.getContext('2d')!;

this.resizeCanvas();

let particles =
Array.from({length:80},()=>({
 x:Math.random()*canvas.width,
 y:Math.random()*canvas.height,
 r:Math.random()*2+1,
 speed:Math.random()*0.5
}));

let t=0;


const draw=()=>{

ctx.clearRect(0,0,canvas.width,canvas.height);


particles.forEach(p=>{

p.y-=p.speed;

if(p.y<0)
p.y=canvas.height;


ctx.beginPath();

ctx.arc(
p.x,
p.y,
p.r,
0,
Math.PI*2
);


ctx.fillStyle=
"rgba(22, 145, 164, 0.5)";

ctx.fill();


});


t++;

this.animationId=requestAnimationFrame(draw);

}

draw();

}

  askAI(): void {
    if (!this.userQuestion.trim() || this.loading || !this.hasPaper) return;

    const question = this.userQuestion.trim();
    this.chats.push({ question, answer: '', loading: true });
    this.userQuestion = '';
    this.loading = true;
    this.cdr.detectChanges();

    this.api.askAI(question, this.paperId).subscribe({
      next: (res: any) => {
        const last = this.chats[this.chats.length - 1];
        last.answer = res.answer;
        last.loading = false;
        this.loading = false;

        localStorage.setItem('askAIChats', JSON.stringify(this.chats));
        localStorage.setItem('stat_time_askai', Date.now().toString());
        localStorage.setItem('askAIChatPaperId', this.paperId);
        this.cdr.detectChanges();
      },
      error: () => {
        const last = this.chats[this.chats.length - 1];
        last.answer = '❌ Failed to get answer. Please try again.';
        last.loading = false;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearChat() {
    this.chats = [];
    localStorage.removeItem('askAIChats');
    localStorage.removeItem('askAIChatPaperId');
    this.cdr.detectChanges();
  }

  toggleSpeak(chat: any) {
    if (chat.speaking) {
      window.speechSynthesis.cancel();
      chat.speaking = false;
    } else {
      this.chats.forEach(c => c.speaking = false);
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(chat.answer);
      utterance.onend = () => {
        chat.speaking = false;
        this.cdr.detectChanges();
      };
      window.speechSynthesis.speak(utterance);
      chat.speaking = true;
    }
    this.cdr.detectChanges();
  }
}