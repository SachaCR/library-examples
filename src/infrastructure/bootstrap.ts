import { z } from "zod";
import {
  DomainEventBusListener,
  DomainEventBusPublisher,
  InMemoryConnectors,
  switchGuard,
} from "ontologic";

import { LibraryCollection } from "../domain/repositories/libraryCollection.repository";
import { LoanRegister } from "../domain/repositories/loanRegister.repository";
import { buildMessageRelay } from "./messageRelay";
import { BookCreatedEvent, BookLostEvent } from "../domain/entities/book";
import { LoanCreatedEvent, LoanReturnedEvent } from "../domain/entities/loan";

export async function bootstrap() {
  const eventBusConnectors = new InMemoryConnectors();

  const publisher = new DomainEventBusPublisher({
    publisherConnector: eventBusConnectors.publisher,
  });

  const listener = new DomainEventBusListener({
    listenerConnector: eventBusConnectors.listener,
    options: {
      validator: (event: unknown) => {
        const namedObjectSchema = z.object({
          name: z.enum([
            "BOOK_LOST",
            "BOOK_CREATED",
            "LOAN_CREATED",
            "LOAN_RETURNED",
          ]),
        });

        const namedObject = namedObjectSchema.parse(event);

        switch (namedObject.name) {
          case "BOOK_CREATED":
            return BookCreatedEvent.validate(namedObject);

          case "BOOK_LOST":
            return BookLostEvent.validate(namedObject);

          case "LOAN_CREATED":
            return LoanCreatedEvent.validate(namedObject);

          case "LOAN_RETURNED":
            return LoanReturnedEvent.validate(namedObject);

          default:
            switchGuard(namedObject.name);
        }
      },
    },
  });

  const libraryCollection = new LibraryCollection();
  const loanRegister = new LoanRegister();

  // Message Relay: listen to new event and publish them
  libraryCollection.onChanges(
    buildMessageRelay(libraryCollection, loanRegister, publisher),
  );

  return {
    loanRegister,
    libraryCollection,
    publisher,
    listener,
  };
}
