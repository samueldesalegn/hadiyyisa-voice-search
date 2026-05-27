import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private http = inject(HttpClient);

  private apiUrl = 'https://ho2b9g758i.execute-api.us-east-1.amazonaws.com/Prod';

  search(query: string) {
    return this.http.get(`${this.apiUrl}/words/search?q=${encodeURIComponent(query)}`);
  }
}