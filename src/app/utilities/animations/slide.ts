import {
  state,
  style,
  transition,
  trigger,
  animate,
  AnimationTriggerMetadata
} from '@angular/animations';

/**
 * Slide element animation factory
 */
export const slide: {
  readonly slideLeft: AnimationTriggerMetadata;
  readonly slideRight: AnimationTriggerMetadata;
  readonly slideTop: AnimationTriggerMetadata;
  readonly slideBottom: AnimationTriggerMetadata;
} = {
    slideLeft: trigger('slideLeft', [
      state('*', style({ transform: 'translate3d(0%, 0, 0)', offset: 1 })),
      state('void', style({ transform: 'translate3d(-100%, 0, 0)', offset: 0 })),
      transition('* <=> void', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
    slideRight: trigger('slideRight', [
      state('*', style({ transform: 'translate3d(0%, 0, 0)', offset: 1 })),
      state('void', style({ transform: 'translate3d(100%, 0, 0)', offset: 0 })),
      transition('* <=> void', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
    slideTop: trigger('slideTop', [
      state('*', style({ transform: 'translate3d(0, 0%, 0)', offset: 1 })),
      state('void', style({ transform: 'translate3d(0, -100%, 0)', offset: 0 })),
      transition('* <=> void', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
    slideBottom: trigger('slideBottom', [
      state('*', style({ transform: 'translate3d(0, 0%, 0)', offset: 1 })),
      state('void', style({ transform: 'translate3d(0, 100%, 0)', offset: 0 })),
      transition('* <=> void', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
  };
