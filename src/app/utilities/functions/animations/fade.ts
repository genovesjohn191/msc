import {
  state,
  style,
  transition,
  trigger,
  animate,
  AnimationTriggerMetadata
} from '@angular/animations';
import {
  animationDurations,
  animationCurves
} from './constants';

/**
 * Fade element animation factory
 */
export const fade: {
  readonly fadeInOut: AnimationTriggerMetadata;
  readonly fadeIn: AnimationTriggerMetadata;
  readonly fadeOut: AnimationTriggerMetadata;
} = {
    fadeInOut: trigger('fadeInOut', [
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('void => *',
        animate(`${animationDurations.entering} ${animationCurves.deceleration}`)
      ),
      transition('* => void',
        animate(`${animationDurations.exiting} ${animationCurves.acceleration}`)
      )
    ]),
    fadeIn: trigger('fadeIn', [
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('void => *',
        animate(`${animationDurations.entering} ${animationCurves.standard}`)
      )
    ]),
    fadeOut: trigger('fadeOut', [
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('* => void',
        animate(`${animationDurations.exiting} ${animationCurves.standard}`)
      )
    ])
  };
