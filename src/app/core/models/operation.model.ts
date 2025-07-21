export interface Operation {
  id: string;
  plot_id?: string;
  operation_type?: string;
  start_date?: string;
  end_date?: string;
  operation_id?: string;
  plots?: {
    name: string;
    farm_id: string;
  };
} 