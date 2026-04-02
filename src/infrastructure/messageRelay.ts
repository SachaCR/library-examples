import { DomainEventBusPublisher } from "ontologic";
import { LibraryCollection } from "../domain/repositories/libraryCollection.repository";
import { BookEvent } from "../domain/entities/book";

// Message Relay
export function buildMessageRelay(
  libraryCollection: LibraryCollection,
  publisher: DomainEventBusPublisher<BookEvent>,
) {
  return async function messageRelay(entityId: string) {
    // TODO: lock this entityId

    try {
      const lastEventIdIHavePublished = ""; // TODO: await getLastEventID(entityId)

      const result = await libraryCollection.getEventsAfter(
        entityId,
        lastEventIdIHavePublished,
      );

      if (result.isErr()) {
        throw result.error;
      }

      const eventToPublish = result.value;

      for (let i = 0; i < eventToPublish.length; i++) {
        const { event, metadata } = eventToPublish[i];
        await publisher.publish(event, metadata);

        // TODO: await updateLastEventPublished(eventId);
      }
    } finally {
      // TODO: remove lock
    }
  };
}
