'use client';

import { useState } from 'react';
import { useModuleStore, ModuleType } from '@/stores/moduleStore';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import {
  LayoutDashboard,
  Car,
  Users,
  Wrench,
  Settings,
  Fuel,
  AlertTriangle,
  Bell,
  ClipboardCheck,
  FileText,
  UserCog,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems: { id: ModuleType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'drivers', label: 'Drivers', icon: Users },
  { id: 'vehicle-checks', label: 'Check Out/In', icon: ClipboardCheck },
  { id: 'service', label: 'Service', icon: Settings },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'fuel', label: 'Fuel Management', icon: Fuel },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const userManagementSubItems: { id: ModuleType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'users', label: 'Users', icon: UserCog },
  { id: 'roles', label: 'Roles', icon: Shield },
];

const adminItems: { id: ModuleType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'settings', label: 'Settings', icon: Database },
];

export function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useModuleStore();
  const { user } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(true);

  const isAdmin = user?.role === 'Admin';

  const isUserManagementActive = activeModule === 'users' || activeModule === 'roles';

  const renderNavItem = (item: { id: ModuleType; label: string; icon: React.ComponentType<{ className?: string }> }, isActive: boolean, collapsed: boolean) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={() => setActiveModule(item.id)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-amber-600 text-white'
            : 'text-amber-200 hover:bg-amber-700 hover:text-white'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {(!collapsed || mobileSidebarOpen) && <span>{item.label}</span>}
      </button>
    );
  };

  const renderUserManagementMenu = (collapsed: boolean) => {
    if (collapsed) {
      // When collapsed, show as a single item that cycles through or shows active
      const activeSubItem = userManagementSubItems.find(item => item.id === activeModule) || userManagementSubItems[0];
      const Icon = activeSubItem.icon;
      return (
        <button
          key="user-management"
          onClick={() => setActiveModule(activeSubItem.id)}
          className={cn(
            'flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isUserManagementActive
              ? 'bg-amber-600 text-white'
              : 'text-amber-200 hover:bg-amber-700 hover:text-white'
          )}
          title="User Management"
        >
          <UserCog className="h-5 w-5 flex-shrink-0" />
        </button>
      );
    }

    return (
      <div key="user-management-group" className="space-y-1">
        {/* Parent Menu Item */}
        <button
          onClick={() => {
            setUserMenuOpen(!userMenuOpen);
            if (!isUserManagementActive) {
              setActiveModule('users');
            }
          }}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isUserManagementActive
              ? 'bg-amber-600 text-white'
              : 'text-amber-200 hover:bg-amber-700 hover:text-white'
          )}
        >
          <div className="flex items-center gap-3">
            <UserCog className="h-5 w-5 flex-shrink-0" />
            <span>User Management</span>
          </div>
          {userMenuOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Submenu Items */}
        {userMenuOpen && (
          <div className="ml-4 space-y-1 border-l border-amber-700 pl-2">
            {userManagementSubItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-amber-500 text-white'
                      : 'text-amber-300 hover:bg-amber-700 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderNavContent = (isMobile: boolean = false) => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-amber-700 px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ETG Logo"
              width={44}
              height={44}
              className="h-11 w-auto"
              priority
              unoptimized
            />
            <div>
              <h1 className="text-sm font-medium text-white">ETG Agri Inputs</h1>
            </div>
          </div>
        )}
        {sidebarCollapsed && !isMobile && (
          <Image
            src="/logo.png"
            alt="ETG Logo"
            width={36}
            height={36}
            className="h-9 w-auto mx-auto"
            priority
            unoptimized
          />
        )}
        {/* Desktop toggle button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-amber-200 hover:bg-amber-700 hover:text-white hidden lg:flex"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
        {/* Mobile close button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileSidebar}
            className="text-amber-200 hover:bg-amber-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => renderNavItem(item, activeModule === item.id, sidebarCollapsed))}

        {isAdmin && (
          <>
            <div className="my-2 border-t border-amber-700 pt-2">
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Admin
                </p>
              )}
            </div>
            {renderUserManagementMenu(sidebarCollapsed)}
            {adminItems.map((item) => renderNavItem(item, activeModule === item.id, sidebarCollapsed))}
          </>
        )}
      </nav>

      {/* Footer */}
      {(!sidebarCollapsed || mobileSidebarOpen) && (
        <div className="border-t border-amber-700 p-4">
          <p className="text-xs text-amber-400">© 2026 ETG Agri Inputs</p>
          <p className="text-xs text-amber-500 mt-1">Developer - Tinotenda</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-amber-800 to-amber-900 text-white transition-transform duration-300 lg:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {renderNavContent(true)}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-amber-800 to-amber-900 text-white transition-all duration-300 flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {renderNavContent(false)}
      </aside>
    </>
  );
}
