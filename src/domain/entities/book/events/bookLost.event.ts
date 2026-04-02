import { DomainEvent } from "ontologic";

export interface BookLostPayload {
  bookId: string;
}

export class BookLostEvent extends DomainEvent<
  "BOOK_LOST",
  1,
  BookLostPayload
> {
  constructor(entityId: string) {
    super({
      name: "BOOK_LOST",
      version: 1,
      entityId,
      payload: {
        bookId: entityId,
      },
    });
  }
}
