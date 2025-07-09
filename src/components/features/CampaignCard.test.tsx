import { render, screen } from '@testing-library/react';
import { CampaignCard } from './CampaignCard';

// Мокаем next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: {
    src: string;
    alt: string;
    className?: string;
  }) {
    return <div data-testid="mock-image" {...props} />;
  },
}));

type CampaignStatus = 'active' | 'completed' | 'planned';

interface MockCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  key_message: string;
  vertical: string;
  campaign_vertical: string;
  flight_period: {
    start_date: string;
    end_date: string;
  };
  status: CampaignStatus;
  budget: number;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
  };
  geo: string;
  audience: string;
  objectives: string[];
  channels: string[];
  materials: string[];
  links: { label: string; url: string }[];
  attachments: { label: string; url: string }[];
}

const mockCampaign: MockCampaign = {
  id: '1',
  campaign_name: 'Test Campaign',
  campaign_type: 'Test Type',
  key_message: 'Test Description',
  vertical: 'Test Vertical',
  campaign_vertical: 'Test Vertical',
  flight_period: {
    start_date: '2024-03-01',
    end_date: '2099-12-31',
  },
  status: 'active' as CampaignStatus,
  budget: 1000000,
  metrics: {
    impressions: 0,
    clicks: 0,
    ctr: 0,
    conversions: 0,
  },
  geo: 'Test Geo',
  audience: 'Test Audience',
  objectives: ['Test Objective'],
  channels: ['Test Channel'],
  materials: ['Test Material'],
  links: [{ label: 'Test Link', url: 'https://test.com' }],
  attachments: [
    { label: 'Test Attachment', url: 'https://test.com/attachment' },
  ],
};

describe('CampaignCard', () => {
  it('renders campaign name', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
  });

  it('renders campaign key message', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders campaign type', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText('Test Type')).toBeInTheDocument();
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
    const inactiveCampaign = {
      ...mockCampaign,
      flight_period: {
        ...mockCampaign.flight_period,
        end_date: '2000-01-01',
      },
    };
    render(<CampaignCard campaign={inactiveCampaign} />);
    expect(screen.queryByText('ON AIR')).not.toBeInTheDocument();
  });
});
