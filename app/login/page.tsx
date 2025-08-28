"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "../utils/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

function LoadingSpinner() {
  return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
}

const Page = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/signup")
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const tid = toast.loading("Logging you in…")
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message, { id: tid })
        console.error("[SIGNIN_ERROR]:: ", error)
        return
      }

      toast.success("Logged in successfully", { id: tid })
      router.push("/")

      console.log("SIGNIN_SUCCESS:: ", data)
    } catch (error) {
      toast.error("Something went wrong", { id: tid, description: "Please try again." })
      console.error("[SIGNIN_ERROR]:: ", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithGoogle = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { queryParams: { access_type: "offline", prompt: "consent" } },
      })

      if (error) toast.error(error.message)
    } catch (err) {
      toast.error("Something went wrong", { description: "Please try again." })
      console.error("[SIGNUP_ERROR]:: ", err)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-sm bg-neutral-900 border-neutral-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
          <Link href="/signup" className="mt-2 text-sm underline hover:no-underline text-white">
            Don’t have an account? Sign up
          </Link>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-white">
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200" disabled={loading}>
              {loading && <LoadingSpinner />}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleWithGoogle} variant="outline" className="w-full text-white" disabled={loading}>
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Page
