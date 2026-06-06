import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {

  file!: File;
  loading = false;
  message = '';
  paperId = '';
  selectedFile: File | null = null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';

  private routerSub!: Subscription;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ Restore state from localStorage when returning to page
    const savedStatus = localStorage.getItem('uploadStatus');
    const savedFileName = localStorage.getItem('uploadedFileName');
    const savedPaperId = localStorage.getItem('paperId');

    if (savedStatus === 'success' && savedFileName && savedPaperId) {
      this.uploadStatus = 'success';
      this.paperId = savedPaperId;
      // ✅ Show the previously uploaded filename
      this.selectedFile = { name: savedFileName } as File;
      this.cdr.detectChanges();
    }

    // ✅ Only reset when user navigates TO upload fresh
    // (not when returning from summary/questions/etc.)
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: any) => {
        // ✅ Only reset if navigating AWAY from upload to a non-feature page
        // Do nothing — let localStorage handle persistence
      });
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.file = files[0];
    this.selectedFile = this.file;

    // ✅ Reset state only when user picks a NEW file
    this.uploadStatus = 'idle';
    this.message = '';
    this.loading = false;

    // ✅ Clear saved state for new upload
    localStorage.removeItem('uploadStatus');
    localStorage.removeItem('uploadedFileName');
    localStorage.removeItem('summary');
    localStorage.removeItem('questions');
    localStorage.removeItem('flowchart');
    localStorage.removeItem('askAIResponse');

    this.cdr.detectChanges();
  }

  upload() {
    if (!this.file) {
      this.message = 'Please select a PDF';
      return;
    }

    this.loading = true;
    this.uploadStatus = 'uploading';
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('paper', this.file);

    this.api.uploadPaper(formData).subscribe({
      next: (res: any) => {
        console.log('✅ SUCCESS:', res);

        this.paperId = res.paper.id;

        // ✅ Save to localStorage so it persists across navigation
        localStorage.setItem('paperId', this.paperId);
        localStorage.setItem('uploadStatus', 'success');
        localStorage.setItem('stat_time_upload', Date.now().toString());
        localStorage.setItem('uploadedFileName', this.file.name);

        this.loading = false;
        this.uploadStatus = 'success';
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('❌ ERROR:', err);
        this.loading = false;
        this.uploadStatus = 'error';
        this.message = err?.error?.message || 'Upload Failed. Try again.';

        localStorage.removeItem('uploadStatus');
        localStorage.removeItem('uploadedFileName');

        this.cdr.detectChanges();
      }
    });
  }
}