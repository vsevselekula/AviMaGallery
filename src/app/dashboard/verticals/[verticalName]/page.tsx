'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vertical, Campaign, TeamMember } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getVerticalColorClass } from '@/lib/utils';
import { CampaignList } from '@/components/features/CampaignList';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface VerticalPageProps {
  params: { verticalName: string };
}

export default function VerticalPage({ params }: VerticalPageProps) {
  const [vertical, setVertical] = useState<Vertical | null>(null);
  const [verticalCampaigns, setVerticalCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();
        if (roleData) {
          setIsAdmin(roleData.role === 'admin' || roleData.role === 'super_admin');
        }
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchVerticalData = async () => {
      setLoading(true);
      try {
        // Получаем данные о вертикали
        const { data: verticalData, error: verticalError } = await supabase
          .from('verticals')
          .select('*')
          .eq('name', decodeURIComponent(params.verticalName))
          .single();

        if (verticalError) {
          console.error('Error fetching vertical:', verticalError);
          router.push('/dashboard');
          return;
        }

        setVertical(verticalData);

        // Получаем кампании для этой вертикали
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('campaign_vertical', decodeURIComponent(params.verticalName))
          .order('flight_period->>start_date', { ascending: false });

        if (campaignsError) {
          console.error('Error fetching campaigns:', campaignsError);
        } else {
          setVerticalCampaigns(campaignsData as Campaign[]);
        }
      } catch (error) {
        console.error('Error in fetchVerticalData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerticalData();
  }, [params.verticalName, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center text-white text-xl">
        <LoadingSpinner />
        <p className="mt-4">Загрузка данных направления...</p>
      </main>
    );
  }

  if (!vertical) {
    return (
      <main className="min-h-screen bg-gray-900 p-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Направление не найдено</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Вернуться на дашборд
          </button>
        </div>
      </main>
    );
  }

  const verticalColorStyle = getVerticalColorClass(vertical.name);

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{vertical.name}</h1>
        <p className="text-gray-400">{vertical.description}</p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Состав команды</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vertical.team_members && vertical.team_members.map((member: TeamMember) => (
            <div key={member.name} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 shadow-md">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {member.initials}
              </div>
              <div>
                <p className="text-white text-lg font-semibold">{member.name}</p>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Кампании направления "{vertical.name}"</h2>
        {verticalCampaigns.length > 0 ? (
          <CampaignList campaigns={verticalCampaigns} hideVerticalFilter={true} isAdmin={isAdmin} />
        ) : (
          <p className="text-gray-400">Кампаний в этом направлении пока нет.</p>
        )}
      </section>
    </main>
  );
} 