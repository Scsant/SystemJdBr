import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://qktpnoekulrlporjoqqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHBub2VrdWxybHBvcmpvcXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc1MzU2NSwiZXhwIjoyMDY3MzI5NTY1fQ.al9re5AAvitwKi2dUjH1DdqlTKCodUBt-kyD9RaSX1o'
); 