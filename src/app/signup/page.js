'use client'

import { useState } from "react"
import "./signup.css"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp, isUsernameAvailable } from "@/lib/auth-client";
import { useAppSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";
import FloatingIconsBackground from "@/components/FloatingIconsBackground/FloatingIconsBackground";

export default function SignupPage() {
  const router = useRouter()
  const { showSnackbar } = useAppSnackbar();

  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) newErrors.name = "Name is required"
    if (!username.trim()) newErrors.username = "Username is required"
    if (!email.trim()) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"

    if (!confirmPassword) {
      newErrors.confirmPassword = "You must confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkUsernameAvailability = async (value) => {
    const candidate = value.trim()
    if (!candidate) return false

    if (candidate.length < 5) {
      setErrors((prev) => ({ ...prev, username: "Username must be at least 5 characters." }))
      return false
    }

    try {
      const { data, error } = await isUsernameAvailable({ username: candidate })

      // this error is for if the request fails
      if (error) {
        setErrors((prev) => {
          const nextErrors = { ...prev }
          nextErrors.username = "Could not check username availability. Try again."
          return nextErrors
        })

        // snackbar for backend failure
        showSnackbar("Could not check username availability. Try again.", "error");

        return false
      }

      // if the username is taken
      if (!data?.available) {
        setErrors((prev) => {
          const nextErrors = { ...prev }
          nextErrors.username = "That username is already taken"
          return nextErrors
        })
        return false
      }

      // clearing errors
      setErrors((prev) => {
        const nextErrors = { ...prev }
        if (nextErrors.username) delete nextErrors.username
        return nextErrors
      })

      return true
    } catch (err) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        nextErrors.username = "Could not check username availability. Try again."
        return nextErrors
      })

      showSnackbar("Could not check username availability. Try again.", "error");

      return false
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    const ok = await checkUsernameAvailability(username)
    if (!ok) {
      setIsSubmitting(false)
      return
    }

    await signUp.email(
      {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      },
      {
        onResponse: () => {
          setIsSubmitting(false)
        },
        onSuccess: () => {
          setIsSubmitting(false)
          router.push("/account")
        },
        onError: (ctx) => {
          setIsSubmitting(false)

          let message = "Sign up failed"

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
        }
      }
    )
  }



  return (
    <div className="signup-container">
      <FloatingIconsBackground />
      <div className="signup-card">
        <h1>Sign up</h1>
        <p className="signup-subtitle">Create your account to get started.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              className={errors.name ? 'input-error' : ''}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              className={errors.username ? 'input-error' : ''}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => { 
                if (username.trim()) checkUsernameAvailability(username)
              }}
              autoComplete="username"
            />
            {errors.username && <p className="error-message">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className={errors.email ? 'input-error' : ''}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className={errors.password ? 'input-error' : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={errors.confirmPassword || errors.form ? 'input-error' : ''}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            {errors.form && <p className="error-message">{errors.form}</p>}
          </div>

          <button type="submit" className="signup-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="login-link">
          Already a member? <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}
