'use client';

import { Campaign } from '@/lib/types';
import React from 'react';
// import { Vertical } from '@/lib/types';
// import verticalsData from '@/data/verticals.json';
// import { ImageUpload } from './ImageUpload';
// import Image from 'next/image';
// import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
// import { ImageUpload } from './ImageUpload';
import { VideoPlayer } from './VideoPlayer';
// import React from 'react';
// import { cn } from '@/lib/utils';

interface CampaignModalProps {
  campaign: Campaign;
  onClose: () => void;
  // onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function CampaignModal({
  campaign,
  onClose,
  // onCampaignUpdated,
}: CampaignModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedCampaign, setEditedCampaign] = useState<Campaign>({
  //   ...campaign,
  //   video_url: campaign.video_url || null,
  // });
  // const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  // const [isSaving, setIsSaving] = useState(false);
  // const [linksText, setLinksText] = useState('');
  // const [attachmentsText, setAttachmentsText] = useState('');

  // Collapsible для тестов
  // const [showPre, setShowPre] = React.useState(false);
  // const [showPost, setShowPost] = React.useState(false);

  // Helper для тегов
  const Tag = ({ children, color = 'gray' }: { children: React.ReactNode; color?: string }) => (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${color}-700 text-white mr-2 mb-1`}>{children}</span>
  );

  // Helper для секций
  const Section = ({ title, icon, children, className = '' }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) => (
    <section className={`bg-gray-800 rounded-xl p-6 flex flex-col gap-2 shadow ${className}`}>
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">{icon}{title}</h3>
      {children}
    </section>
  );

  useEffect(() => {
    console.log('CampaignModal: Campaign prop received/changed:', campaign);
    // setEditedCampaign({
    //   ...campaign,
    //   video_url: campaign.video_url || null,
    // });
    // if (Array.isArray(campaign.links)) {
    //   setLinksText(
    //     Array.isArray(campaign.links)
    //       ? campaign.links.map((link) => `${link.label} - ${link.url}`).join('\n')
    //       : ''
    //   );
    // } else {
    //   setLinksText('');
    // }
    // if (Array.isArray(campaign.attachments)) {
    //   setAttachmentsText(
    //     Array.isArray(campaign.attachments)
    //       ? campaign.attachments.map((attachment) => `${attachment.label} - ${attachment.url}`).join('\n')
    //       : ''
    //   );
    // } else {
    //   setAttachmentsText('');
    // }
  }, [campaign]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      if (supabaseUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();
        if (roleData) {
          // setUserRole(roleData.role);
        }
      }
    };
    fetchUserRole();
  }, []);

  // const handleInputChange = (...args: any[]) => {};
  // const handleDateChange = (...args: any[]) => {};
  // const handleArrayChange = (...args: any[]) => {};
  // const handleTextareaChange = (...args: any[]) => {};
  // const handleSave = async () => {};
  // const handleImageUpload = (...args: any[]) => {};
  // const handleVideoTypeChange = (...args: any[]) => {};
  // const Collapsible = (...args: any[]) => null;

  // Helper для ссылок
  const renderLinks = (
    links: { label?: string; url?: string }[] | Record<string, string> | string | null | undefined
  ) => {
    if (!links) return <span className="text-gray-400">Нет данных</span>;
    if (Array.isArray(links)) {
      return (
        <ul className="list-disc ml-6">
          {links.map((l, i) => (
            <li key={i}>
              {typeof l === 'object' && l !== null && 'label' in l && 'url' in l && l.label && l.url ? (
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{l.label}</a>
              ) : typeof l === 'object' && l !== null && 'url' in l && l.url ? (
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{l.url}</a>
              ) : typeof l === 'object' && l !== null && 'label' in l && l.label ? l.label : String(l)}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof links === 'object' && links !== null) {
      return (
        <ul className="list-disc ml-6">
          {Object.entries(links).map(([k, v]) => (
            <li key={k}>
              {typeof v === 'string' && v.startsWith('http') ? (
                <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{k}</a>
              ) : typeof v === 'string' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`}
            </li>
          ))}
        </ul>
      );
    }
    return <span>{String(links)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm !mt-0">
      <div ref={modalRef} className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full p-8 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Основная информация — на всю ширину */}
          <Section title="Основное" icon={<span>📢</span>} className="md:col-span-2">
            <div className="text-2xl font-bold mb-2 text-white">{campaign.campaign_name}</div>
            <div className="flex gap-2 flex-wrap mb-2">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={getVerticalColorClass(campaign.campaign_vertical)}
              >
                {campaign.campaign_vertical}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium border border-white text-white bg-transparent">
                {campaign.campaign_type}
              </span>
              {campaign.type && <Tag color="indigo">{campaign.type}</Tag>}
              {campaign.slogan && <Tag color="purple">{campaign.slogan}</Tag>}
            </div>
            {campaign.flight_period?.start_date && campaign.flight_period?.end_date && (
              <div className="text-sm text-gray-300 mb-2">
                В эфире с {format(new Date(campaign.flight_period.start_date), 'dd.MM.yyyy', { locale: ru })} по {format(new Date(campaign.flight_period.end_date), 'dd.MM.yyyy', { locale: ru })}
              </div>
            )}
            {campaign.description && <p className="text-gray-200 mb-1">{campaign.description}</p>}
            {campaign.key_message && <p className="text-gray-400 italic mb-1">{campaign.key_message}</p>}
          </Section>

          {/* Новый ряд: периоды, цели, каналы */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <Section title="Периоды и аудитория" icon={<span>📅</span>}>
              <div className="mt-2"><b>Гео:</b> {campaign.geo || <span className="text-gray-500">Нет данных</span>}</div>
              <div><b>Аудитория:</b> {campaign.audience || <span className="text-gray-500">Нет данных</span>}</div>
            </Section>
            <Section title="Цели и задачи" icon={<span>🎯</span>}>
              <div className="mb-2 text-base font-normal text-white">
                {Array.isArray(campaign.targets) && campaign.targets.length > 0
                  ? (campaign.targets.length === 1
                      ? campaign.targets[0]
                      : campaign.targets.map((t, i) => <p key={i} className="mb-2 last:mb-0">{t}</p>)
                    )
                  : <span className="text-gray-500">Нет данных</span>}
              </div>
            </Section>
            <Section title="Каналы и медиа" icon={<span>📡</span>}>
              <div className="flex flex-wrap gap-2 mb-2">{(campaign.channels ?? []).length > 0 ? (campaign.channels ?? []).map((c, i) => <Tag key={i} color="blue">{c}</Tag>) : <span className="text-gray-500">Нет данных</span>}</div>
              {campaign.image_url && <img src={campaign.image_url} alt="Картинка кампании" className="rounded-lg max-h-40 object-contain mx-auto mb-2" />}
              {campaign.video_url && <VideoPlayer videoUrl={campaign.video_url} />}
            </Section>
          </div>

          {/* Ссылки и тесты в один ряд */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <Section title="Ссылки" icon={<span>🔗</span>} className="md:col-span-1">
              {renderLinks(campaign.links)}
            </Section>
            <Section title="Тесты" icon={<span>🧪</span>} className="md:col-span-2">
              {Array.isArray(campaign.pre_tests) && campaign.pre_tests.length > 0 ? (
                <ul className="list-disc ml-6">
                  {campaign.pre_tests.map((item: unknown, i: number) => {
                    if (item && typeof item === 'object' && 'label' in item && 'url' in item) {
                      const testItem = item as { label: string; url: string };
                      return (
                        <li key={i}>
                          <a href={testItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{testItem.label}</a>
                        </li>
                      );
                    } else if (typeof item === 'string') {
                      return <li key={i}>{item}</li>;
                    }
                    return null;
                  })}
                </ul>
              ) : campaign.pre_tests && typeof campaign.pre_tests === 'object' && !Array.isArray(campaign.pre_tests) ? (
                <ul className="list-disc ml-6">
                  {Object.entries(campaign.pre_tests).map(([label, value]: [string, unknown], i) => (
                    <li key={i}>
                      {typeof value === 'string' && value.startsWith('http') ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{label}</a>
                      ) : (
                        <span>{label}: {String(value)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : typeof campaign.pre_tests === 'string' ? (
                <div>{campaign.pre_tests}</div>
              ) : !campaign.pre_tests ? (
                <span className="text-gray-500">Нет данных</span>
              ) : null}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
