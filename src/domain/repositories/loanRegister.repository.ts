import { InMemoryRepository, Result, err, ok } from "ontologic";

import { Loan, LoanEvent } from "../entities/loan";

export class LoanRegister extends InMemoryRepository<Loan, LoanEvent> {
  constructor() {
    super(Loan.fromState);
  }

  async findOutstandingLoanForBook(
    bookId: string,
  ): Promise<Result<Loan | undefined, Error>> {
    const listResult = await this.list({ limit: 10_000, offset: 0 });

    if (listResult.isErr()) {
      return err(listResult.error);
    }

    const outstandingLoan = listResult.value.data.find((loan) => {
      const state = loan.readState();
      return state.bookId === bookId && state.returnedAt === null;
    });

    return ok(outstandingLoan);
  }
}
