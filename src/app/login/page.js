'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";
import Link from "next/link"
import FloatingIconsBackground from "@/components/FloatingIconsBackground/FloatingIconsBackground"
import "./login.css"

export default function LoginPage() {
  const router = useRouter()
  const { showSnackbar } = useAppSnackbar();

  const [usernameOrEmail, setUsernameOrEmail] = useState("") 
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!usernameOrEmail.trim()) newErrors.usernameOrEmail = "Username or email is required"
    if (!password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const value = usernameOrEmail.trim()
    const emailCheck = value.includes("@") && value.includes(".")

    const commonCallbacks = {
      onResponse: () => {
        setIsSubmitting(false)
      },
      onSuccess: () => {
        router.push("/home")
      },
      onError: (ctx) => {
        setIsSubmitting(false)

        let message = "Login failed"

        if (ctx && ctx.error) {
          if (typeof ctx.error.message === "string" && ctx.error.message.trim() !== "") {
            message = ctx.error.message
          }
        }

        setErrors((prev) => {
          const nextErrors = { ...prev }
          nextErrors.form = message
          return nextErrors
        })
        showSnackbar(message, "error");
      },
    }

    if (emailCheck) {
      await signIn.email(
        { email: value, password },
        commonCallbacks
      )
      return
    }

    await signIn.username(
      { username: value, password },
      commonCallbacks
    )
  }

  return (
    <div className="login-container">
      <FloatingIconsBackground />
      <div className="login-card">
        <h1>Login</h1>
        <p className="login-subtitle">Welcome back! Sign in to your account.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Username Or Email:</label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              className={errors.usernameOrEmail ? 'input-error' : ''}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              autoComplete="username"
            />
            {errors.usernameOrEmail && (
              <p className="error-message">{errors.usernameOrEmail}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className={errors.password || errors.form ? 'input-error' : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
            {errors.form && <p className="error-message">{errors.form}</p>}
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-link">
          Not a member? <Link href="/signup">Join here</Link>
        </p>
      </div>
    </div>
  )
}
