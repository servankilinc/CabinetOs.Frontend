import { Fragment } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export type AppBreadcrumbProps = {
  links?: {
    href: string;
    label: string;
  }[];
  page: string;
};

export default function AppBreadcrumb({ data }: { data: AppBreadcrumbProps }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {data.links?.map((link, index) => (
          <Fragment key={`breadcrumb-link-${index}`}>
            <BreadcrumbItem>
              <BreadcrumbLink href={link.href}>{link.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className='hidden md:block' />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{data.page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
