import { InMemoryRepository } from "ontologic";

import { Book, BookEvent } from "../entities/book";

export class LibraryCollection extends InMemoryRepository<Book, BookEvent> {
  constructor() {
    super(Book.fromState);
  }
}
