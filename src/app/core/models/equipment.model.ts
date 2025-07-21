export interface Equipment {
  id: number;
  equipment_id: string;
  name: string;
  serial_number: string;
  engine_serial_number: string;
  model_year: number;
  make_name: string;
  type_name: string;
  isg_type_name: string;
  model_name: string;
  principal_id: string;
  organization_id: string;
  telematics_capable: boolean;
  archived: boolean;
  is_serial_number_certified: boolean;
  created_at: string;
  updated_at: string;
}

