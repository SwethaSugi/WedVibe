// Once an invitation is live, couples may save changes a limited number of times within a
// limited window after it went live. Drafts are unrestricted.
export const MAX_LIVE_EDITS = 3;
export const LIVE_EDIT_WINDOW_DAYS = 7;

const LIVE_STATUSES = ["ACTIVE", "PUBLISHED"];

export interface EditInfo {
  isLive: boolean;
  canEdit: boolean;
  editsUsed: number;
  editsAllowed: number;
  editWindowEndsAt: string | null;
  reason: string | null;
}

export function getEditInfo(invitation: {
  status: string;
  editCount: number;
  activatedAt: Date | null;
  createdAt: Date;
}): EditInfo {
  const isLive = LIVE_STATUSES.includes(invitation.status);
  if (!isLive) {
    return { isLive, canEdit: true, editsUsed: 0, editsAllowed: MAX_LIVE_EDITS, editWindowEndsAt: null, reason: null };
  }

  const activatedAt = invitation.activatedAt ?? invitation.createdAt;
  const windowEnds = new Date(activatedAt.getTime() + LIVE_EDIT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const editsLeft = MAX_LIVE_EDITS - invitation.editCount;

  let reason: string | null = null;
  if (Date.now() > windowEnds.getTime()) {
    reason = `Editing closed — invitations can only be edited within ${LIVE_EDIT_WINDOW_DAYS} days of going live.`;
  } else if (editsLeft <= 0) {
    reason = `Editing closed — all ${MAX_LIVE_EDITS} edits have been used.`;
  }

  return {
    isLive,
    canEdit: reason === null,
    editsUsed: invitation.editCount,
    editsAllowed: MAX_LIVE_EDITS,
    editWindowEndsAt: windowEnds.toISOString(),
    reason,
  };
}
