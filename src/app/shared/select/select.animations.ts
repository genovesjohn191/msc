import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
  query,
  animateChild,
  group,
} from '@angular/animations';

// TODO: This should be common to all implementation, put it in the utilities
export const selectAnimations: {
  readonly transformPanel: AnimationTriggerMetadata;
  readonly fadeInContent: AnimationTriggerMetadata;
} = {
  /**
   * Transformation of the select panel when it is showing
   */
  transformPanel: trigger('transformPanel', [
    state('void', style({
      transform: 'scaleY(0)',
      opacity: 0
    })),
    state('showing', style({
      opacity: 1,
      transform: 'scaleY(1)'
    })),
    transition('void => *', group([
      query('@fadeInContent', animateChild()),
      animate('150ms cubic-bezier(0.25, 0.8, 0.25, 1)')
    ])),
    transition('* => void', [
      animate('250ms 100ms linear', style({opacity: 0}))
    ])
  ]),

  /**
   * Fades the content of the select panel
   */
  fadeInContent: trigger('fadeInContent', [
    state('showing', style({opacity: 1})),
    transition('void => showing', [
      style({opacity: 0}),
      animate('150ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
    ])
  ])
};
