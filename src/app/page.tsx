// ETG Vehicle Management System - Main Page
'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useModuleStore } from '@/stores/moduleStore';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/modules/Dashboard';
import { VehiclesModule } from '@/components/modules/VehiclesModule';
import { DriversModule } from '@/components/modules/DriversModule';
import { MaintenanceModule } from '@/components/modules/MaintenanceModule';
import { ServiceModule } from '@/components/modules/ServiceModule';
import { FuelModule } from '@/components/modules/FuelModule';
import { IncidentsModule } from '@/components/modules/IncidentsModule';
import { RemindersModule } from '@/components/modules/RemindersModule';
import { VehicleChecksModule } from '@/components/modules/VehicleChecksModule';
import { ReportsModule } from '@/components/modules/ReportsModule';
import { UsersModule } from '@/components/modules/UsersModule';
import { RoleManagementModule } from '@/components/modules/RoleManagementModule';
import { SettingsModule } from '@/components/modules/SettingsModule';

export default function Home() {
  const { activeModule } = useModuleStore();
  const { user } = useAuth();

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'vehicles':
        return <VehiclesModule />;
      case 'drivers':
        return <DriversModule />;
      case 'service':
        return <ServiceModule />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'fuel':
        return <FuelModule />;
      case 'incidents':
        return <IncidentsModule />;
      case 'reminders':
        return <RemindersModule />;
      case 'vehicle-checks':
        return <VehicleChecksModule />;
      case 'reports':
        return <ReportsModule />;
      case 'users':
        return user?.role === 'Admin' ? <UsersModule /> : <Dashboard />;
      case 'roles':
        return user?.role === 'Admin' ? <RoleManagementModule /> : <Dashboard />;
      case 'settings':
        return user?.role === 'Admin' ? <SettingsModule /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout>
      {renderModule()}
    </MainLayout>
  );
}
