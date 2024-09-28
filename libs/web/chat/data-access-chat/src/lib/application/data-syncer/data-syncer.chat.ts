import { Injectable, inject } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { MessageSend } from '../../models/message-send.type';
import { ReceivedMessage } from '../../models/message.type';
import { NetworkService } from '../../util-network/network.service';


// Data Syncer: Module that contains the database and also manages the outgoing messages.
// Also receives updates from the server and updates the database accordingly.
// Client-side Database: Database to store all the data needed to be shown in the UI.
// Message Scheduler: Monitors the outgoing messages, schedules them for sending and manages their statuses.

@Injectable()
export class DataSyncer {
  readonly sendMessage$ = new Subject<MessageSend>();

  private messageReceived$$ = new Subject<ReceivedMessage>();
  readonly messageReceived$: Observable<ReceivedMessage> = this.messageReceived$$.asObservable();

  private readonly queue$$ = new BehaviorSubject<MessageSend[]>([]);
  readonly queue$: Observable<MessageSend[]> = this.queue$$.asObservable();

  private readonly networkService = inject(NetworkService);

  constructor() {
    this.initializeNetworkListener();
  }

  addMessageToClientDb(message: MessageSend): void {
    if(!this.networkService.isOnline()) {
      this.queue$$.next([...this.queue$$.value, message]);
      console.log(this.queue$$.value);
    }
  }

  notifyMessageReceived(message: ReceivedMessage): void {
    this.messageReceived$$.next(message);
  }

  private syncMessages(): void {
    if (!this.networkService.isOnline()) {
      return;
    }
  }

  private initializeNetworkListener(): void {
    this.networkService.getOnlineStatus().subscribe((isOnline) => {
      if (isOnline) {
        this.syncMessages();
      }
    });
  }
}
