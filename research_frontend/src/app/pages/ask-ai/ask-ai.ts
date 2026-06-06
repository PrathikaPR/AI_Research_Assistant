import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
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
export class AskAi implements OnInit, AfterViewChecked {

  @ViewChild('chatBottom') chatBottom!: ElementRef;

  userQuestion: string = '';
  chats: any[] = [];
  loading: boolean = false;
  paperId: string = '';
  hasPaper: boolean = false;
  typingText: string = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

ngOnInit() {
  this.paperId = localStorage.getItem('paperId') || '';
  this.hasPaper = !!this.paperId;

  // ✅ Only restore chats if same paperId
  const savedChats = localStorage.getItem('askAIChats');
  const savedChatPaperId = localStorage.getItem('askAIChatPaperId');

  if (savedChats && savedChatPaperId === this.paperId) {
    this.chats = JSON.parse(savedChats);
  } else {
    // ✅ Different paper or new session — clear old chats
    this.chats = [];
    localStorage.removeItem('askAIChats');
  }

  this.cdr.detectChanges();
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

        // ✅ Save chat + paperId together
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
    // stop any other speaking chat first
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