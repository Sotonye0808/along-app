"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Mail, Lock } from "lucide-react"
import { AppButton, AppInput, AppCard, AppDivider, AppAlert } from "@/app/components/ui"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Invalid email or password")
      }
      window.location.href = "/"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppCard variant="elevated" className="p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome back</h1>
        <p className="text-sm text-text-secondary">Sign in to continue to Along</p>
      </div>

      {error && (
        <AppAlert variant="error" className="mb-6" dismissible onDismiss={() => setError("")}>
          {error}
        </AppAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AppInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })) }}
          error={fieldErrors.email}
        />
        <div>
          <AppInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })) }}
            error={fieldErrors.password}
          />
          <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-dark transition-colors duration-fast">
              Forgot password?
            </Link>
          </div>
        </div>

        <AppButton type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Sign In
        </AppButton>
      </form>

      <AppDivider className="my-6">or continue with</AppDivider>

      <AppButton
        type="button"
        variant="secondary"
        fullWidth
        className="bg-white border-border text-text-primary hover:bg-bg-elevated"
        onClick={() => { window.location.href = '/api/auth/google' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </AppButton>

      <Link href="/home" className="block text-center text-sm text-text-secondary hover:text-text-primary mt-4 underline underline-offset-2">
        Continue as guest
      </Link>

      <p className="text-center text-sm text-text-secondary mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:text-primary-dark transition-colors duration-fast">
          Create one
        </Link>
      </p>
    </AppCard>
  )
}
