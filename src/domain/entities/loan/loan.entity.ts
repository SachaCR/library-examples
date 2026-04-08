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

export interface LoanState {
  bookId: string;
  memberId: string;
  loanDate: string;
  dueDate: string;
  returnedAt: string | null;
}

export class Loan extends DomainEntity<LoanState> {
  private constructor(id: string, state: LoanState) {
    super(id, state, [dueDateAfterLoanDate, returnDateAfterLoanDate]);
  }

  static fromState(id: string, state: LoanState) {
    return new Loan(id, state);
  }

  static create(params: { bookId: string; memberId: string }): {
    loan: Loan;
    event: LoanCreatedEvent;
  } {
    const { bookId, memberId } = params;

    const loanDate = new Date();
    const { dueDate } = Loan.calculateDueDate(loanDate);

    const id = randomUUID();

    const state: LoanState = {
      bookId,
      memberId,
      loanDate: loanDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returnedAt: null,
    };

    const event = new LoanCreatedEvent(id, {
      bookId,
      memberId,
      loanDate: loanDate.toISOString(),
      dueDate: dueDate.toISOString(),
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

  static calculateDueDate(startDate: Date): { dueDate: Date } {
    const dueDate = new Date(startDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + STANDARD_LOAN_LENGTH_DAYS);
    return { dueDate };
  }
}

/** Lending policy: calendar days from loan start until the copy is due back. */
const STANDARD_LOAN_LENGTH_DAYS = 21;

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