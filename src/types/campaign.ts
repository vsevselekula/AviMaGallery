export interface Campaign {
  id: string;
  title: string;
  description: string;
  level: string;
  start_date: string;
  end_date: string;
  budget: number;
  vertical_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
} 