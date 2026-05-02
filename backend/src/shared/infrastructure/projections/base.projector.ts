import { START, streamNameFilter } from '@kurrent/kurrentdb-client';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { KurrentDBService } from 'src/shared/infrastructure/kurrentdb/kurrentdb.service';
import {
  KurrentDBSerializer,
  StorageEvent,
} from 'src/shared/infrastructure/kurrentdb/kurrentdb.serializer';

export abstract class BaseProjector<TDocument> implements OnModuleInit {
  protected readonly logger: Logger;

  protected constructor(
    loggerContext: string,
    private readonly kurrentDB: KurrentDBService,
    private readonly kurrentDBSerializer: KurrentDBSerializer,
    protected readonly model: Model<TDocument>,
  ) {
    this.logger = new Logger(loggerContext);
  }

  protected abstract streamName: string;

  onModuleInit(): void {
    this.logger.log(
      `Starting projector ${this.constructor.name} (stream ${this.streamName})`,
    );
    void this.startSubscription().catch((error) => {
      this.logger.error('Error starting subscription to KurrentDB', error);
    });
  }

  protected async handle(event: StorageEvent): Promise<void> {
    this.logger.debug(
      `Handling event ${event.type} for aggregate ${event.metadata.aggregateId}`,
    );
    await this.model.findOneAndUpdate(
      { id: event.metadata.aggregateId },
      {
        $setOnInsert: {
          ...event.data,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  private async startSubscription(): Promise<void> {
    try {
      const client = this.kurrentDB.getClient();
      this.logger.debug(
        `Subscribing to stream ${this.streamName} from the beginning`,
      );

      const subscription = client.subscribeToAll({
        fromPosition: START,
        filter: streamNameFilter({ prefixes: [this.streamName] }),
      });

      this.logger.debug(
        `Subscription created for ${this.streamName}, waiting for events...`,
      );

      for await (const resolvedEvent of subscription) {
        this.logger.debug(
          `Subscription received resolvedEvent: ${JSON.stringify({ eventType: resolvedEvent.event?.type, streamId: resolvedEvent.event?.streamId })}`,
        );

        if (!resolvedEvent.event) {
          this.logger.debug('Skipping resolvedEvent with no event');
          continue;
        }

        const storageEvent =
          this.kurrentDBSerializer.toStorageEvent(resolvedEvent);
        this.logger.log(
          `Received event ${storageEvent.type} for aggregate ${storageEvent.metadata.aggregateId}`,
        );
        try {
          await this.handle(storageEvent);
          this.logger.debug(
            `Successfully handled event ${storageEvent.type} for aggregate ${storageEvent.metadata.aggregateId}`,
          );
        } catch (error) {
          this.logger.error('Error dispatching event:', error);
        }
      }
    } catch (error) {
      this.logger.error(
        `Fatal error in startSubscription for ${this.streamName}:`,
        error,
      );
    }
  }
}
