import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {

baseUrl = 'https://research-assistant-node.onrender.com/api/papers';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  uploadPaper(formData: FormData) {
    return this.http.post(`${this.baseUrl}/upload`, formData, { headers: this.getHeaders() });
  }

  generateSummary(paperId: string) {
    return this.http.post(`${this.baseUrl}/summary`, { paperId }, { headers: this.getHeaders() });
  }

  askAI(question: string, paperId: string) {
    return this.http.post(`${this.baseUrl}/ask`, { question, paperId }, { headers: this.getHeaders() });
  }

  getQuestions(paperId: string) {
    return this.http.post(`${this.baseUrl}/suggest`, { paperId }, { headers: this.getHeaders() });
  }

  generateFlowchart(paperId: string) {
    return this.http.post(`${this.baseUrl}/flowchart`, { paperId }, { headers: this.getHeaders() });
  }

  getHistory() {
    return this.http.get(`${this.baseUrl}/history`, { headers: this.getHeaders() });
  }

  deletePaper(paperId: string) {
    return this.http.delete(`${this.baseUrl}/${paperId}`, { headers: this.getHeaders() });
  }
}