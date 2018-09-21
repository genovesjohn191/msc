import {
  state,
  style,
  transition,
  trigger,
  animate,
  AnimationTriggerMetadata
} from '@angular/animations';

/**
 * Scale animation factory
 */
export const scale: {
  readonly scaleIn: AnimationTriggerMetadata
} = {
    scaleIn: trigger('scaleIn', [
      state('void', style({ transform: 'scale(0)' })),
      state('*', style({ transform: 'scale(1)' })),
      transition('void => *', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
      transition('* => void', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ])
  };
