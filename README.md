# OLITEC Service Portal

Customer product registration, warranty and service portal for OLITEC solar inverters.

## Current scope
- QR-based product identification
- Secure Supabase product verification
- Product purchase registration UI
- Warranty registration
- Complaint/service workflow (planned)

## Development
The application is being developed with a GitHub → Vercel workflow and Supabase as the backend.

## Security
Do not commit Supabase service-role keys, database passwords, or other secrets. Frontend configuration should use public/publishable Supabase credentials through environment variables.