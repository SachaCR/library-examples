import { DomainEvent } from "ontologic";

export interface LoanCreatedPayload {
  bookId: string;
  memberId: string;
  loanDate: string;
  dueDate: string;
}

export class LoanCreatedEvent extends DomainEvent<
  "LOAN_CREATED",
  1,
  LoanCreatedPayload
> {
  constructor(entityId: string, payload: LoanCreatedPayload) {
    super({ name: "LOAN_CREATED", version: 1, entityId, payload });
  }
}
