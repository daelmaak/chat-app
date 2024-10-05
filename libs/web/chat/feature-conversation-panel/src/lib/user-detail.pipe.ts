import {inject, Pipe, PipeTransform} from "@angular/core";
import { ChatFacade, UserKeys } from '@chat-app/domain';


//todo prefix
@Pipe({
  name: 'userDetail',
  standalone: true
})
export class UserDetailPipe implements PipeTransform {
  readonly #members = inject(ChatFacade).memberIdMap;

  transform(userId: string, detailKey: UserKeys): string {
    if (this.#members() && userId) {
      const result = this.#members().get(userId);
      if (result) {
        return result[detailKey] ?? '';
      }
    }
    return '';
  }
}
