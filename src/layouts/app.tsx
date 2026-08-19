import { Outlet } from 'react-router';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/custom/app-sidebar';
import AppBreadcrumb from '@/components/custom/app-breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main>
          <header className='flex h-16 shrink-0 items-center gap-2'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
              <AppBreadcrumb page='current page' links={[{ href: '/', label: 'Home' }]} />
            </div>
          </header>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
