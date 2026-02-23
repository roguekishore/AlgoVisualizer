import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, User, Mail, KeyRound, ShieldCheck, Building2, GraduationCap, UserPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const API_BASE = "http://localhost:8080"

export function SignupForm({ className, ...props }) {
  const navigate = useNavigate()

  // form fields
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [graduationYear, setGraduationYear] = useState("")

  // institution autocomplete
  const [institutionOpen, setInstitutionOpen] = useState(false)
  const [institutionQuery, setInstitutionQuery] = useState("")
  const [institutionSuggestions, setInstitutionSuggestions] = useState([])
  const [selectedInstitution, setSelectedInstitution] = useState(null) // { id, name }
  const debounceRef = useRef(null)

  // status
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Debounced fetch of institution suggestions whenever popover is open
  useEffect(() => {
    if (!institutionOpen) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/institutions/search?q=${encodeURIComponent(institutionQuery)}&limit=10`
        )
        if (res.ok) {
          const data = await res.json()
          setInstitutionSuggestions(data)
        }
      } catch (err) {
        console.error("Institution search failed:", err)
      }
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [institutionQuery, institutionOpen])

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    try {
      const body = {
        username,
        email,
        password,
        ...(selectedInstitution && { institutionId: selectedInstitution.id }),
        ...(graduationYear && { graduationYear: parseInt(graduationYear, 10) }),
      }
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Signup failed")
        return
      }
      localStorage.setItem("user", JSON.stringify(data))
      navigate("/")
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              {/* Username */}
              <div className="grid gap-2">
                <Label htmlFor="username" className="flex items-center gap-1.5">
                  <User size={14} className="text-muted-foreground" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail size={14} className="text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <KeyRound size={14} className="text-muted-foreground" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-muted-foreground" />
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Institution – autocomplete combobox (optional) */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-muted-foreground" />
                  Institution{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={institutionOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedInstitution
                        ? selectedInstitution.name
                        : "Search your institution…"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Type to search…"
                        value={institutionQuery}
                        onValueChange={setInstitutionQuery}
                      />
                      <CommandList>
                        {institutionSuggestions.length === 0 ? (
                          <CommandEmpty>
                            {institutionQuery.length === 0
                              ? "Start typing to search…"
                              : "No institutions found."}
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {institutionSuggestions.map((inst) => (
                              <CommandItem
                                key={inst.id}
                                value={String(inst.id)}
                                onSelect={() => {
                                  setSelectedInstitution(
                                    selectedInstitution?.id === inst.id ? null : inst
                                  )
                                  setInstitutionOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedInstitution?.id === inst.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{inst.name}</span>
                                  {inst.university && (
                                    <span className="text-xs text-muted-foreground">
                                      {inst.university}
                                      {inst.district ? `, ${inst.district}` : ""}
                                      {inst.state ? `, ${inst.state}` : ""}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedInstitution && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline underline-offset-2 text-left"
                    onClick={() => setSelectedInstitution(null)}
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Graduation Year (optional) */}
              <div className="grid gap-2">
                <Label htmlFor="grad-year" className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-muted-foreground" />
                  Graduation Year{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="grad-year"
                  type="number"
                  placeholder="e.g. 2027"
                  min="1980"
                  max="2040"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : (
                  <span className="flex items-center gap-2"><UserPlus size={16} /> Create Account</span>
                )}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
