import { DomainEventBusPublisher, EventWithMetadata } from "ontologic";
import { LibraryCollection } from "../domain/repositories/libraryCollection.repository";
import { BookEvent } from "../domain/entities/book";
import { LoanRegister } from "../domain/repositories/loanRegister.repository";
import { LoanEvent } from "../domain/entities/loan";

// Message Relay
export function buildMessageRelay(
  libraryCollection: LibraryCollection,
  loanRegister: LoanRegister,
  publisher: DomainEventBusPublisher<BookEvent | LoanEvent>,
) {
  return async function messageRelay(entityId: string, entityName: string) {
    // TODO: lock this entityId / entityName

    try {
      let eventsToPublish: EventWithMetadata<BookEvent | LoanEvent>[];

      switch (entityName) {
        case "BOOK":
          const lastBookEventIdIHavePublished = ""; // TODO: await getLastEventID(entityId, entityName)

          const resultBook = await libraryCollection.getEventsAfter(
            entityId,
            lastBookEventIdIHavePublished,
          );

          if (resultBook.isErr()) {
            throw resultBook.error;
          }

          eventsToPublish = resultBook.value;
          break;

        case "LOAN":
          const lastEventIdIHavePublished = ""; // TODO: await getLastEventID(entityId, entityName)

          const result = await loanRegister.getEventsAfter(
            entityId,
            lastEventIdIHavePublished,
          );

          if (result.isErr()) {
            throw result.error;
          }

          eventsToPublish = result.value;
          break;

        default:
          throw new Error("UNKNOWN ENTITY TYPE");
      }

      for (let i = 0; i < eventsToPublish.length; i++) {
        const { event, metadata } = eventsToPublish[i];
        await publisher.publish(event, metadata);

        // TODO: await updateLastEventPublished(eventId, entityId, entityName);
      }
    } finally {
      // TODO: remove lock entityId / entityName
    }
  };
}
