import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { declareBookLost } from "../declareBookLost.use-case";
import { registerLoan } from "../registerLoan.use-case";
import { LibraryCollection } from "../../repositories/libraryCollection.repository";
import { LoanRegister } from "../../repositories/loanRegister.repository";
import { addCopyToCatalog } from "./helpers";

afterEach(() => {
  vi.useRealTimers();
});

describe("Given a copy is in the catalog, available to lend, with no open loan on it", () => {
  let collection: LibraryCollection;
  let loanRegister: LoanRegister;
  let bookId: string;
  const patronId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-05-10T10:00:00.000Z"));
    collection = new LibraryCollection();
    loanRegister = new LoanRegister();
    bookId = await addCopyToCatalog(collection, { isbn: "978-4444444444" });
  });

  describe("When I register a loan for that copy and patron", () => {
    let outcome: Awaited<ReturnType<typeof registerLoan>>;

    beforeEach(async () => {
      outcome = await registerLoan(
        { bookId, memberId: patronId },
        { libraryCollection: collection, loanRegister },
      );
    });

    it("Then the loan is recorded with the right copy and patron and expected dates", () => {
      expect(outcome.isOk()).toBe(true);
      if (outcome.isOk()) {
        expect(outcome.value.bookId).toBe(bookId);
        expect(outcome.value.memberId).toBe(patronId);
        expect(outcome.value.loanDate).toBe("2025-05-10T10:00:00.000Z");
        expect(outcome.value.returnedAt).toBeNull();
        const due = new Date("2025-05-10T10:00:00.000Z");
        due.setUTCDate(due.getUTCDate() + 21);
        expect(outcome.value.dueDate).toBe(due.toISOString());
      }
    });
  });
});

describe("Given the catalog does not contain the copy id I want to lend", () => {
  let collection: LibraryCollection;
  let loanRegister: LoanRegister;

  beforeEach(() => {
    collection = new LibraryCollection();
    loanRegister = new LoanRegister();
  });

  describe("When I try to register a loan for that id", () => {
    const missingBookId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";
    let outcome: Awaited<ReturnType<typeof registerLoan>>;

    beforeEach(async () => {
      outcome = await registerLoan(
        { bookId: missingBookId, memberId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
        { libraryCollection: collection, loanRegister },
      );
    });

    it("Then the use case reports that the book was not found", () => {
      expect(outcome.isErr()).toBe(true);
      if (outcome.isErr()) {
        expect(outcome.error.name).toBe("BOOK_NOT_FOUND");
      }
    });
  });
});

describe("Given a copy is marked lost in the catalog", () => {
  let collection: LibraryCollection;
  let loanRegister: LoanRegister;
  let bookId: string;

  beforeEach(async () => {
    collection = new LibraryCollection();
    loanRegister = new LoanRegister();
    bookId = await addCopyToCatalog(collection, { isbn: "978-5555555555" });
    await declareBookLost({ bookId }, { libraryCollection: collection });
  });

  describe("When I try to register a loan on that copy", () => {
    let outcome: Awaited<ReturnType<typeof registerLoan>>;

    beforeEach(async () => {
      outcome = await registerLoan(
        { bookId, memberId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
        { libraryCollection: collection, loanRegister },
      );
    });

    it("Then the use case refuses because a lost copy cannot go out on loan", () => {
      expect(outcome.isErr()).toBe(true);
      if (outcome.isErr()) {
        expect(outcome.error.name).toBe("BOOK_LOST_CANNOT_BE_LOANED");
      }
    });
  });
});

describe("Given a copy already has an open loan in the register", () => {
  let collection: LibraryCollection;
  let loanRegister: LoanRegister;
  let bookId: string;
  const patronId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-07-01T12:00:00.000Z"));
    collection = new LibraryCollection();
    loanRegister = new LoanRegister();
    bookId = await addCopyToCatalog(collection, { isbn: "978-6666666666" });
    const first = await registerLoan(
      { bookId, memberId: patronId },
      { libraryCollection: collection, loanRegister },
    );
    expect(first.isOk()).toBe(true);
    vi.useRealTimers();
  });

  describe("When I try to register a second loan on the same copy", () => {
    let outcome: Awaited<ReturnType<typeof registerLoan>>;

    beforeEach(async () => {
      outcome = await registerLoan(
        { bookId, memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" },
        { libraryCollection: collection, loanRegister },
      );
    });

    it("Then the use case refuses because the copy is already on loan", () => {
      expect(outcome.isErr()).toBe(true);
      if (outcome.isErr()) {
        expect(outcome.error.name).toBe("BOOK_ALREADY_ON_LOAN");
      }
    });
  });
});
