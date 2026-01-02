/**
 * File: hooks/useStatistics.ts
 * Purpose: React Query hooks for Statistics Dashboard
 * Description: Type-safe data fetching with filter support
 */

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { apiClient } from '../services/api';
import {
  StatisticsFilters,
  FullStatisticsApiResponse,
  OverviewApiResponse,
  SessionsOverTimeApiResponse,
  TimeDistributionApiResponse,
  StudentRankingApiResponse,
  ClassOptionsApiResponse,
} from '../types/statistics.types';

const API_BASE_URL = '/statistics/v2';

/**
 * Build query string from filters
 */
function buildQueryString(filters: StatisticsFilters): string {
  const params = new URLSearchParams();
  params.append('timeFilter', filters.timeFilter);
  
  if (filters.fromDate) {
    params.append('fromDate', filters.fromDate);
  }
  if (filters.toDate) {
    params.append('toDate', filters.toDate);
  }
  if (filters.classId && filters.classId !== 'all') {
    params.append('classId', filters.classId);
  }
  
  return params.toString();
}

/**
 * Generic fetch function using apiClient (has auto-refresh token)
 */
async function fetchWithAuth<T>(url: string): Promise<T> {
  const response = await apiClient.get<T>(url);
  return response.data;
}

/**
 * Hook: Get all statistics data at once
 */
export function useAllStatistics(filters: StatisticsFilters) {
  const { token } = useSelector((state: RootState) => state.auth);
  const queryString = buildQueryString(filters);

  return useQuery<FullStatisticsApiResponse, Error>({
    queryKey: ['statistics', 'all', filters],
    queryFn: () => fetchWithAuth<FullStatisticsApiResponse>(
      `${API_BASE_URL}/all?${queryString}`
    ),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook: Get KPI overview
 */
export function useStatisticsOverview(filters: StatisticsFilters) {
  const { token } = useSelector((state: RootState) => state.auth);
  const queryString = buildQueryString(filters);

  return useQuery<OverviewApiResponse, Error>({
    queryKey: ['statistics', 'overview', filters],
    queryFn: () => fetchWithAuth<OverviewApiResponse>(
      `${API_BASE_URL}/overview?${queryString}`
    ),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Get sessions & revenue over time
 */
export function useSessionsOverTime(filters: StatisticsFilters) {
  const { token } = useSelector((state: RootState) => state.auth);
  const queryString = buildQueryString(filters);

  return useQuery<SessionsOverTimeApiResponse, Error>({
    queryKey: ['statistics', 'sessions-over-time', filters],
    queryFn: () => fetchWithAuth<SessionsOverTimeApiResponse>(
      `${API_BASE_URL}/sessions-over-time?${queryString}`
    ),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Get time distribution by class
 */
export function useTimeDistribution(filters: StatisticsFilters) {
  const { token } = useSelector((state: RootState) => state.auth);
  const queryString = buildQueryString(filters);

  return useQuery<TimeDistributionApiResponse, Error>({
    queryKey: ['statistics', 'time-distribution', filters],
    queryFn: () => fetchWithAuth<TimeDistributionApiResponse>(
      `${API_BASE_URL}/time-distribution?${queryString}`
    ),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Get student ranking based on average homework score
 */
export function useStudentRanking(filters: StatisticsFilters) {
  const { token } = useSelector((state: RootState) => state.auth);
  const queryString = buildQueryString(filters);

  return useQuery<StudentRankingApiResponse, Error>({
    queryKey: ['statistics', 'student-ranking', filters],
    queryFn: () => fetchWithAuth<StudentRankingApiResponse>(
      `${API_BASE_URL}/student-ranking?${queryString}`
    ),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Get class options for filter dropdown
 */
export function useClassOptions() {
  const { token } = useSelector((state: RootState) => state.auth);

  return useQuery<ClassOptionsApiResponse, Error>({
    queryKey: ['statistics', 'class-options'],
    queryFn: () => fetchWithAuth<ClassOptionsApiResponse>(
      `${API_BASE_URL}/classes`
    ),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes - class list doesn't change often
  });
}
