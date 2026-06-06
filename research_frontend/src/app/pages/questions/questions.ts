import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questions.html',
  styleUrls: ['./questions.css']
})
export class Questions implements OnInit {

  questions: string[] = [];
  loading: boolean = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const savedQuestions = localStorage.getItem('questions');

    if (savedQuestions) {
  const parsed: string[] = JSON.parse(savedQuestions);

  this.questions = parsed
    .filter((q: string) => {
      const trimmed = q.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.toLowerCase().startsWith('here are') &&
        !trimmed.toLowerCase().includes('no research paper') &&
        !trimmed.toLowerCase().includes('please provide') &&
        !trimmed.toLowerCase().includes('based on the provided')
      );
    })
    .map((q: string) =>
      q.replace(/^[\s]*(\d+[\.\)]|Q\d+[\.\)])\s*/i, '').trim()
    );

  this.cdr.detectChanges();
  return;
}

    const paperId = localStorage.getItem('paperId');
    if (paperId) {
      this.loadQuestions(paperId);
    }
  }

  loadQuestions(paperId: string) {
    this.loading = true;
    this.cdr.detectChanges(); // ✅ show loader immediately

    this.api.getQuestions(paperId).subscribe({
    next: (res: any) => {
  let rawQuestions: string[] = res.questions;

  // If first element looks like an intro sentence, remove it
  rawQuestions = rawQuestions.filter((q: string) => {
    const trimmed = q.trim();
    return (
      trimmed.length > 0 &&
      !trimmed.toLowerCase().startsWith('here are') &&
      !trimmed.toLowerCase().includes('no research paper') &&
      !trimmed.toLowerCase().includes('please provide') &&
      !trimmed.toLowerCase().includes('based on the provided')
    );
  });

  // Strip leading numbering like "1.", "2.", "Q1.", etc.
  this.questions = rawQuestions.map((q: string) =>
    q.replace(/^[\s]*(\d+[\.\)]|Q\d+[\.\)])\s*/i, '').trim()
  );

  localStorage.setItem('questions', JSON.stringify(this.questions));
  localStorage.setItem('stat_time_questions', Date.now().toString());
  this.loading = false;
  this.cdr.detectChanges();
},
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.cdr.detectChanges(); // ✅ force update
      }
    });
  }
}