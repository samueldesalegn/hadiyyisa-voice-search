export interface Word {
  PK: string;
  SK: string;
  word: string;
  normalized_word: string;

  meaning_en?: string;
  meaning_am?: string;

  example_sentence_hadiyya?: string;
  example_sentence_en?: string;
  example_sentence_am?: string;

  created_at?: string;
  updated_at?: string;
}