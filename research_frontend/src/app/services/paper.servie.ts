import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PaperService {

  // =========================
  // BASE URL
  // =========================
private baseUrl = 'https://research-assistant-node.onrender.com/api/papers';

  // =========================
  // UPLOAD PDF
  // =========================
  async uploadPaper(file: File) {

    const formData = new FormData();
    formData.append('paper', file);

    try {

      const res = await axios.post(
        `${this.baseUrl}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return res.data;

    } catch (err: any) {

      console.error('Upload Error:', err);
      throw err;
    }
  }

  // =========================
  // GET ALL PAPERS
  // =========================
  async getAllPapers() {

    try {

      const res = await axios.get(
        `${this.baseUrl}/`
      );

      return res.data;

    } catch (err) {

      console.error('Fetch Error:', err);
      throw err;
    }
  }

  // =========================
  // SEARCH PAPERS
  // =========================
  async searchPapers(query: string) {

    try {

      const res = await axios.post(
        `${this.baseUrl}/search`,
        { query }
      );

      return res.data;

    } catch (err) {

      console.error('Search Error:', err);
      throw err;
    }
  }

  // =========================
  // 🚀 NEXT APIs (WE WILL USE SOON)
  // =========================

  async getSummary(docId: string) {
    return axios.post(`${this.baseUrl}/summary`, { docId });
  }

  async getAskAI(docId: string, question: string) {
    return axios.post(`${this.baseUrl}/ask`, { docId, question });
  }

  async getFlowchart(docId: string) {
    return axios.post(`${this.baseUrl}/flowchart`, { docId });
  }

  async getSuggestions(docId: string) {
    return axios.post(`${this.baseUrl}/suggest`, { docId });
  }
}