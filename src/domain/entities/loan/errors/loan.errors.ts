import { DomainError } from "ontologic";

export class LoanNotFoundError extends DomainError<
  "LOAN_NOT_FOUND",
  { loanId: string }
> {
  constructor(loanId: string) {
    super({
      name: "LOAN_NOT_FOUND",
      message: "No loan exists with this identifier in the loan register",
      context: { loanId },
    });
  }
}
