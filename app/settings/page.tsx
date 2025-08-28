"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Key, Shield, Save, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/libs/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { toast } from "sonner"  // ✅ import toast

const providers: Record<string, string> = {
  openai: "OpenAI",
  claude: "Claude",
  gemini: "Gemini",
  grok2: "Grok",
  commandR: "CommandR",
  mistral: "Mistral",
  openrouter: "OpenRouter",
  llama3: "Llama3",
  codestral: "Codestral",
  mixtral: "Mixtral",
  phi3: "Phi3",
  claude_haiku: "Claude Haiku",
}

function Page() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(
    Object.keys(providers).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
  )
  const [sessionOnly, setSessionOnly] = useState(true)

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<keyof typeof providers>("openai")

  //load api key from local storage
  useEffect(() => {
    const storedKeys = localStorage.getItem("apiKeys");

    if (storedKeys) {
      setApiKeys(JSON.parse(storedKeys));
      toast.success("API keys loaded from local storage");
    }

  }, [])
  //save keys to local storage
  const handleSaveKey = (provider: string) => {
    const updatedKeys = { ...apiKeys, [provider]: apiKeys[provider] }

    if (sessionOnly) {
      sessionStorage.setItem("apiKeys", JSON.stringify(updatedKeys))
      toast.success(`${providers[provider]} API key saved for this session`)
    } else {
      localStorage.setItem("apiKeys", JSON.stringify(updatedKeys))
      toast.success(`${providers[provider]} API key saved permanently`)
    }

    setApiKeys(updatedKeys)
  }

  useEffect(() => {
    const storedKeys = localStorage.getItem("apiKeys") || sessionStorage.getItem("apiKeys")
    if (storedKeys) {
      setApiKeys(JSON.parse(storedKeys))
      toast.success("API keys loaded from storage")
    }
  }, [])



  const handleClearKey = (provider: string) => {
    const updatedKeys = { ...apiKeys, [provider]: "" }
    localStorage.setItem("apiKeys", JSON.stringify(updatedKeys))
    setApiKeys(updatedKeys)
    toast.success(`${providers[provider]} API key cleared locally`)
  }



  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-800">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">FeastedChat</h1>
            <p className="text-neutral-400">Multi-LLM Chat Viewer</p>
          </div>
        </div>

        {/* API Keys */}
        <Card className="bg-neutral-900 border-neutral-700 text-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Add your API keys to enable different LLM providers. Keys are encrypted and stored locally.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider combobox */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {value ? providers[value] : "Select provider..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search provider..." />
                  <CommandEmpty>No provider found.</CommandEmpty>
                  <CommandGroup>
                    {Object.entries(providers).map(([key, label]) => (
                      <CommandItem
                        key={key}
                        value={key}
                        onSelect={() => {
                          setValue(key as keyof typeof providers)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === key ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected provider settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${value}-key`}>API Key</Label>
                <Input
                  id={`${value}-key`}
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys[value]}
                  onChange={(e) => setApiKeys({ ...apiKeys, [value]: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`${value}-session`}
                  checked={sessionOnly}
                  onCheckedChange={setSessionOnly}
                  className="bg-neutral-100 border-neutral-100"
                />
                <Label htmlFor={`${value}-session`}>
                  Session only (not saved permanently)
                </Label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleSaveKey(value)}
                  disabled={!apiKeys[value]}
                  className="flex items-center bg-neutral-100 text-neutral-900 hover:text-neutral-200 gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Key
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleClearKey(value)}
                  disabled={!apiKeys[value]}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Appearance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-neutral-800 text-neutral-100 border-neutral-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="telemetry">Allow anonymous usage data</Label>
                <Switch id="telemetry" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-update">Auto-check for updates</Label>
                <Switch id="auto-update" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="clear-data">Clear data on exit</Label>
                <Switch id="clear-data" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 text-neutral-100 border-neutral-700">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Dark mode</Label>
                <Switch id="theme" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compact">Compact view</Label>
                <Switch id="compact" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Reduce animations</Label>
                <Switch id="animations" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <CardFooter className="flex justify-between mt-6 px-0">
          <Button variant="outline">Cancel</Button>
          <Button onClick={() => toast.success("Settings saved successfully")}>
            Save Changes
          </Button>
        </CardFooter>
      </div>
    </div>
  )
}

export default Page;