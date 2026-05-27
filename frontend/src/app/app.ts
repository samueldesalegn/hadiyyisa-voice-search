import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DictionaryService } from './services/dictionary.service';
import { Word } from './models/word.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private dictionaryService = inject(DictionaryService);

  searchTerm = signal('');
  results = signal<Word[]>([]);
  loading = signal(false);
  error = signal('');

  search() {
    const query = this.searchTerm().trim();

    if (!query) {
      this.error.set('Please enter a word to search.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.dictionaryService.search(query).subscribe({
      next: (response: any) => {
        this.results.set(response.results || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Search failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
