import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '@chat-app/domain';
import { AccountListComponent,AccountWidgetComponent } from '@chat-app/feature-account';
import { routing } from '@chat-app/util-routing';
import { AuthService } from '@chat-app/web/shared/util/auth';

@Component({
  selector: 'mg-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [NgFor, NgIf, FormsModule, AccountWidgetComponent, AccountListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  //todo check leaks with tosignal approach
  readonly users = toSignal(this.authService.getAllUsers(), { initialValue: [] });
  private readonly router = inject(Router);

  async onSelectUser(user: User): Promise<void> {
    this.authService.setUser(user);
    await this.router.navigate([`${routing.chat.url()}`]);
  }
}
