import { ProfilePage } from "@/components/profile/ProfilePage"
import { notFound } from "next/navigation"

export default async function PublicProfileRoute({ params }: { params: { username: string } }) {
  // Mock data fetching logic
  // const { data: profile } = await supabase.from('profiles').select('*').eq('username', params.username).single()
  // if (!profile) return notFound()
  
  return (
    <main className="min-h-screen bg-page">
      <ProfilePage />
    </main>
  )
}
