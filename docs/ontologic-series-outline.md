# Step-by-step Ontologic guide — series outline

This document expands [the learning path in README.md](../README.md#step-by-step-ontologic-guide) with titles, prerequisites, repository anchors, and suggested exercises. Open that section for the index table with **published** URLs. Use it when writing or reviewing each article.

Conventions:

- **Prerequisite** references the previous article number (readers should follow order within each Part).
- **Repo anchors** are paths relative to the repository root.

---

## Part A — Orientation

### Article 1 — From the librarian’s problem to entities and rules

| Field | Content |
| --- | --- |
| **One-sentence promise** | Follow a small library digitizing a paper register; discover use cases, business rules, entity candidates, and invariants from the story—then see where `src/domain` and Ontologic fit. |
| **Prerequisite** | None. |
| **Repo anchors** | [README.md](../README.md), [`src/domain/`](../src/domain/), [`registerLoan.use-case.ts`](../src/domain/use-cases/registerLoan.use-case.ts) |
| **Try it** | Retell the problem in three bullets; map checks in `registerLoan` to librarian language (see draft). |
| **Full draft** | [articles/01-bounded-context-and-ontologic.md](articles/01-bounded-context-and-ontologic.md) |

---

### Article 2 — Folder boundaries: domain, application, infrastructure

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will see why domain code stays free of Nest (or any web framework) and where wiring belongs. |
| **Prerequisite** | After Article 1, you can name the main entities and rules from the library story and why they live in `src/domain`. |
| **Repo anchors** | [`src/domain/`](../src/domain/) (no framework imports), [`src/presentation/api/`](../src/presentation/api/) (Nest), [`src/infrastructure/bootstrap.ts`](../src/infrastructure/bootstrap.ts) (composition) |
| **Try it** | Grep `from "@nestjs` under `src/domain/` — expect zero matches. |

---

## Part B — Core building blocks

### Article 3 — `DomainEntity`, state, `create` vs `fromState`

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will distinguish construction that applies domain rules (`create`) from rehydration (`fromState`). |
| **Prerequisite** | After Article 2, you accept that entities live under `src/domain/entities/`. |
| **Repo anchors** | [`src/domain/entities/book/book.entity.ts`](../src/domain/entities/book/book.entity.ts), [`src/domain/entities/loan/loan.entity.ts`](../src/domain/entities/loan/loan.entity.ts) |
| **Try it** | Trace one `Book.create` call from a use case to the persisted entity id. |

---

### Article 4 — Invariants inside the entity

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will understand how Ontologic invariants enforce rules whenever state is set or updated. |
| **Prerequisite** | After Article 3, you can point to `readState()` and a static `create` on `Loan`. |
| **Repo anchors** | [`src/domain/entities/loan/loan.entity.ts`](../src/domain/entities/loan/loan.entity.ts) (`dueDateAfterLoanDate`, `returnDateAfterLoanDate`, `loanDateNotInFuture`) |
| **Try it** | Add a failing test that violates an invariant and observe `Result`/`err` from a mutating method. |

---

### Article 5 — `DomainEvent`: one class per fact, stable `name`

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will model facts as events with a stable discriminator and typed payload. |
| **Prerequisite** | After Article 3, you know where `Book` and `Loan` live. |
| **Repo anchors** | [`src/domain/entities/book/events/`](../src/domain/entities/book/events/), [`src/domain/entities/loan/events/`](../src/domain/entities/loan/events/), `BookEvent` / `LoanEvent` unions in entity `index` files |
| **Try it** | List every `name` string used by book and loan events and match them to bootstrap’s Zod enum in [`bootstrap.ts`](../src/infrastructure/bootstrap.ts). |

---

### Article 6 — `DomainError`: typed errors with `name` and `context`

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will represent business failures as values with a stable `name` for mapping at the edge. |
| **Prerequisite** | After Article 5, you see events as named facts; errors are named failures. |
| **Repo anchors** | [`src/domain/entities/book/errors/book.errors.ts`](../src/domain/entities/book/errors/book.errors.ts), [`src/domain/entities/loan/errors/loan.errors.ts`](../src/domain/entities/loan/errors/loan.errors.ts) |
| **Try it** | Map `BOOK_NOT_FOUND` to the HTTP layer by reading [`result-to-http.ts`](../src/presentation/api/library/result-to-http.ts). |

---

### Article 7 — `Result`, `ok`, and `err` in use cases

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will write and read use cases as pipelines that return `Result` instead of throwing for business outcomes. |
| **Prerequisite** | After Article 6, you know domain errors are ordinary `Error` subclasses with `name`. |
| **Repo anchors** | [`src/domain/use-cases/addBook.use-case.ts`](../src/domain/use-cases/addBook.use-case.ts), [`src/domain/use-cases/searchBooks.use-case.ts`](../src/domain/use-cases/searchBooks.use-case.ts) |
| **Try it** | Sketch the same flow with try/catch and list why `Result` is preferable for composability. |

---

## Part C — Persistence and orchestration

### Article 8 — `InMemoryRepository`: `saveWithEvents` and the store

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will see how aggregates and their events are persisted together in the demo in-memory implementation. |
| **Prerequisite** | After Article 7, you can follow a use case to `saveWithEvents`. |
| **Repo anchors** | [`src/domain/repositories/libraryCollection.repository.ts`](../src/domain/repositories/libraryCollection.repository.ts), [`src/domain/repositories/loanRegister.repository.ts`](../src/domain/repositories/loanRegister.repository.ts) |
| **Try it** | Log `getEvents` for a book id after `addBook` and count stored events. |

---

### Article 9 — Custom repository behaviour: search and lookups

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will add query methods on the repository without pushing catalogue or loan-register rules into entities. |
| **Prerequisite** | After Article 8, you know `this.store` holds aggregate state. |
| **Repo anchors** | `searchBook` in [`libraryCollection.repository.ts`](../src/domain/repositories/libraryCollection.repository.ts); `findOutstandingLoanForBook`, `findActiveLoansForMember` in [`loanRegister.repository.ts`](../src/domain/repositories/loanRegister.repository.ts) |
| **Try it** | Describe in one sentence why `searchBook` returns `[]` when both title and author criteria are empty. |

---

### Article 10 — Orchestrating multiple rules in one use case

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will order checks and keep policy in the use case when several aggregates and rules interact. |
| **Prerequisite** | After Articles 7–9, you are comfortable with `Result` chaining and repository helpers. |
| **Repo anchors** | [`src/domain/use-cases/registerLoan.use-case.ts`](../src/domain/use-cases/registerLoan.use-case.ts), [`src/domain/use-cases/listOutstandingLoansForMember.use-case.ts`](../src/domain/use-cases/listOutstandingLoansForMember.use-case.ts) |
| **Try it** | Document the exact order of checks in `registerLoan` and justify swapping two adjacent steps (or explain why you must not). |

---

## Part D — Delivery and side effects

### Article 11 — Application layer: NestJS as a thin shell

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will map HTTP to use cases and translate `Result` to status codes without domain imports in controllers beyond the service. |
| **Prerequisite** | After Article 7, you understand `Result`; after Article 6, error `name` values. |
| **Repo anchors** | [`src/presentation/api/library/library.service.ts`](../src/presentation/api/library/library.service.ts), [`src/presentation/api/library/library.module.ts`](../src/presentation/api/library/library.module.ts), [`src/presentation/api/library/result-to-http.ts`](../src/presentation/api/library/result-to-http.ts), e.g. [`controllers/add-book.controller.ts`](../src/presentation/api/library/controllers/add-book.controller.ts) |
| **Try it** | Add a new domain error `name` and wire it to `409` in `result-to-http.ts` without changing the use case return type. |

---

### Article 12 — Infrastructure: domain events and the event bus

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will follow domain events from commit-time publication to optional subscribers (validation, side effects). |
| **Prerequisite** | After Article 5 (events) and Article 8 (persistence publishes events via repository). |
| **Repo anchors** | [`src/infrastructure/bootstrap.ts`](../src/infrastructure/bootstrap.ts), [`src/infrastructure/messageRelay.ts`](../src/infrastructure/messageRelay.ts) |
| **Try it** | Subscribe a `console.log` handler in bootstrap for one event name and trigger it via an API call. |

---

## Part E — Closing the loop

### Article 13 — Tests as living documentation

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will test behaviour through use cases and in-memory repositories, mirroring how the domain is meant to be used. |
| **Prerequisite** | After Articles 7–10, you know the main use cases. |
| **Repo anchors** | [`src/domain/use-cases/__tests__/`](../src/domain/use-cases/__tests__/), [`vitest.config.ts`](../vitest.config.ts) |
| **Try it** | Copy the structure of an existing `describe` block and add one new assertion to an existing scenario. |

---

### Article 14 — What to add next

| Field | Content |
| --- | --- |
| **One-sentence promise** | You will have a checklist for growing this example toward production (storage, consistency, read models). |
| **Prerequisite** | After Articles 1–13, you have walked the full stack once. |
| **Repo anchors** | Entire repo as baseline; no single file. |
| **Try it** | Pick one item (e.g. PostgreSQL adapter) and outline interfaces you would add without coding them. |

---

## Deliverable template (each published article)

Copy into your blog or static site:

1. **Title + one-sentence promise**
2. **Prerequisite** (“After article N…”)
3. **Concept** (2–4 short paragraphs)
4. **Where in library-examples** (links to files or this outline)
5. **Try it** (one hands-on step)

When a post is published externally, add its URL to [README.md](../README.md#step-by-step-ontologic-guide).
