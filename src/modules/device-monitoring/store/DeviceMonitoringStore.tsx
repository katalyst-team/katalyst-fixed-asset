import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createFilterSlice, FilterSlice } from './filterSlice';
import { createPaginationSlice, PaginationSlice } from './paginationSlice';

type DeviceMonitoringStore = PaginationSlice & FilterSlice;

export const useDeviceMonitoringStore = create<DeviceMonitoringStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    { name: 'device-monitoring-store' },
  ),
);