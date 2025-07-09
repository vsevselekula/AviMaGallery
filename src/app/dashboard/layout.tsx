import { Require2FA } from '@/components/features/auth/Require2FA';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Require2FA>
      {children}
    </Require2FA>
  );
} 