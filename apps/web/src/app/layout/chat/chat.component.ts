import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {
  ChatInfrastructureRest,
  ChatInfrastructureWebSockets,
  ChatStore,
  NetworkService,
} from "@chat-app/domain";
import { AccountWidgetComponent } from "@chat-app/feature-account";
import { ConversationListLayoutComponent } from "@chat-app/feature-conversation-list";
import { AuthService } from "@chat-app/web/shared/util/auth";

@Component({
  selector: "mg-chat",
  standalone: true,
  imports: [
    AccountWidgetComponent,
    ConversationListLayoutComponent,
    RouterOutlet,
  ],
  templateUrl: "./chat.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ChatStore,
    ChatInfrastructureRest,
    ChatInfrastructureWebSockets,
    NetworkService,
  ],
})
export class ChatComponent {
  readonly user = inject(AuthService).user;
}
