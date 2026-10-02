export const dynamic = 'force-dynamic'

import { NewGatewayForm } from '@/components/NewGatewayForm'

export default function NewGatewayPage() {
  return (
    <>
      <div className="dash__header">
        <h1>New gateway</h1>
      </div>
      <NewGatewayForm />
    </>
  )
}
