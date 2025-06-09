import { Directive, inject, Input } from '@angular/core';
import { AsyncValidator, AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable, map, of, take } from 'rxjs';
import { ChannelService } from '../../services/firebase/channel/channel.service';


@Directive({
  selector: '[appChannelNameValidator]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: ChannelNameValidatorDirective,
      multi: true
    }
  ]
})
export class ChannelNameValidatorDirective implements AsyncValidator {
  private channelService = inject(ChannelService);

  @Input('appChannelNameValidator') originalName: string = '';

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const enteredName = control.value?.trim().toLowerCase().replace(/\s+/g, '_');
    const original = this.originalName?.trim().toLowerCase().replace(/\s+/g, '_');

    if (enteredName === original) {
      return of(null);
    }

    return this.channelService.getChannels().pipe(
      take(1),
      map(channels => {
        const exists = channels.some(channel =>
          channel.title.toLowerCase().replace(/\s+/g, '_') === enteredName
        );
        return exists ? { channelNameTaken: true } : null;
      })
    );
  }
}
