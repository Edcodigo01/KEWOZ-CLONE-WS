import { lazy, Suspense } from 'react';
import UserCountCard from './DashboardComponents/cards/UserCountCard';
import GroupCountCard from './DashboardComponents/cards/GroupCountCard';
import AudioCountCard from './DashboardComponents/cards/AudioCallCountCard';
import VideoCountCard from './DashboardComponents/cards/VideoCallCountCard';

const YearlyUserData = lazy(() => import('./DashboardComponents/YearlyUserData'));
const CountryUserActiveCardLast30mins = lazy(() => import('@/components/ui/CountryUserActiveCard'));
const PlatformActivityChart = lazy(() => import('@/components/ui/Platformactivitycard'));
const WeeklyNewUsers = lazy(() => import('@/components/ui/WeeklyNewUser'));
const RecentUserList = lazy(() => import('./DashboardComponents/RecentUserList').then(m => ({ default: m.RecentUserList })));
const ActiveUser = lazy(() => import('@/components/ui/DailyActiveUser'));
const CountryUserCard = lazy(() => import('@/components/ui/CountryUserCard'));
const RecentGroupList = lazy(() => import('./DashboardComponents/RecentGroupList').then(m => ({ default: m.RecentGroupList })));
const YearlyCallData = lazy(() => import('./DashboardComponents/YearlyCallData'));

const ChartFallback = () => <div className="h-40 w-full bg-secondary/30 rounded animate-pulse" />;

export default function DashboardPage() {
  return (
    <div className="h-full w-full grid gap-6 p-4 md:p-6">
      {/* Cards Row: 4 cards in one row on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <UserCountCard className="w-full" />
        <GroupCountCard className="w-full" />
        <AudioCountCard className="w-full" />
        <VideoCountCard className="w-full" />
      </div>

      {/* Charts */}
      <div className="w-full">
        <Suspense fallback={<ChartFallback />}>
          <YearlyUserData />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <Suspense fallback={<ChartFallback />}>
            <CountryUserActiveCardLast30mins
              title="Usuarios Activos por País"
              colors={['#e0f7ff', '#0891b2']}
            />
          </Suspense>
        </div>
        <div className="col-span-1">
          <Suspense fallback={<ChartFallback />}>
            <PlatformActivityChart />
          </Suspense>
        </div>
        <div className='col-span-1'>
          <Suspense fallback={<ChartFallback />}>
            <WeeklyNewUsers />
          </Suspense>
        </div>
        <div className='col-span-1 md:col-span-1 lg:col-span-3'>
          <Suspense fallback={<ChartFallback />}>
            <RecentUserList />
          </Suspense>
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <Suspense fallback={<ChartFallback />}>
            <ActiveUser />
          </Suspense>
        </div>
        <div className='col-span-1 md:col-span-1 lg:col-span-2'>
          <Suspense fallback={<ChartFallback />}>
            <CountryUserCard />
          </Suspense>
        </div>
        <div className='col-span-1 md:col-span-1 lg:col-span-2'>
          <Suspense fallback={<ChartFallback />}>
            <RecentGroupList />
          </Suspense>
        </div>
        <div className='col-span-1 md:col-span-2 lg:col-span-4'>
          <Suspense fallback={<ChartFallback />}>
            <YearlyCallData />
          </Suspense>
        </div>
      </div>
    </div>
  );
}