// components/PullToRefreshWrapper.tsx
import React, { useState, useCallback, ReactNode } from 'react';
import { ScrollView, RefreshControl } from 'react-native';

type Props = {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
};

export const PullToRefreshWrapper = ({ children, onRefresh }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (onRefresh) {
      await Promise.resolve(onRefresh());
    }
    setRefreshing(false);
  }, [onRefresh]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
};
