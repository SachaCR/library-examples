import { DomainEvent } from "ontologic";

export interface LoanReturnedPayload {
  bookId: string;
  memberId: string;
  returnedAt: string;
}

export class LoanReturnedEvent extends DomainEvent<
  "LOAN_RETURNED",
  1,
  LoanReturnedPayload
> {
  constructor(entityId: string, payload: LoanReturnedPayload) {
    super({ name: "LOAN_RETURNED", version: 1, entityId, payload });
  }
}
