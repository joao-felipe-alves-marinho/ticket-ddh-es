import {
  AppendStreamState,
  AppendResult,
  JSONEventData,
  KurrentDBClient,
  NO_STREAM,
  ReadRevision,
  ResolvedEvent,
  StreamNotFoundError,
  StreamState,
  WrongExpectedVersionError,
} from '@kurrent/kurrentdb-client';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ExceptionBase } from 'src/shared/common/exceptions';
import { Result } from 'src/shared/common/result';
import {
  StreamNotFoundException,
  WrongExpectedVersionException,
} from './kurrentdb.exception';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/shared/config';

export interface IKurrentClient {
  appendToStream(
    streamName: string,
    events: JSONEventData[],
    expectedRevision?: AppendStreamState,
  ): Promise<Result<bigint, ExceptionBase>>;
  readStream(
    streamName: string,
    fromRevision: ReadRevision,
  ): Promise<Result<ResolvedEvent[], ExceptionBase>>;
}

@Injectable()
export class KurrentDBService implements IKurrentClient, OnModuleDestroy {
  private client!: KurrentDBClient;

  constructor(private readonly configService: ConfigService<AppConfig>) {}

  onModuleInit(): void {
    const connectionString =
      process.env.KURRENTDB_CONNECTION_STRING ||
      'esdb://admin:changeit@localhost:2113?tls=false';

    this.client = KurrentDBClient.connectionString(connectionString);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.dispose();
  }

  async appendToStream(
    streamName: string,
    events: JSONEventData[],
    expectedRevision?: StreamState,
  ): Promise<Result<bigint, ExceptionBase>> {
    try {
      if (events.length === 0) {
        return Result.success(0n);
      }

      const result: AppendResult = await this.client.appendToStream(
        streamName,
        events,
        {
          streamState: expectedRevision ?? NO_STREAM,
        },
      );
      return Result.success(result.nextExpectedRevision);
    } catch (error) {
      if (error instanceof WrongExpectedVersionError) {
        return Result.failure(new WrongExpectedVersionException(error));
      }
      throw error;
    }
  }

  async readStream(
    streamName: string,
    fromRevision?: ReadRevision,
  ): Promise<Result<ResolvedEvent[], ExceptionBase>> {
    try {
      const events: ResolvedEvent[] = [];

      const result = this.client.readStream(streamName, {
        fromRevision: fromRevision ?? 'start',
      });

      for await (const resolvedEvent of result) {
        if (!resolvedEvent) continue;
        events.push(resolvedEvent);
      }

      return Result.success(events);
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        return Result.failure(new StreamNotFoundException(error));
      }
      throw error;
    }
  }

  getClient(): KurrentDBClient {
    return this.client;
  }
}
