/**
 * File: pages/StatisticsDashboard.tsx
 * Purpose: Advanced Tutor Statistics Dashboard with charts and analytics
 * Features:
 *   - Time & Class filters
 *   - KPI cards with trend indicators
 *   - Sessions & Revenue combination chart
 *   - Time distribution pie chart with summary table
 *   - Student ranking based on average homework score
 */

import React, { useState } from 'react';
import { useAllStatistics, useClassOptions } from '../hooks/useStatistics';
import { StatisticsFilters, TimeFilterType } from '../types/statistics.types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  CalendarDays,
  Clock,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  BookOpen,
  RefreshCw,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Time filter options
const TIME_FILTER_OPTIONS: { value: TimeFilterType; label: string }[] = [
  { value: 'this_week', label: 'Tuần này' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
  { value: 'last_3_months', label: '3 tháng gần nhất' },
  { value: 'custom', label: 'Tùy chọn' },
];

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage
const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

// Custom Tooltip for Sessions/Revenue chart
const SessionsRevenueTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-blue-600">Số buổi: {data.sessions}</p>
        <p className="text-green-600">Số giờ: {data.hours}h</p>
        <p className="text-yellow-600">Doanh thu: {formatCurrency(data.revenue)}</p>
      </div>
    );
  }
  return null;
};

// Get medal color based on rank
const getMedalColor = (rank: number): string => {
  switch (rank) {
    case 1: return 'bg-yellow-500';
    case 2: return 'bg-gray-400';
    case 3: return 'bg-orange-400';
    default: return 'bg-blue-500';
  }
};

// Get score color
const getScoreColor = (score: number | null): string => {
  if (score === null) return 'text-gray-400';
  if (score >= 8) return 'text-green-600';
  if (score >= 6.5) return 'text-blue-600';
  if (score >= 5) return 'text-yellow-600';
  return 'text-red-600';
};

export const StatisticsDashboard: React.FC = () => {
  // Filter state - default to this_week
  const [filters, setFilters] = useState<StatisticsFilters>({
    timeFilter: 'this_week',
    classId: 'all',
  });
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch data
  const { data, isLoading, error, refetch, isFetching } = useAllStatistics(filters);
  const { data: classOptionsData } = useClassOptions();

  // Handle filter changes
  const handleTimeFilterChange = (value: TimeFilterType) => {
    if (value === 'custom') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
      setFilters(prev => ({ ...prev, timeFilter: value, fromDate: undefined, toDate: undefined }));
    }
  };

  const handleApplyCustomDates = () => {
    if (fromDate && toDate) {
      setFilters(prev => ({
        ...prev,
        timeFilter: 'custom',
        fromDate,
        toDate,
      }));
    }
  };

  const handleClassFilterChange = (classId: string) => {
    setFilters(prev => ({ ...prev, classId }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const stats = data?.data;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
          <p className="text-gray-600">Phân tích hoạt động giảng dạy</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filters.timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value as TimeFilterType)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TIME_FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {showCustomDates && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <Button size="sm" onClick={handleApplyCustomDates}>Áp dụng</Button>
            </div>
          )}

          {/* Class Filter */}
          <select
            value={filters.classId || 'all'}
            onChange={(e) => handleClassFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả lớp</option>
            {classOptionsData?.classes?.map(cls => (
              <option key={cls.classId} value={cls.classId}>{cls.className}</option>
            ))}
          </select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng số buổi dạy</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.overview.totalSessions}
                </p>
                <div className={`flex items-center mt-1 text-sm ${
                  stats.overview.totalSessionsChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.overview.totalSessionsChangePercent >= 0 
                    ? <TrendingUp className="h-4 w-4 mr-1" />
                    : <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  {stats.overview.totalSessionsChangePercent >= 0 ? '+' : ''}
                  {stats.overview.totalSessionsChangePercent}% so với kỳ trước
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Hours */}
        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng giờ dạy</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.overview.totalTeachingHours}h
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  TB {stats.overview.avgHoursPerSession}h/buổi
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.overview.totalRevenue)}
                </p>
                <div className={`flex items-center mt-1 text-sm ${
                  stats.overview.revenueChangeVsPrevPeriod >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.overview.revenueChangeVsPrevPeriod >= 0 
                    ? <TrendingUp className="h-4 w-4 mr-1" />
                    : <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  {stats.overview.revenueChangeVsPrevPeriod >= 0 ? '+' : ''}
                  {formatCurrency(stats.overview.revenueChangeVsPrevPeriod)}
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="bg-gradient-to-br from-purple-50 to-white border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tỉ lệ hoàn thành</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatPercent(stats.overview.sessionCompletionRate)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.overview.completedSessions} hoàn thành / {stats.overview.totalSessions} buổi
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Sessions/Revenue Chart + Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions & Revenue Over Time - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Khối lượng dạy & Doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.sessionsOverTime.data.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Chưa có dữ liệu trong khoảng thời gian này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={stats.sessionsOverTime.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Số buổi', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<SessionsRevenueTooltip />} />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="sessions" 
                    fill="#3B82F6" 
                    name="Số buổi dạy"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    name="Doanh thu (VNĐ)"
                    dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Time Distribution Pie Chart - 1 column */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Phân bổ thời gian theo lớp
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.timeDistribution.data.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                Chưa có dữ liệu
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.timeDistribution.data as any[]}
                      dataKey="hours"
                      nameKey="className"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {stats.timeDistribution.data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value}h (${(props.payload as any).percentage}%)`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Summary Table */}
                <div className="mt-4 max-h-[150px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="text-left py-1 px-2 text-gray-500 font-medium">Lớp</th>
                        <th className="text-right py-1 px-2 text-gray-500 font-medium">Giờ</th>
                        <th className="text-right py-1 px-2 text-gray-500 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.timeDistribution.data.map((item, index) => (
                        <tr key={item.classId} className="border-t border-gray-100">
                          <td className="py-1 px-2 flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="truncate max-w-[120px]" title={item.className}>
                              {item.className}
                            </span>
                          </td>
                          <td className="text-right py-1 px-2">{item.hours}h</td>
                          <td className="text-right py-1 px-2 text-gray-500">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Student Ranking Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Bảng xếp hạng học sinh (theo điểm trung bình bài tập)
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: {stats.studentRanking.totalStudents} học sinh
          </p>
        </CardHeader>
        <CardContent>
          {stats.studentRanking.data.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Chưa có dữ liệu bài tập được chấm điểm</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 w-16">Hạng</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Học sinh</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Lớp</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Số bài tập</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Đã nộp</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Tỉ lệ nộp</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.studentRanking.data.map((student) => (
                    <tr 
                      key={student.studentId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getMedalColor(student.rank)}`}>
                          {student.rank}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{student.className}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium">{student.totalHomeworks}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-green-600">{student.submittedHomeworks}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${student.submissionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{student.submissionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-lg font-bold ${getScoreColor(student.averageScore)}`}>
                          {student.averageScore !== null ? student.averageScore.toFixed(1) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDashboard;
