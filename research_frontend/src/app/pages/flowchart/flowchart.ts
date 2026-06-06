import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-flowchart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flowchart.html',
  styleUrls: ['./flowchart.css']
})
export class Flowchart implements OnInit {

  loading: boolean = false;
  copied: boolean = false;
  paperId: string = '';
  hasPaper: boolean = false;
  flowchartData: string = '';
  flowchartSteps: string[] = [];

  @ViewChild('flowchartBox') flowchartBox!: ElementRef;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.paperId = localStorage.getItem('paperId') || '';
    this.hasPaper = !!this.paperId;

    const savedFlowchart = localStorage.getItem('flowchart');
    if (savedFlowchart) {
      this.flowchartData = savedFlowchart;
      this.flowchartSteps = this.parseSteps(savedFlowchart);
      this.cdr.detectChanges();
    } else if (this.paperId) {
      this.generateFlowchart(this.paperId);
    }
  }

  // 🔧 PARSE TEXT INTO STEPS ARRAY
  parseSteps(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line !== '→' && line !== '↓');
  }

  // 🧠 GENERATE FLOWCHART
  generateFlowchart(paperId: string): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.api.generateFlowchart(paperId).subscribe({
      next: (res: any) => {
        if (res.flowchart) {
          this.flowchartData = res.flowchart;
          this.flowchartSteps = this.parseSteps(res.flowchart);
          localStorage.setItem('flowchart', this.flowchartData);
          localStorage.setItem('stat_time_flowchart', Date.now().toString());
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 📋 COPY FLOWCHART
  copyFlowchart(): void {
    navigator.clipboard.writeText(this.flowchartData);
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  // 📸 DOWNLOAD FLOWCHART IMAGE
  downloadFlowchart(): void {
    const element = this.flowchartBox.nativeElement;
    html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#081426',
      scale: 2
    }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'flowchart.png';
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }, 'image/png');
    });
  }
}