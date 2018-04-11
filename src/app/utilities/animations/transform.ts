import {
  animate,
  state,
  style,
  transition,
  trigger,
  query,
  animateChild,
  group,
  AnimationTriggerMetadata
} from '@angular/animations';

/**
 * Transform panel animation factory
 */
export const transform: {
  readonly transformVertical: AnimationTriggerMetadata;
} = {
    transformVertical: trigger('transformVertical', [
      state('void', style({ transform: 'scaleY(0)', opacity: 0 })),
      state('*', style({ opacity: 1, transform: 'scaleY(1)' })),
      transition('void => *', group([
        query('@fadeIn', animateChild()),
        animate('150ms cubic-bezier(0.25, 0.8, 0.25, 1)')
      ])),
      transition('* => void', [
        animate('250ms 100ms linear', style({ opacity: 0 }))
      ])
    ]),
  };
