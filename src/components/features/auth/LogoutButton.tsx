import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.push('/auth/login');
      router.refresh();
    } catch (err) {
      console.error('Ошибка при выходе из системы:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={loading} className={className}>
      {loading ? 'Выход...' : 'Выйти'}
    </Button>
  );
}
