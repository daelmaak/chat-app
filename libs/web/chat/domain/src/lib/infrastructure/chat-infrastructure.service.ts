import { Injectable, inject } from '@angular/core';
import { Subject, map, Observable } from 'rxjs';
import { ReceivedMessage } from '../models/message.type';
import { Conversation } from '../models/conversation.type';
import { MessageSend } from '../models/message-send.type';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '@chat-app/web/shared/util/auth';
import { io } from 'socket.io-client';
import {
  ConversationDetailsDto,
  ConversationDto,
  SOCKET_COMMANDS,
  ReceiveMessageDto,
} from '@chat-app/dtos';
import { ENVIRONMENT } from '@chat-app/environment';
import { ROUTES_PARAMS, CHAT_ROUTES } from '@chat-app/util-routing';

@Injectable({
  providedIn: 'root',
})
export class ChatInfrastructureService {
  readonly receiveMessage$ = new Subject<ReceivedMessage>();
  private readonly environment = inject(ENVIRONMENT);
  private readonly socket = io(this.environment.apiUrl, {
    transports: ['websocket'],
    withCredentials: true,
  });
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  constructor() {
    this.setupSocketListeners();
  }

  getConversationContent(sc: Conversation) {
    const headers = new HttpHeaders().set(
      'X-User-Id',
      this.authService.user().id
    );
    const params = new HttpParams()
      .set(ROUTES_PARAMS.USER_ID, this.authService.user().id)
      .set(ROUTES_PARAMS.CONVERSATION_ID, sc.conversationId);

    return this.http
      .get<ConversationDetailsDto>(
        `${this.environment.apiUrl}${CHAT_ROUTES.CONVERSATION_DETAILS.GET}/${sc.conversationId}`,
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
                createdAt: message.created_at,
              };
            }),
            memberList: convDetailsDto.memberList.map((member) => {
              return {
                id: member.id,
                name: member.name,
                avatarUrl: member.profile_photo_url,
              };
            }),
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
        headers,
      })
      .pipe(
        map((conversationDtoList: ConversationDto[]) => {
          return conversationDtoList.map((conversationDto: ConversationDto) => {
            console.log(conversationDto);
            return {
              ...conversationDto,
              active: false,
            };
          });
        })
      );
  }

  sendMessage(messageSend: MessageSend) {
    this.socket.emit(SOCKET_COMMANDS.SEND_MESSAGE, messageSend);
  }

  private setupSocketListeners() {
    this.socket.on(
      SOCKET_COMMANDS.RECEIVE_MESSAGE,
      (message: ReceiveMessageDto) => {
        this.receiveMessage$.next({
          conversationId: message.conversation_id,
          content: message.content,
          createdAt: message.created_at,
          messageId: message.message_id,
          senderId: message.sender_id,
        });
      }
    );
  }
}
