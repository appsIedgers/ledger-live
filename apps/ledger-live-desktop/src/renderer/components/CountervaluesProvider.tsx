import React, { useEffect } from "react";
import {
  Countervalues,
  useCountervaluesPolling,
  useCountervaluesExport,
} from "@ledgerhq/live-countervalues-react";
import {
  CountervaluesSettings,
  CounterValuesStateRaw,
  RateMapRaw,
} from "@ledgerhq/live-countervalues/types";
import { pairId } from "@ledgerhq/live-countervalues/helpers";
import { setKey } from "~/renderer/storage";
import { useUserSettings } from "../actions/general";
export default function CountervaluesProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: CounterValuesStateRaw;
}) {
  const userSettings = useUserSettings();
  return (
    <Countervalues userSettings={userSettings} savedState={initialState}>
      <CountervaluesManager userSettings={userSettings}>{children}</CountervaluesManager>
    </Countervalues>
  );
}
function CountervaluesManager({
  children,
  userSettings,
}: {
  children: React.ReactNode;
  userSettings: CountervaluesSettings;
}) {
  useCacheManager(userSettings);
  usePollingManager();
  return <>{children}</>;
}
function useCacheManager(userSettings: CountervaluesSettings) {
  const { status, ...state } = useCountervaluesExport();
  useEffect(() => {
    if (!Object.keys(status).length) return;
    const ids = userSettings.trackingPairs.map(pairId);
    const newState = Object.entries(state).reduce(
      (prev: Record<string, RateMapRaw>, [key, val]) =>
        ids.includes(key)
          ? {
              ...prev,
              [key]: val,
            }
          : prev,
      {},
    );
    setKey("app", "countervalues", {
      ...newState,
      status: status,
    });
  }, [state, userSettings, status]);
}
function usePollingManager() {
  const { start, stop } = useCountervaluesPolling();
  useEffect(() => {
    window.addEventListener("blur", stop);
    window.addEventListener("focus", start);
    return () => {
      window.removeEventListener("blur", stop);
      window.removeEventListener("focus", start);
    };
  }, [start, stop]);
}
