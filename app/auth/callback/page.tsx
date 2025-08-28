"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error("Error exchanging code:", error)
        } else {
          router.push("/") 
        }
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <p>Confirming your email…</p>
    </div>
  )
}
