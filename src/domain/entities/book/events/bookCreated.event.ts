import { DomainEvent } from "ontologic";

export interface BookCreatedPayload {
  title: string;
  author: string;
  isbn: string;
  category: string;
  tags: string[];
  lost: boolean;
}

export class BookCreatedEvent extends DomainEvent<
  "BOOK_CREATED",
  1,
  BookCreatedPayload
> {
  constructor(entityId: string, payload: BookCreatedPayload) {
    super({ name: "BOOK_CREATED", version: 1, entityId, payload });
  }
}
