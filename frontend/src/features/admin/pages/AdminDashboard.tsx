import { StatCard, PageHeader } from '../components/shared';
import {
  useDashboardStats,
  useRevenueChart,
  useStudentsByCountry,
  useStudentsByPackage,
} from '../hooks';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#064E3B', '#047857', '#059669', '#10B981', '#34D399'];

export const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart(6);
  const { data: countryData } = useStudentsByCountry();
  const { data: packageData } = useStudentsByPackage();

  if (statsLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your academy performance"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={stats?.totalActiveStudents || 0}
          icon={Users}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Teachers"
          value={stats?.totalActiveTeachers || 0}
          icon={GraduationCap}
          iconClassName="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Active Courses"
          value={stats?.totalActiveCourses || 0}
          icon={BookOpen}
          iconClassName="bg-green-100 text-green-600"
        />
        <StatCard
          title="Revenue (This Month)"
          value={`$${stats?.totalRevenueThisMonth || 0}`}
          icon={DollarSign}
          iconClassName="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number | undefined) => [`$${value ?? 0}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="revenue" fill="#064E3B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Students by Package */}
        {packageData && packageData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Package</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={packageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                >
                  {packageData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Students by Country */}
      {countryData && countryData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Country</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {countryData.map((item) => (
              <div key={item.name} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-700">{item.count}</p>
                <p className="text-sm text-gray-600 mt-1">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Profile Changes</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats?.pendingProfileChanges || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting admin review</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.pendingBookings || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Require assignment</p>
        </div>
      </div>
    </div>
  );
};
