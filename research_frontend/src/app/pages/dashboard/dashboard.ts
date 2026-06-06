import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { fontFamily } from 'html2canvas/dist/types/css/property-descriptors/font-family';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  hasPaper = false;
  uploadedFileName = '';
  activities: any[] = [];

  // 📜 History Panel
  historyOpen = false;
  historyLoading = false;
  papers: any[] = [];

  // 📄 Detail Panel
  detailOpen = false;
  selectedPaper: any = null;
  activeTab = 'summary';

  detailTabs = [
    { key: 'summary',   icon: '🧠', label: 'Summary'  },
    { key: 'questions', icon: '❓', label: 'Questions' },
    { key: 'chats',     icon: '💬', label: 'Ask-AI'    },
    { key: 'flowchart', icon: '📊', label: 'Flowchart' }
  ];

features = [
  {
    icon: '📄',
    title: 'Upload Any PDF',
    desc: 'Upload any document — research papers, books, reports, lecture notes and more.',
    route: '/upload',
    color: '#ebeff0',
    titleColor: '#ffffff',
    descColor: '#d1d5db',
    fontFamily: 'monospace',
    titleSize: '1.5rem',
    descSize: '1rem'
  },
  {
    icon: '🧠',
    title: 'AI Summary',
    desc: 'Get instant AI-powered summaries tailored to your document type.',
    route: '/summary',
    color: '#a78bfa',
    titleColor: '#ffffff',
    descColor: '#d1d5db',
    fontFamily: 'monospace',
    titleSize: '1.5rem',
    descSize: '1rem'
  },
  {
    icon: '❓',
    title: 'Ask AI',
    desc: 'Ask anything — about your document or general knowledge.',
    route: '/ask-ai',
    color: '#ffffff',
    descColor: '#d1d5db',
    fontFamily: 'monospace',
    titleSize: '1.5rem',
    descSize: '1rem'
  },
  {
    icon: '📊',
    title: 'Flowchart Visualizer',
    desc: 'Convert your document into a clean visual step-by-step flowchart.',
    route: '/flowchart',
    color: '#fb923c',
    titleColor: '#ffffff',
    descColor: '#d1d5db',
    fontFamily: 'monospace',
    titleSize: '1.5rem',
    descSize: '1rem'
  }
];
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.hasPaper = !!localStorage.getItem('paperId');
    this.uploadedFileName = localStorage.getItem('uploadedFileName') || '';
    this.activities = this.buildTimeline();
    this.cdr.detectChanges();
  }

  toggleHistory() {
    if (this.historyOpen) {
      this.closeAll();
    } else {
      this.historyOpen = true;
      this.loadHistory();
    }
  }

  closeHistory() {
    this.historyOpen = false;
    this.detailOpen = false;
    this.selectedPaper = null;
  }

  closeDetail() {
    this.detailOpen = false;
    this.selectedPaper = null;
  }

  closeAll() {
    this.historyOpen = false;
    this.detailOpen = false;
    this.selectedPaper = null;
  }

  loadHistory() {
    this.historyLoading = true;
    this.cdr.detectChanges();

    this.api.getHistory().subscribe({
      next: (res: any) => {
        this.papers = res.papers || [];
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('History error:', err);
        this.historyLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deletePaper(paperId: string, event: Event) {
  event.stopPropagation(); // ← prevents opening the detail panel
  
  this.api.deletePaper(paperId).subscribe({
    next: () => {
      this.papers = this.papers.filter(p => p._id !== paperId);
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Delete error:', err)
  });
}

  selectPaper(paper: any) {
    this.selectedPaper = paper;
    this.activeTab = 'summary';
    this.detailOpen = true;
    this.cdr.detectChanges();
  }

  buildTimeline() {
    const defs = [
      { key: 'stat_time_upload',    icon: '📄', text: 'PDF Uploaded',        detail: localStorage.getItem('uploadedFileName') || 'A new document was uploaded', bg: 'rgba(133, 197, 225, 0.15)'  },
      { key: 'stat_time_summary',   icon: '🧠', text: 'Summary Generated',   detail: 'AI analyzed and summarized the document',                                  bg: 'rgba(167,139,250,0.15)' },
      { key: 'stat_time_questions', icon: '❓', text: 'Questions Generated', detail: 'AI suggested questions from the document',                                  bg: 'rgba(52,211,153,0.15)'  },
      { key: 'stat_time_flowchart', icon: '📊', text: 'Flowchart Created',   detail: 'Document converted into a visual flowchart',                                bg: 'rgba(251,146,60,0.15)'  },
      { key: 'stat_time_askai',     icon: '💬', text: 'Asked AI',            detail: 'A question was asked to the AI assistant',                                  bg: 'rgba(244,114,182,0.15)' }
    ];

    return defs
      .filter(d => !!localStorage.getItem(d.key))
      .map(d => ({
        ...d,
        time: this.timeAgo(parseInt(localStorage.getItem(d.key)!))
      }))
      .reverse();
  }

  timeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  
}