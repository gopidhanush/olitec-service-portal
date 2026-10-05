import { redirect } from 'next/navigation'

export default async function ProductEntryPage({
  params,
}: {
  params: Promise<{ serial: string }>
}) {
  const { serial } = await params
  const value = decodeURIComponent(serial).trim().toUpperCase()

  if (!value) redirect('/register')

  redirect(`/register?identifier=${encodeURIComponent(value)}`)
}
