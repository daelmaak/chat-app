import { Injectable, inject } from '@angular/core';
import { Subject, map, Observable } from 'rxjs';
import { ReceivedMessage } from '../models/message.type';
import { Conversation } from '../models/conversation.type';
import { MessageSend } from '../models/message-send.type';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '@chat-app/web/shared/util/auth';
import { io } from 'socket.io-client';
import { ConversationDetailsDto, ConversationDto, ReceiveMessageDto } from '@chat-app/dtos';
import { ENVIRONMENT } from '@chat-app/environment';
import { ROUTES_PARAMS, CHAT_ROUTES } from '@chat-app/util-routing';

//todo add readme pessimistic only

@Injectable({
  providedIn: 'root'
})
export class ChatInfrastructureService {
  readonly sendMessageSuccess$ = new Subject<ReceivedMessage>();
  readonly loadConversationListSuccess$ = new Subject<Conversation[]>();
  readonly loadConversationListPing$ = new Subject<boolean>();

  private readonly environment = inject(ENVIRONMENT);
  private readonly socket = io(this.environment.apiUrl, {
    query: { userId: inject(AuthService).user().id },
    transports: ['websocket'],
    withCredentials: true
  });
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  constructor() {
    this.setupSocketListeners();
  }

  getConversationContent(conversation: Conversation) {
    const headers = new HttpHeaders().set(
      'X-User-Id',
      this.authService.user().id
    );
    const params = new HttpParams()
      .set(ROUTES_PARAMS.USER_ID, this.authService.user().id)
      .set(ROUTES_PARAMS.CONVERSATION_ID, conversation.conversationId);

    return this.http
      .get<ConversationDetailsDto>(
        `${this.environment.apiUrl}${CHAT_ROUTES.CONVERSATION_DETAILS.GET}/${conversation.conversationId}`,
        { params, headers }
      )
      .pipe(
        map((convDetailsDto) => {
          return {
            conversationId: convDetailsDto.conversationId,
            messageList: convDetailsDto?.messageList.map((message) => {
              return {
                messageId: message.message_id,
                senderId: message.sender_id,
                content: message.content,
                createdAt: message.created_at
              };
            }),
            memberList: convDetailsDto.memberList.map((member) => {
              return {
                id: member.id,
                name: member.name,
                avatarUrl: member.profile_photo_url
              };
            })
          };
        })
      );
  }

  fetchConversations(): Observable<Conversation[]> {
    const headers = new HttpHeaders().set(
      'X-User-Id',
      this.authService.user().id
    );
    return this.http
      .get<ConversationDto[]>(`${this.environment.apiUrl}/chat/conversations`, {
        headers
      })
      .pipe(
        map((conversationDtoList: ConversationDto[]) => {
          return conversationDtoList.map((conversationDto: ConversationDto) => {
            console.log(conversationDto);
            return {
              ...conversationDto,
              active: true
            };
          });
        })
      );
  }

sendMessage(messageSend: MessageSend): void {
  console.log('halo');
    this.socket.emit('sendMessage', messageSend);
  }

  private setupSocketListeners(): void {
    this.socket.on('sendMessageSuccess', (message: ReceiveMessageDto) => {
      console.log('sendMessageSuccess', message);
        this.sendMessageSuccess$.next({
          conversationId: message.conversation_id,
          content: message.content,
          createdAt: message.created_at,
          messageId: message.message_id,
          senderId: message.sender_id
        });
      }
    );

    this.socket.on('loadConversationListSuccess', (x: any) => {
      console.log('xxxx', x);
      this.loadConversationListSuccess$.next(x);

    });
  }
}
