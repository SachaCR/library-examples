import {
  DomainEventBusListener,
  DomainEventBusPublisher,
  InMemoryConnectors,
} from "ontologic";

import { LibraryCollection } from "../domain/repositories/libraryCollection.repository";
import { LoanRegister } from "../domain/repositories/loanRegister.repository";
import { buildMessageRelay } from "./messageRelay";

export async function bootstrap() {
  const eventBusConnectors = new InMemoryConnectors();

  const publisher = new DomainEventBusPublisher({
    publisherConnector: eventBusConnectors.publisher,
  });

  const listener = new DomainEventBusListener({
    listenerConnector: eventBusConnectors.listener,
    options: {
      validator: () => {
        // TODO: zod schema
      },
    },
  });

  const libraryCollection = new LibraryCollection();
  const loanRegister = new LoanRegister();

  // Message Relay: listen to new event and publish them
  libraryCollection.onChanges(buildMessageRelay(libraryCollection, publisher));

  return {
    loanRegister,
    libraryCollection,
    publisher,
  };
}
