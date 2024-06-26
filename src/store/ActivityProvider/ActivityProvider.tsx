'use client';

import { fetchActivity } from '@action/activity';
import React, {
  Dispatch,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { IAcitivityResponse } from 'src/types/activity';

export interface ActivityContextType {
  data: IAcitivityResponse | null;
  userId: string | null;
  loadActivity: (id: string) => Promise<void>;
  setData: Dispatch<React.SetStateAction<IAcitivityResponse | null>>;
}

export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export const useActivityContext = (): ActivityContextType => {
  const context = useContext<ActivityContextType | undefined>(ActivityContext);
  if (context === undefined) {
    throw new Error(
      'useActivityContext must be used within an ActivityProvider'
    );
  }
  return context;
};

const ActivityProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [data, setData] = useState<IAcitivityResponse | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const loadActivity = useCallback(async (id: string) => {
    const result = await fetchActivity(id);
    if (result.status === 'success') {
      setData(result.data);
      setUserId(result.userId);
    } else {
      setData(null);
      setUserId(null);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      data,
      setData,
      userId,
      loadActivity,
    }),
    [data, setData, userId, loadActivity]
  );

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};

export default ActivityProvider;
