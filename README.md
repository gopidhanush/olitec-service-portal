# OLITEC Service Portal

Customer product registration, warranty and service portal for OLITEC solar inverters.

## Current scope

- QR-based product identification and serial-number lookup
- Customer product registration and warranty records
- Product Registration History for administrators
- Service complaint registration, tracking and closure workflow
- Customer and internal notification emails through the Supabase notification worker
- Product master and controlled serial-number generation
- Staff approval and module permissions for administration

## Project structure

```text
app/
  admin/                 Admin portal routes
  register/              Customer registration flow
  service/               Customer service and complaint routes
  warranty/              Warranty lookup and warranty details
  styles/                Global styles grouped by feature
    base/                Site-wide foundations
    layout/              Shared page/layout adjustments
    admin/               Admin portal styles
    customer/            Customer portal styles
    registration/        Product registration styles
    mobile/              Responsive and mobile styles
    pages/               Supporting page styles
    home/                Home-page related styles

components/              Shared React components
lib/                     Supabase client and server utilities
public/                  Logos, favicon and product/hero assets
sql/                     Reference SQL scripts used during setup/maintenance
supabase/
  functions/             Edge Functions
  migrations/            Database migrations, kept in timestamp order
```

## Where to make common changes

- **Logo / favicon / public images:** `public/`
- **Customer portal appearance:** `app/styles/customer/`
- **Registration page appearance:** `app/styles/registration/`
- **Admin appearance:** `app/styles/admin/`
- **Mobile layout:** `app/styles/mobile/`
- **Shared layout and site-wide styling:** `app/styles/base/` and `app/styles/layout/`
- **QR scanner:** `components/QRScanner.tsx`
- **Supabase client:** `lib/supabase.ts`
- **Email notification worker:** `supabase/functions/notification-worker/index.ts`
- **Database changes:** add a new timestamped file under `supabase/migrations/`

Keep business data and notification recipients in Supabase configuration tables or environment variables rather than scattering values through page components.

## Development

The application uses Next.js with a GitHub → Vercel deployment workflow and Supabase as the backend.

Before production changes, run the normal type-check/build process and test the customer registration, warranty, complaint and admin flows.

## Security

Do not commit Supabase service-role keys, database passwords, Resend API keys, worker tokens or other secrets. Frontend configuration should use public/publishable Supabase credentials through environment variables. Server-only credentials belong in Supabase Edge Function secrets or the appropriate server environment.
