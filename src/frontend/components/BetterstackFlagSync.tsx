import { useEffect } from 'react';
import { useBooleanFlagValue } from '@openfeature/react-sdk';
import { setBetterstackControls } from '../utils/betterstack';

export const FRONTEND_MANUAL_EVENTS_FLAG = 'frontendManualEventsEnabled';
export const FRONTEND_USER_IDENTIFICATION_FLAG = 'frontendUserIdentificationEnabled';

export default function BetterstackFlagSync() {
  const manualEventsEnabled = useBooleanFlagValue(FRONTEND_MANUAL_EVENTS_FLAG, true);
  const userIdentificationEnabled = useBooleanFlagValue(FRONTEND_USER_IDENTIFICATION_FLAG, true);

  useEffect(() => {
    setBetterstackControls({
      manualEventsEnabled,
      userIdentificationEnabled,
    });
  }, [manualEventsEnabled, userIdentificationEnabled]);

  return null;
}
