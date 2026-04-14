import { z } from "zod";
import {
  DomainEventBusListener,
  DomainEventBusPublisher,
  InMemoryConnectors,
  MessageRelay,
  switchGuard,
  InMemoryMessageRelayStateRepository,
} from "ontologic";

import { LibraryCollection } from "../domain/repositories/libraryCollection.repository";
import { LoanRegister } from "../domain/repositories/loanRegister.repository";
import { BookCreatedEvent, BookLostEvent } from "../domain/entities/book";
import { LoanCreatedEvent, LoanReturnedEvent } from "../domain/entities/loan";

export async function bootstrapDependencies() {
  // DOMAIN EVENT BUS PUBLISHER
  const eventBusConnectors = new InMemoryConnectors();

  const eventPublisher = new DomainEventBusPublisher({
    publisherConnector: eventBusConnectors.publisher,
  });

  // DOMAIN REPOSITORY
  const libraryCollection = new LibraryCollection();
  const loanRegister = new LoanRegister();

  // MESSAGE RELAY
  const messageRelayRepository = new InMemoryMessageRelayStateRepository();

  const bookMessageRelay = new MessageRelay(
    libraryCollection,
    messageRelayRepository,
    "BOOK",
    eventPublisher,
  );

  const loanMessageRelay = new MessageRelay(
    loanRegister,
    messageRelayRepository,
    "LOAN",
    eventPublisher,
  );

  // WIRE THE MESSAGE RELAY
  libraryCollection.onChanges(bookMessageRelay.handler);
  loanRegister.onChanges(loanMessageRelay.handler);

  // DOMAIN EVENT BUS LISTENER
  const eventListener = new DomainEventBusListener({
    listenerConnector: eventBusConnectors.listener,
    options: {
      // This function should live somewhere else
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

  return {
    loanRegister,
    libraryCollection,
    eventListener,
  };
}
