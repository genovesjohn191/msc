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
      state('void', style({ transform: 'scaleY(0)', opacity: 0, minWidth: '100%' })),
      state('transform', style({ opacity: 1, transform: 'scaleY(1)', minWidth: 'auto' })),
      transition('void => transform', group([
        query('@fadeIn', animateChild(), { optional: true }),
        animate('120ms cubic-bezier(0, 0, 0.2, 1)')
      ])),
      transition('transform => void', [
        animate('100ms 25ms linear', style({ opacity: 0 }))
      ])
    ]),
  };
