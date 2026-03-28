import {
  AnimationTriggerMetadata,
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

// ── Timing ────────────────────────────────────────────────────────────────
// Enter is slightly slower than leave so the incoming page "arrives" after
// the outgoing page has already started moving — gives a layered, cinematic feel.
const ENTER = '560ms cubic-bezier(0.4, 0, 0.2, 1)';
const LEAVE = '460ms cubic-bezier(0.4, 0, 0.2, 1)';

// ── Shared position reset applied to both elements at the start ───────────
const BOTH_ABSOLUTE = query(
  ':enter, :leave',
  style({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }),
  { optional: true },
);

// ── Forward slide (introduction → video, video → keyMilestones) ──────────
// New page rushes in from the right.
// Old page drifts left and dims — like a chapter being turned.
function slideForward() {
  return [
    BOTH_ABSOLUTE,
    query(':enter', style({ transform: 'translateX(100%)', opacity: 0.9 }), { optional: true }),
    group([
      query(
        ':leave',
        animate(LEAVE, style({ transform: 'translateX(-22%)', opacity: 0, filter: 'brightness(0.7)' })),
        { optional: true },
      ),
      query(
        ':enter',
        animate(ENTER, style({ transform: 'translateX(0)', opacity: 1, filter: 'brightness(1)' })),
        { optional: true },
      ),
    ]),
  ];
}

// ── Back slide (video → introduction, keyMilestones → video) ─────────────
// New page slides in from the left.
// Old page drifts right and dims.
function slideBack() {
  return [
    BOTH_ABSOLUTE,
    query(':enter', style({ transform: 'translateX(-100%)', opacity: 0.9 }), { optional: true }),
    group([
      query(
        ':leave',
        animate(LEAVE, style({ transform: 'translateX(22%)', opacity: 0, filter: 'brightness(0.7)' })),
        { optional: true },
      ),
      query(
        ':enter',
        animate(ENTER, style({ transform: 'translateX(0)', opacity: 1, filter: 'brightness(1)' })),
        { optional: true },
      ),
    ]),
  ];
}

// ── Trigger ───────────────────────────────────────────────────────────────
// Route data key: "animation"
// States:  'introduction'  →  'video'  →  'keyMilestones'
export const introductionRouteAnimation: AnimationTriggerMetadata = trigger(
  'introductionRoute',
  [
    // ── Forward ──
    transition('introduction => video',        slideForward()),
    transition('video       => keyMilestones', slideForward()),
    // ── Back ──
    transition('video          => introduction', slideBack()),
    transition('keyMilestones  => video',        slideBack()),
  ],
);
