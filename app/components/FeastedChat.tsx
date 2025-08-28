"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "../utils/supabase/client"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Sparkles, Copy, Check, LogOut } from "lucide-react"
import { toast } from "sonner"

const modelMap: Record<string, string> = {
  "gpt-4o-mini": "gpt-4o-mini",
  "claude": "Claude 3.5 Sonnet",
  "claude_haiku": "Claude Haiku",
  "grok2": "Grok2",
  "gemini": "Gemini 1.5 Flash",
  "commandR": "Command R+",
  "mistral": "Mistral Large",
  "openrouter": "OpenRouter",
  "llama3": "Llama3",
  "codestral": "Codestral",
  "mixtral": "Mixtral 8x7B",
  "phi3": "Phi-3",
}

interface ApiResponse {
  choices?: Array<{ message?: { content?: string } }>
  output_text?: string
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  response?: string
  text?: string
}

export default function FeastedChat() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const [models, setModels] = useState({
    gpt4omini: false,
    claude: false,
    claude_haiku: false,
    grok2: false,
    gemini: false,
    commandR: false,
    mistral: false,
    openrouter: false,
    llama3: false,
    codestral: false,
    mixtral: false,
    phi3: false,
  })
  const [userExists, setUserExists] = useState(false)
  const [Keys, setKeys] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, string>>({})

  // Check user exists
  useEffect(() => {
    const checkUserExists = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.log(error.message)
        toast.error("Error checking user session")
      }

      setUserExists(!!data.user)
    }
    checkUserExists()
  }, [])

  // Logout
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserExists(false)
    toast.success("Logged out successfully")
  }

  const toggleModel = (key: keyof typeof models) => {
    setModels({ ...models, [key]: !models[key] })
    toast.info(`${key} ${models[key] ? "disabled" : "enabled"}`)
  }

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeout: number
  ) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      return response
    } finally {
      clearTimeout(id)
    }
  }

  const normalizeResponse = (modelKey: string, data: unknown): string => {
    const d = data as ApiResponse
    if (d?.choices?.[0]?.message?.content) return d.choices[0].message.content
    if (d?.output_text) return d.output_text
    if (d?.candidates?.[0]?.content?.parts?.[0]?.text)
      return d.candidates[0].content.parts[0].text
    if (d?.response) return d.response
    if (d?.text) return d.text
    return "⚠ No response received"
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt before generating")
      return
    }
    if (activeModelsCount === 0) {
      toast.error("Select at least one model to generate responses")
      return
    }

    const enabledModels = Object.entries(models)
      .filter(([, value]) => value)
      .map(([key]) => key)

    setIsGenerating(true)
    toast("Generating responses...")

    for (const modelKey of enabledModels) {
      try {
        const apikey = Keys[modelKey]

        if (!apikey) {
          setResponses((prev) => ({
            ...prev,
            [modelKey]: "⚠ No API key set",
          }))
          continue
        }

        const res = await fetchWithTimeout(
          "/api/response",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apikey}`,
            },
            body: JSON.stringify({ model: modelMap[modelKey], apikey, prompt }),
          },
          15000
        )

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const data = await res.json()
        const finalRes = normalizeResponse(modelKey, data)
        setResponses((prev) => ({
          ...prev,
          [modelKey]: finalRes,
        }))

        console.log(`[${modelKey}] SUCCESS::`, data)

      } catch (err: unknown) {
        const error = err as Error & { name: string }
        const msg =
          error.name === "AbortError"
            ? "⚠ Request timed out (took too long)"
            : "⚠ Something went wrong"

        setResponses((prev) => ({
          ...prev,
          [modelKey]: msg,
        }))

        toast.error(`${modelKey} failed`, {
          description: error.name === "AbortError" ? "Request timed out" : "Please try again.",
        })

        console.error(`[${modelKey}] ERROR::`, err)
      }
    }

    setIsGenerating(false)
  }

  const handleCopy = (modelKey: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedStates({ ...copiedStates, [modelKey]: true })
    toast.success(`Copied response from ${modelKey}`)
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [modelKey]: false })
    }, 2000)
  }

  const handleSelectAll = () => {
    const allTrue = Object.keys(models).reduce((acc, key) => {
      acc[key as keyof typeof models] = true
      return acc
    }, {} as typeof models)
    setModels(allTrue)
    toast.success("All models selected")
  }

  const handleDeselectAll = () => {
    const allFalse = Object.keys(models).reduce((acc, key) => {
      acc[key as keyof typeof models] = false
      return acc
    }, {} as typeof models)
    setModels(allFalse)
    toast("All models deselected")
  }

  const activeModelsCount = Object.values(models).filter(Boolean).length

  // Load API keys from localStorage
  const loadApiKeys = useCallback(() => {
    try {
      const storedRaw = localStorage.getItem("apiKeys")
      if (!storedRaw) {
        setKeys({})
        return
      }

      const stored = JSON.parse(storedRaw) as Record<string, string>

      const providerToModelKey: Record<string, string> = {
        openai: "gpt-4o-mini",
        claude: "claude",
        claude_haiku: "claude_haiku",
        grok2: "grok2",
        gemini: "gemini",
        commandR: "commandR",
        mistral: "mistral",
        openrouter: "openrouter",
        llama3: "llama3",
        codestral: "codestral",
        mixtral: "mixtral",
        phi3: "phi3",
      }

      const mapped: Record<string, string> = {}

      // First pass: direct model key matches
      for (const mk of Object.keys(models)) {
        if (stored[mk]) {
          mapped[mk] = stored[mk]
        }
      }

      // Second pass: provider key mapping
      for (const [providerKey, value] of Object.entries(stored)) {
        const mk = providerToModelKey[providerKey] ?? providerKey

        if (!mapped[mk] && value) {
          mapped[mk] = value
        }
      }

      setKeys(mapped)
      toast.success("API keys loaded from local storage")
    } catch (err) {
      console.error("Failed to load API keys from localStorage", err)
      setKeys({})
    }
  }, [models])

  useEffect(() => {
    loadApiKeys()
  }, [loadApiKeys])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold">
            FeastedChat{" "}
            <span className="text-neutral-400 hidden md:inline">Multi-LLM Chat Viewer</span>
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <Link href="/settings">Settings</Link>
          </Button>

          {userExists ? (
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Prompt input */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Input
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-neutral-900 border-neutral-700 text-neutral-100 flex-1 py-5"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || activeModelsCount === 0}
          className="py-5 px-6"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>

      {/* Model selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium">Select Models ({activeModelsCount} selected)</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[
            ["gpt-4o-mini", "gpt-4o-mini"],
            ["claude", "Claude 3.5 Sonnet"],
            ["claude_haiku", "Claude Haiku"],
            ["grok2", "Grok-2"],
            ["gemini", "Gemini 1.5 Flash"],
            ["commandR", "Command R+"],
            ["mistral", "Mistral Small"],
            ["openrouter", "OpenRouter"],
            ["llama3", "Llama 3"],
            ["codestral", "Codestral"],
            ["mixtral", "Mixtral 8x7B"],
            ["phi3", "Phi-3"],
          ].map(([key, label]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-2 rounded-md bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors"
            >
              <Switch
                id={key}
                checked={models[key as keyof typeof models]}
                onCheckedChange={() => toggleModel(key as keyof typeof models)}
                className="data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor={key} className="text-xs cursor-pointer flex-1">
                {label}
              </Label>
              <span
                className={`text-xs px-2 py-1 rounded-full ${Keys[key]
                  ? "bg-green-700 text-green-300"
                  : "bg-neutral-700 text-neutral-400"
                  }`}
              >
                {Keys[key] ? "✓" : "X"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Responses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(models)
          .filter(([, active]) => active)
          .map(([key]) => (
            <Card
              key={key}
              className="bg-neutral-900 border border-neutral-700 flex flex-col transition-all hover:border-neutral-600"
            >
              {/* Header */}
              <CardHeader className="py-3 bg-neutral-800 flex flex-row justify-between items-center">
                <CardTitle className="text-sm capitalize flex items-center gap-2">
                  {key.replace("_", " ")}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${Keys[key]
                      ? "bg-green-700 text-green-300"
                      : "bg-neutral-700 text-neutral-400"
                      }`}
                  >
                    {Keys[key] ? "✓" : "X"}
                  </span>
                </CardTitle>
              </CardHeader>

              {/* Response Content */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                {isGenerating && !responses[key] ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-neutral-700 rounded animate-pulse w-1/2"></div>
                    <div className="h-3 bg-neutral-700 rounded animate-pulse w-full"></div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-neutral-200 leading-relaxed font-mono">
                    {responses[key] || "⚠ No response yet"}
                  </pre>
                )}
              </CardContent>

              {/* Footer */}
              <div className="flex justify-end items-center px-4 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(key, responses[key] || "")}
                  disabled={!responses[key]}
                  className="flex items-center gap-1 bg-neutral-900 text-neutral-50 border border-neutral-700 hover:bg-neutral-00 transition-colors"
                >
                  {copiedStates[key] ? (
                    <>
                      <Check className="h-4 w-4 text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {activeModelsCount === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select at least one model to get started</p>
        </div>
      )}
    </div>
  )
}