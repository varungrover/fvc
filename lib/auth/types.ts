import type { Role } from '@/lib/types'

export interface SessionUser {
  id: string
  email: string
  role: Role
  ownershipId: string | null
  fullName: string
  mustChangePassword: boolean
}
