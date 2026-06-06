import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './summary.html',
  styleUrls: ['./summary.css']
})
export class Summary implements OnInit, OnDestroy {

  summary: string = '';        // original English
  displaySummary: string = ''; // shown to user (translated or original)
  loading = false;
  copied = false;
  elapsedTime = 0;
  isSpeaking = false;

  // 🌍 Translation
  selectedLang = 'en';
  translating = false;

  private timerInterval: any;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const savedSummary = localStorage.getItem('summary');
    if (savedSummary) {
      this.summary = savedSummary;
      this.displaySummary = savedSummary;
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const paperId = localStorage.getItem('paperId');
    if (!paperId) {
      this.summary = 'No paper uploaded yet. Please upload a PDF first.';
      this.displaySummary = this.summary;
      return;
    }

    this.loading = true;
    this.startTimer();
    this.callApi(paperId);
  }

  ngOnDestroy() {
    this.stopTimer();
    window.speechSynthesis.cancel();
  }

  callApi(paperId: string) {
    this.api.generateSummary(paperId).subscribe({
      next: (res: any) => {
        this.stopTimer();

        const fill = document.querySelector('.progress-fill') as HTMLElement;
        if (fill) {
          fill.style.animation = 'none';
          fill.style.transition = 'width 0.3s ease';
          fill.style.width = '100%';
        }

        setTimeout(() => {
          this.summary = res.summary;
          this.displaySummary = res.summary;
          localStorage.setItem('summary', this.summary);
          localStorage.setItem('stat_time_summary', Date.now().toString());
          this.loading = false;
          this.cdr.detectChanges();
        }, 350);
      },
      error: (err) => {
        console.error('❌ Summary error:', err);
        this.stopTimer();
        this.loading = false;
        this.summary = 'Failed to generate summary. Please try again.';
        this.displaySummary = this.summary;
        this.cdr.detectChanges();
      }
    });
  }

  // 🌍 TRANSLATE
  async translateSummary() {
    if (this.selectedLang === 'en') {
      this.displaySummary = this.summary;
      this.cdr.detectChanges();
      return;
    }

    this.translating = true;
    this.cdr.detectChanges();

    try {
      // MyMemory free API — no key needed
      // Split into chunks of 500 chars to avoid limit
      const chunks = this.chunkText(this.summary, 500);
      const translated: string[] = [];

      for (const chunk of chunks) {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${this.selectedLang}`;
        const res = await fetch(url);
        const data = await res.json();
        translated.push(data.responseData.translatedText);
      }

      this.displaySummary = translated.join(' ');
    } catch (err) {
      console.error('Translation error:', err);
      this.displaySummary = this.summary; // fallback to original
    }

    this.translating = false;
    this.cdr.detectChanges();
  }

  // Split long text into chunks
  chunkText(text: string, size: number): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + size));
      i += size;
    }
    return chunks;
  }

  // 🔊 TTS
  toggleSpeak() {
    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    } else {
      const utterance = new SpeechSynthesisUtterance(this.displaySummary);
      utterance.onend = () => {
        this.isSpeaking = false;
        this.cdr.detectChanges();
      };
      window.speechSynthesis.speak(utterance);
      this.isSpeaking = true;
    }
    this.cdr.detectChanges();
  }

  startTimer() {
    this.elapsedTime = 0;
    this.timerInterval = setInterval(() => {
      this.elapsedTime++;
      this.cdr.detectChanges();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  copySummary() {
    navigator.clipboard.writeText(this.displaySummary);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }
}