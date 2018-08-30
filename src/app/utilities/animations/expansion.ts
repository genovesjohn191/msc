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
 * Expansion panel animation factory
 */
export const expansion: {
  readonly expansionVertical: AnimationTriggerMetadata;
} = {
  expansionVertical: trigger('expansionVertical', [
    state('collapsed', style({ height: '0px', visibility: 'hidden', overflow: 'hidden' })),
    state('expanded', style({ height: '*', visibility: 'visible', overflow: 'hidden' })),
    transition('collapsed <=> expanded', animate(ANIMATION_TIMING))
  ])
};
