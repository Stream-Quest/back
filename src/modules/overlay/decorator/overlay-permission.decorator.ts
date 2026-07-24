import { SetMetadata } from '@nestjs/common';

export type OverlayPermissionField =
  | 'canViewEvents'
  | 'canViewKarma'
  | 'canViewMilestones'
  | 'canViewContext'
  | 'canViewPlayers';

export const OVERLAY_PERMISSION_KEY = 'overlayPermission';

export const OverlayPermission = (field: OverlayPermissionField) =>
  SetMetadata(OVERLAY_PERMISSION_KEY, field);
