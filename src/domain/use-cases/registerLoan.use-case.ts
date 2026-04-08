import { err, ok, Result } from "ontologic";
import { Loan, LoanState } from "../entities/loan";
import {
  BookAlreadyOnLoanError,
  BookLostCannotBeLoanedError,
  BookNotFoundError,
} from "../entities/book/errors/book.errors";
import { LibraryCollection } from "../repositories/libraryCollection.repository";
import { LoanRegister } from "../repositories/loanRegister.repository";

export async function registerLoan(
  lendingRequest: { bookId: string; memberId: string },
  dependencies: {
    libraryCollection: LibraryCollection;
    loanRegister: LoanRegister;
  },
): Promise<Result<LoanState, Error>> {
  const { bookId, memberId } = lendingRequest;
  const { libraryCollection, loanRegister } = dependencies;

  const bookLookup = await libraryCollection.getById(bookId);

  if (bookLookup.isErr()) {
    return err(bookLookup.error);
  }

  const book = bookLookup.value;

  if (book === undefined) {
    return err(new BookNotFoundError(bookId));
  }

  if (book.readState().lost) {
    return err(new BookLostCannotBeLoanedError(bookId));
  }

  const outstandingLookup =
    await loanRegister.findOutstandingLoanForBook(bookId);

  if (outstandingLookup.isErr()) {
    return err(outstandingLookup.error);
  }

  if (outstandingLookup.value !== undefined) {
    return err(new BookAlreadyOnLoanError(bookId));
  }

  const { loan, event } = Loan.create({ bookId, memberId });

  const persistence = await loanRegister.saveWithEvents(loan, event);

  if (persistence.isErr()) {
    return err(persistence.error);
  }

  return ok(loan.readState());
}
