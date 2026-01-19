import { useMemo } from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { getHealthMetricsForWeek } from '../../lib/db';
import type { HealthMetrics } from '../../types';
import { useState, useEffect } from 'react';

interface HealthMetricsAnalyticsProps {
  userId: string;
  timeRange: 'week' | 'month' | 'all';
}

export default function HealthMetricsAnalytics({ userId, timeRange }: HealthMetricsAnalyticsProps) {
  const [healthMetrics, setHealthMetrics] = useState<Map<string, HealthMetrics>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthMetrics();
  }, [userId, timeRange]);

  async function loadHealthMetrics() {
    if (!userId) return;
    setLoading(true);

    try {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      if (timeRange === 'week') {
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        endDate = endOfWeek(today, { weekStartsOn: 1 });
      } else if (timeRange === 'month') {
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
      } else {
        startDate = new Date(2020, 0, 1);
        endDate = today;
      }

      const dates: string[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const metrics = await getHealthMetricsForWeek(userId, dates);
      setHealthMetrics(metrics);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    const dates = Array.from(healthMetrics.keys()).sort();
    return dates.map((dateStr) => {
      const metric = healthMetrics.get(dateStr);
      return {
        date: format(parseISO(dateStr), 'MMM d'),
        dateISO: dateStr,
        sleepHours: metric?.sleep_hours ?? null,
        sleepQuality: metric?.sleep_quality ?? null,
        mood: metric?.mood_rating ?? null,
        hydration: metric?.hydration_glasses ?? null,
        nutrition: metric?.nutrition_rating ?? null,
        physicalState: metric?.physical_state_rating ?? null,
      };
    });
  }, [healthMetrics]);


  const correlations = useMemo(() => {
    const data = chartData.filter(d => 
      d.sleepQuality !== null && d.mood !== null && d.hydration !== null && d.nutrition !== null
    );

    if (data.length < 2) return null;

    // Calculate correlation between sleep quality and mood
    const sleepMoodCorr = calculateCorrelation(
      data.map(d => d.sleepQuality!),
      data.map(d => d.mood!)
    );

    // Calculate correlation between hydration and mood
    const hydrationMoodCorr = calculateCorrelation(
      data.map(d => d.hydration!),
      data.map(d => d.mood!)
    );

    // Calculate correlation between nutrition and mood
    const nutritionMoodCorr = calculateCorrelation(
      data.map(d => d.nutrition!),
      data.map(d => d.mood!)
    );

    return {
      sleepMood: sleepMoodCorr,
      hydrationMood: hydrationMoodCorr,
      nutritionMood: nutritionMoodCorr,
    };
  }, [chartData]);

  function calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Metrics Analytics</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No health metrics data available for this time range.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Line Charts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Metrics Over Time</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={[0, 5]}
              label={{ value: 'Rating (1-5)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="sleepQuality" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#8b5cf6' }}
              activeDot={{ r: 7 }}
              name="Sleep Quality"
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#10b981' }}
              activeDot={{ r: 7 }}
              name="Mood"
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="nutrition" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#f59e0b' }}
              activeDot={{ r: 7 }}
              name="Nutrition"
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="hydration" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#3b82f6' }}
              activeDot={{ r: 7 }}
              name="Hydration (glasses)"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Hours Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sleep Hours Over Time</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={[0, 12]}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
              formatter={(value: any) => [`${value} hours`, 'Sleep']}
            />
            <Area 
              type="monotone" 
              dataKey="sleepHours" 
              stroke="#6366f1" 
              strokeWidth={3}
              fill="url(#sleepGradient)"
              dot={{ r: 5, fill: '#6366f1' }}
              activeDot={{ r: 7 }}
              name="Sleep Hours"
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="sleepHours" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#6366f1' }}
              activeDot={{ r: 7 }}
              name="Sleep Hours"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Correlations */}
      {correlations && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metric Correlations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sleep Quality ↔ Mood</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {correlations.sleepMood.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {correlations.sleepMood > 0.5 ? 'Strong positive' : 
                 correlations.sleepMood > 0 ? 'Weak positive' :
                 correlations.sleepMood > -0.5 ? 'Weak negative' : 'Strong negative'} correlation
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hydration ↔ Mood</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {correlations.hydrationMood.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {correlations.hydrationMood > 0.5 ? 'Strong positive' : 
                 correlations.hydrationMood > 0 ? 'Weak positive' :
                 correlations.hydrationMood > -0.5 ? 'Weak negative' : 'Strong negative'} correlation
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nutrition ↔ Mood</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {correlations.nutritionMood.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {correlations.nutritionMood > 0.5 ? 'Strong positive' : 
                 correlations.nutritionMood > 0 ? 'Weak positive' :
                 correlations.nutritionMood > -0.5 ? 'Weak negative' : 'Strong negative'} correlation
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

