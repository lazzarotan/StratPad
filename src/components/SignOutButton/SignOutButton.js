"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const SignOutButton = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({})
    const router = useRouter()

    async function handleClick() {
        if (isSubmitting) return

        // clear previous errors
        setErrors({})

        await signOut({
            fetchOptions: {
                onRequest: () => {
                    setIsSubmitting(true)
                },
                onResponse: () => {
                    setIsSubmitting(false)
                },
                onError: (ctx) => {
                    setIsSubmitting(false)

                    let message = "Sign out failed"
                    if (ctx?.error?.message?.trim()) {
                        message = ctx.error.message
                    }

                    setErrors((prev) => {
                        const nextErrors = { ...prev }
                        nextErrors.form = message
                        return nextErrors
                    })
                },
                onSuccess: () => {
                    setIsSubmitting(false)
                    router.push("/login")
                },
            },
        })
    }

    return (
        <div>
            <button onClick={handleClick} disabled={isSubmitting}>
                Log Out
            </button>

            {errors.form && <p className="error-message">{errors.form}</p>}
        </div>
    )
}
