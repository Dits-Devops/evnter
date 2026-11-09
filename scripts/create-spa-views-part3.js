const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../src/components/views');

// ScannerView - wrapping scanner page
const scannerViewCode = `'use client';

import ScannerPage from '@/app/(organizer)/organizer/scanner/page';

export default function ScannerView() {
  return (
    <div className="min-h-screen bg-background">
      <ScannerPage />
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'ScannerView.tsx'), scannerViewCode, 'utf8');

// CreateEventView - wrapping create event page
const createEventViewCode = `'use client';

import CreateEventPage from '@/app/(organizer)/organizer/create-event/page';

export default function CreateEventView() {
  return (
    <div className="min-h-screen bg-background">
      <CreateEventPage />
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'CreateEventView.tsx'), createEventViewCode, 'utf8');

// UpgradeView - wrapping upgrade page
const upgradeViewCode = `'use client';

import UpgradePage from '@/app/(user)/upgrade/page';

export default function UpgradeView() {
  return (
    <div className="min-h-screen bg-background">
      <UpgradePage />
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'UpgradeView.tsx'), upgradeViewCode, 'utf8');

// AdminView - wrapping admin page
const adminViewCode = `'use client';

import AdminPage from '@/app/admin/page';

export default function AdminView() {
  return (
    <div className="min-h-screen bg-background">
      <AdminPage />
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'AdminView.tsx'), adminViewCode, 'utf8');

console.log('ScannerView, CreateEventView, UpgradeView, AdminView created successfully');
