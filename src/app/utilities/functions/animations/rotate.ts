import {
  state,
  style,
  transition,
  trigger,
  animate,
  AnimationTriggerMetadata
} from '@angular/animations';

export const ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';

/**
 * Rotate animation factory
 */
export const rotate: {
  readonly rotate45: AnimationTriggerMetadata;
  readonly rotate90: AnimationTriggerMetadata;
  readonly rotate180: AnimationTriggerMetadata;
} = {
    rotate45: trigger('rotate45', [
      state('void', style({ transform: 'rotate(0deg)' })),
      state('*', style({ transform: 'rotate(45deg)' })),
      transition('void <=> *', animate(ANIMATION_TIMING))
    ]),
    rotate90: trigger('rotate90', [
      state('void', style({ transform: 'rotate(0deg)' })),
      state('*', style({ transform: 'rotate(90deg)' })),
      transition('void <=> *', animate(ANIMATION_TIMING))
    ]),
    rotate180: trigger('rotate180', [
      state('void', style({ transform: 'rotate(0deg)' })),
      state('*', style({ transform: 'rotate(180deg)' })),
      transition('void <=> *', animate(ANIMATION_TIMING))
    ])
  };
