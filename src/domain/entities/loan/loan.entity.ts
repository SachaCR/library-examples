import { randomUUID } from "crypto";

import {
  BaseDomainInvariant,
  DomainEntity,
  DomainError,
  Result,
  err,
  ok,
} from "ontologic";

import { LoanCreatedEvent } from "./events/loanCreated.event";
import { LoanReturnedEvent } from "./events/loanReturned.event";

export type LoanEvent = LoanCreatedEvent | LoanReturnedEvent;

interface LoanState {
  bookId: string;
  memberId: string;
  loanDate: string;
  dueDate: string;
  returnedAt: string | null;
}

const dueDateAfterLoanDate = new BaseDomainInvariant<LoanState>(
  "Due date must be after loan date",
  (state) => new Date(state.dueDate) > new Date(state.loanDate),
);

const returnDateAfterLoanDate = new BaseDomainInvariant<LoanState>(
  "Return date must be after loan date",
  (state) =>
    state.returnedAt === null ||
    new Date(state.returnedAt) >= new Date(state.loanDate),
);

export class LoanAlreadyReturnedError extends DomainError<
  "LOAN_ALREADY_RETURNED",
  { loanId: string }
> {
  constructor(loanId: string) {
    super({
      name: "LOAN_ALREADY_RETURNED",
      message: `Loan has already been returned`,
      context: { loanId },
    });
  }
}

export class Loan extends DomainEntity<LoanState> {
  private constructor(id: string, state: LoanState) {
    super(id, state, [dueDateAfterLoanDate, returnDateAfterLoanDate]);
  }

  static fromState(id: string, state: LoanState) {
    return new Loan(id, state);
  }

  static create(params: {
    bookId: string;
    memberId: string;
    loanDate: string;
    dueDate: string;
  }): { loan: Loan; event: LoanCreatedEvent } {
    const id = randomUUID();
    const state: LoanState = { ...params, returnedAt: null };

    const event = new LoanCreatedEvent(id, {
      bookId: params.bookId,
      memberId: params.memberId,
      loanDate: params.loanDate,
      dueDate: params.dueDate,
    });

    return {
      event,
      loan: new Loan(id, state),
    };
  }

  returnBook(
    returnedAt: string,
  ): Result<LoanReturnedEvent, LoanAlreadyReturnedError> {
    const state = this.readState();

    if (state.returnedAt !== null) {
      return err(new LoanAlreadyReturnedError(this.id()));
    }

    this.state = { ...state, returnedAt };

    const event = new LoanReturnedEvent(this.id(), {
      bookId: state.bookId,
      memberId: state.memberId,
      returnedAt,
    });

    return ok(event);
  }
}
