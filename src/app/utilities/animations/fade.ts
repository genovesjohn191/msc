import {
  state,
  style,
  transition,
  trigger,
  animate,
  AnimationTriggerMetadata
} from '@angular/animations';

/**
 * Fade element animation factory
 */
export const fade: {
  readonly fadeIn: AnimationTriggerMetadata;
} = {
    fadeIn: trigger('fadeIn', [
      state('*', style({ opacity: 1 })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate('150ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
      ])
    ])
  };
