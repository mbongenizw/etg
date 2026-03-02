'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Car,
  Users,
  Route,
  Wrench,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useModuleStore } from '@/stores/moduleStore';

interface DashboardStats {
  totalVehicles: number;
  activeDrivers: number;
  totalTrips: number;
  pendingMaintenance: number;
  vehicleStatusDistribution: { name: string; value: number; color: string }[];
  recentTrips: any[];
  upcomingMaintenance: any[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { setActiveModule } = useModuleStore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vehicles',
      value: stats?.totalVehicles || 0,
      icon: Car,
      color: 'bg-amber-500',
      trend: '+2 this month',
    },
    {
      title: 'Active Drivers',
      value: stats?.activeDrivers || 0,
      icon: Users,
      color: 'bg-green-500',
      trend: '98% active',
    },
    {
      title: 'Total Trips',
      value: stats?.totalTrips || 0,
      icon: Route,
      color: 'bg-orange-500',
      trend: '+15 this week',
    },
    {
      title: 'Pending Maintenance',
      value: stats?.pendingMaintenance || 0,
      icon: Wrench,
      color: 'bg-red-500',
      trend: 'Needs attention',
    },
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#eab308', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to ETG Agri Inputs Fleet Management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => setActiveModule('vehicle-checks')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Check Out Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vehicle Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Status Distribution</CardTitle>
            <CardDescription>Current status of all vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.vehicleStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(stats?.vehicleStatusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {(stats?.vehicleStatusDistribution || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-amber-200 hover:bg-amber-50"
                onClick={() => setActiveModule('vehicles')}
              >
                <Car className="h-5 w-5 text-amber-600" />
                <span>Add Vehicle</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-amber-200 hover:bg-amber-50"
                onClick={() => setActiveModule('drivers')}
              >
                <Users className="h-5 w-5 text-amber-600" />
                <span>Add Driver</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-amber-200 hover:bg-amber-50"
                onClick={() => setActiveModule('vehicle-checks')}
              >
                <Route className="h-5 w-5 text-amber-600" />
                <span>Check Out/In</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-amber-200 hover:bg-amber-50"
                onClick={() => setActiveModule('maintenance')}
              >
                <Wrench className="h-5 w-5 text-amber-600" />
                <span>Schedule Service</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check Outs and Upcoming Maintenance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Check Outs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Check Outs</CardTitle>
              <CardDescription>Latest vehicle check out activities</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-600"
              onClick={() => setActiveModule('vehicle-checks')}
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.recentTrips || []).slice(0, 5).map((trip: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Route className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{trip.origin} → {trip.destination}</p>
                      <p className="text-xs text-gray-500">{trip.vehicle?.plateNumber} • {trip.driver?.name}</p>
                    </div>
                  </div>
                  <Badge className={
                    trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    trip.status === 'IN PROGRESS' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                  }>
                    {trip.status}
                  </Badge>
                </div>
              ))}
              {(!stats?.recentTrips || stats.recentTrips.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No recent check outs
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Maintenance</CardTitle>
              <CardDescription>Scheduled service reminders</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-600"
              onClick={() => setActiveModule('maintenance')}
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.upcomingMaintenance || []).slice(0, 5).map((maintenance: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Wrench className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{maintenance.description}</p>
                      <p className="text-xs text-gray-500">
                        {maintenance.vehicle?.plateNumber} • Due: {new Date(maintenance.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    maintenance.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                    maintenance.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                  }>
                    {maintenance.priority}
                  </Badge>
                </div>
              ))}
              {(!stats?.upcomingMaintenance || stats.upcomingMaintenance.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No upcoming maintenance
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Alerts & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button 
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
              onClick={() => setActiveModule('vehicles')}
            >
              <Calendar className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-sm">Insurance Expiring Soon</p>
                <p className="text-xs text-gray-500">2 vehicles within 30 days</p>
              </div>
            </button>
            <button 
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
              onClick={() => setActiveModule('maintenance')}
            >
              <Wrench className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-sm">Service Overdue</p>
                <p className="text-xs text-gray-500">1 vehicle needs service</p>
              </div>
            </button>
            <button 
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
              onClick={() => setActiveModule('drivers')}
            >
              <Users className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-sm">License Expiring</p>
                <p className="text-xs text-gray-500">3 drivers within 60 days</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
