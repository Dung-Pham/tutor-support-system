/**
 * File: pages/StatisticsDashboard.tsx
 * Purpose: Advanced Tutor Statistics Dashboard with charts and analytics
 * Features:
 *   - Time & Class filters
 *   - KPI cards with trend indicators
 *   - Sessions & Revenue combination chart
 *   - Time distribution pie chart with summary table
 *   - Learning effectiveness stacked bar chart
 *   - Top students & Students needing attention widgets
 */

import React, { useState, useMemo } from 'react';
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
  Award,
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
  BarChart,
} from 'recharts';

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const SUBMISSION_COLORS = {
  onTime: '#10B981',
  late: '#F59E0B', 
  missing: '#EF4444',
};

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

// Custom Tooltip for Learning Effectiveness chart
const LearningEffectivenessTooltip = (props: any) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
        <p className="text-green-600">Đúng hạn: {data.onTime}%</p>
        <p className="text-yellow-600">Muộn: {data.late}%</p>
        <p className="text-red-600">Chưa nộp: {data.missing}%</p>
        {data.avgScore !== null && (
          <p className="text-blue-600 mt-1">Điểm TB: {data.avgScore}</p>
        )}
      </div>
    );
  }
  return null;
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

  // Transform data for stacked bar chart
  const learningEffectivenessChartData = useMemo(() => {
    if (!data?.data.learningEffectiveness.data) return [];
    return data.data.learningEffectiveness.data.map(item => ({
      name: item.className.length > 15 ? item.className.substring(0, 15) + '...' : item.className,
      fullName: item.className,
      onTime: Math.round(item.onTimePercent * 100),
      late: Math.round(item.latePercent * 100),
      missing: Math.round(item.missingPercent * 100),
      avgScore: item.averageScore,
    }));
  }, [data?.data.learningEffectiveness.data]);

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
                  {stats.overview.canceledSessions} buổi hủy / {stats.overview.totalSessions} buổi
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

      {/* Row 3: Learning Effectiveness + Top Students + Students Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Effectiveness Stacked Bar Chart - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              Tình trạng nộp bài theo lớp
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: SUBMISSION_COLORS.onTime }} />
                Đúng hạn
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: SUBMISSION_COLORS.late }} />
                Muộn
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: SUBMISSION_COLORS.missing }} />
                Chưa nộp
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {learningEffectivenessChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                Chưa có dữ liệu bài tập
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={learningEffectivenessChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100} 
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<LearningEffectivenessTooltip />} />
                  <Bar dataKey="onTime" stackId="a" fill={SUBMISSION_COLORS.onTime} name="Đúng hạn" />
                  <Bar dataKey="late" stackId="a" fill={SUBMISSION_COLORS.late} name="Muộn" />
                  <Bar dataKey="missing" stackId="a" fill={SUBMISSION_COLORS.missing} name="Chưa nộp" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Overall Stats */}
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatPercent(stats.learningEffectiveness.overallOnTimePercent)}
                </p>
                <p className="text-xs text-gray-500">Tổng đúng hạn</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {formatPercent(stats.learningEffectiveness.overallLatePercent)}
                </p>
                <p className="text-xs text-gray-500">Tổng muộn</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatPercent(stats.learningEffectiveness.overallMissingPercent)}
                </p>
                <p className="text-xs text-gray-500">Tổng chưa nộp</p>
              </div>
              {stats.learningEffectiveness.overallAverageScore !== null && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.learningEffectiveness.overallAverageScore}
                  </p>
                  <p className="text-xs text-gray-500">Điểm TB chung</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Widgets Column */}
        <div className="space-y-6">
          {/* Top Students */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top học sinh nổi bật
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topStudents.students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {stats.topStudents.students.map((student, index) => (
                    <div 
                      key={student.studentId}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{student.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Điểm: {student.averageScore}</span>
                          <span>•</span>
                          <span>Đúng hạn: {formatPercent(student.onTimeSubmissionRate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students Needing Attention */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Học sinh cần chú ý
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.studentsNeedingAttention.students.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">Tất cả học sinh đều tốt!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.studentsNeedingAttention.students.slice(0, 3).map((student) => (
                    <div 
                      key={student.studentId}
                      className="p-2 border border-red-100 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <div className="flex gap-1">
                          {student.reasons.includes('low_score') && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                              Điểm thấp
                            </span>
                          )}
                          {student.reasons.includes('high_absence') && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                              Vắng nhiều
                            </span>
                          )}
                          {student.reasons.includes('missing_assignments') && (
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                              Thiếu bài
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{student.className}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        {student.averageScore !== null && (
                          <span>Điểm TB: {student.averageScore}</span>
                        )}
                        <span>Vắng: {student.absentSessions}/{student.totalSessions}</span>
                        <span>Thiếu: {student.missingAssignments} bài</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
