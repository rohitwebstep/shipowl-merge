import React from 'react';
import Update from '@/components/admin/countrymanagement/Update';

// ✅ Disable static rendering for this page, ensuring dynamic rendering
export const dynamic = 'force-dynamic';

export default function Page() {
  return <Update />;
}
