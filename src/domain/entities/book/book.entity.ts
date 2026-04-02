import { randomUUID } from "node:crypto";
import { DomainEntity } from "ontologic";
import { BookCreatedEvent } from "./events/bookCreated.event";
import { BookLostEvent } from "./events/bookLost.event";

export type BookEvent = BookLostEvent | BookCreatedEvent;

export interface BookState {
  title: string;
  author: string;
  isbn: string;
  category: string;
  tags: string[];
  lost: boolean;
}

export class Book extends DomainEntity<BookState> {
  private constructor(id: string, state: BookState) {
    super(id, state);
  }

  static fromState(id: string, state: BookState) {
    return new Book(id, state);
  }

  static create(state: Omit<BookState, "lost">): {
    book: Book;
    event: BookCreatedEvent;
  } {
    const id = randomUUID();

    const event = new BookCreatedEvent(id, {
      ...state,
      lost: false,
    });

    return {
      event,
      book: new Book(id, { ...state, lost: false }),
    };
  }

  declareLost(): BookLostEvent {
    this.state.lost = true;
    return new BookLostEvent(this.id());
  }
}
