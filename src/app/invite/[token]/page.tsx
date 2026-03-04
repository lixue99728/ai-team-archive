export const dynamic = 'force-dynamic'
import InviteForm from './invite-form'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  return <InviteForm params={params} />
}
