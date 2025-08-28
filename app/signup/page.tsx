"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "../utils/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

function LoadingSpinner() {
  return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
}

const Page = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const tid = toast.loading("Creating your account…")

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })

      if (error) {
        toast.error("Signup failed", { id: tid, description: error.message })
        console.log("[SIGNUP_ERROR]:: ", error)
        return
      }

      toast.success("Account created successfully 🎉", {
        id: tid,
        description: "Please check your email to verify your account.",
      })
      console.log("SIGNUP_SUCCESS:: ", data)

      router.push("/login") // ✅ safe redirect
    } catch (error) {
      toast.error("Something went wrong", { id: tid, description: "Please try again." })
      console.log("[SIGNUP_ERROR]:: ", error)
    } finally {
      setLoading(false)
    }
  }


  const handleWithGoogle = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        toast.error("Something went wrong", { description: error.message })
      }
    } catch (err) {
      toast.error("Something went wrong", { description: "Please try again." })
      console.log("[GOOGLE_SIGNUP_ERROR]:: ", err)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-sm bg-neutral-900 border-neutral-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Create an account</CardTitle>
          <CardDescription>Enter your details below to sign up</CardDescription>
          <div className="mt-2">
            <span className="text-white font-medium mr-1">Already have an account?</span>
            <Button variant="link" className="px-0 text-white">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-neutral-200"
              disabled={loading}
            >
              {loading && <LoadingSpinner />}
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleWithGoogle} variant="outline" className="w-full">
            Sign up with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Page
