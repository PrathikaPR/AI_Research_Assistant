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
    this.initStarField();
    this.initHexGrid();
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

  initStarField(): void {
  const canvas = document.getElementById('neural-bg') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const CX = canvas.width / 2;
  const CY = canvas.height / 2;

  const COLORS = [
    [255, 255, 255],   // white
    [180, 255, 180],   // fluorescent green
    [120, 255, 120],   // bright green
    [56, 189, 248],    // cyan blue
    [147, 233, 255],   // light blue
    [200, 255, 255],   // ice white-blue
    [52, 211, 153],    // teal green
    [255, 255, 220],   // warm white
  ];

  const stars: any[] = [];
  for (let i = 0; i < 380; i++) {   // ← dense count
    stars.push({
      x: (Math.random() - 0.5) * canvas.width * 3,
      y: (Math.random() - 0.5) * canvas.height * 3,
      z: Math.random() * canvas.width,
      pz: 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 3 + 2   // ← varied speed
    });
  }

  const draw = () => {
    ctx.fillStyle = 'rgba(2,8,24,0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.pz = s.z;
      s.z -= s.speed;

      if (s.z <= 0) {
        s.x = (Math.random() - 0.5) * canvas.width * 3;
        s.y = (Math.random() - 0.5) * canvas.height * 3;
        s.z = canvas.width;
        s.pz = canvas.width;
        s.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }

      const sx = CX + (s.x / s.z) * canvas.width * 0.5;
      const sy = CY + (s.y / s.z) * canvas.height * 0.5;
      const px = CX + (s.x / s.pz) * canvas.width * 0.5;
      const py = CY + (s.y / s.pz) * canvas.height * 0.5;

      const size = Math.max(0.4, (1 - s.z / canvas.width) * 3.2);
      const alpha = 1 - s.z / canvas.width;
      const [r, g, b] = s.color;

      // streak / trail
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.9})`;
      ctx.lineWidth = size;
      ctx.stroke();

      // glowing dot at head
      if (alpha > 0.6) {
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3);
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
}

initHexGrid(): void {
  const canvas = document.getElementById('neural-bg') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildHexes();
  });

  const size = 28;
  let hexes: any[] = [];

  const buildHexes = () => {
    hexes = [];
    const cols = Math.ceil(canvas.width / (size * 1.732)) + 2;
    const rows = Math.ceil(canvas.height / (size * 1.5)) + 2;

    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = col * size * 1.732 + (r % 2) * size * 0.866;
        const y = r * size * 1.5;
        hexes.push({
          x, y,
          phase: Math.random() * Math.PI * 2,
          speed: 0.015 + Math.random() * 0.025,
          color: [
            [56, 189, 248],    // cyan
            [52, 211, 153],    // teal green
            [180, 255, 180],   // fluorescent green
            [147, 233, 255],   // light blue
            [99, 102, 241],    // indigo
            [255, 255, 255],   // white
          ][Math.floor(Math.random() * 6)]
        });
      }
    }
  };

  buildHexes();

  const hexPath = (x: number, y: number, s: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 30);
      ctx.lineTo(x + s * Math.cos(a), y + s * Math.sin(a));
    }
    ctx.closePath();
  };

  const draw = () => {
    ctx.fillStyle = '#020818';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const h of hexes) {
      h.phase += h.speed;
      const v = Math.sin(h.phase) * 0.5 + 0.5;
      const [r, g, b] = h.color;

      // hex border
      hexPath(h.x, h.y, size - 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${v * 0.35 + 0.03})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // hex fill on bright phase
      if (v > 0.75) {
        hexPath(h.x, h.y, size - 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${(v - 0.75) * 0.08})`;
        ctx.fill();
      }

      // glowing center dot on peak
      if (v > 0.92) {
        const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, size * 0.25);
        grad.addColorStop(0, `rgba(${r},${g},${b},${(v - 0.92) * 1.2})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(h.x, h.y, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  };

  draw();
}
  
}