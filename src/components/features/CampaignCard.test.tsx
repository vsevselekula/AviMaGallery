import { render, screen } from '@testing-library/react';
import { CampaignCard } from './CampaignCard';
import { Campaign } from '@/lib/supabase';

// Мокаем next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

const mockCampaign: Campaign = {
  id: '1',
  title: 'Test Campaign',
  description: 'Test Description',
  level: 'T1',
  start_date: '2024-03-01',
  end_date: '2099-12-31',
  budget: 1000000,
  vertical_id: '1',
  created_at: '2024-02-15',
  updated_at: '2024-02-15',
};

describe('CampaignCard', () => {
  it('renders campaign title', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
  });

  it('renders campaign description', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders campaign level', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('T1')).toBeInTheDocument();
  });

  it('renders campaign start date', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('01.03.2024')).toBeInTheDocument();
  });

  it('shows ON AIR badge for active campaigns', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('ON AIR')).toBeInTheDocument();
  });

  it('does not show ON AIR badge for inactive campaigns', () => {
    const inactiveCampaign = { ...mockCampaign, end_date: '2000-01-01' };
    render(<CampaignCard campaign={inactiveCampaign} />);
    expect(screen.queryByText('ON AIR')).not.toBeInTheDocument();
  });
}); 