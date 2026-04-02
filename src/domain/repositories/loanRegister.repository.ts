import { InMemoryRepository } from "ontologic";

import { Loan, LoanEvent } from "../entities/loan";

export class LoanRegister extends InMemoryRepository<Loan, LoanEvent> {
  constructor() {
    super(Loan.fromState);
  }
}
