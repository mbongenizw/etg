"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          color: '#78350f',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(217, 119, 6, 0.15)',
        },
        classNames: {
          success: 'bg-amber-50 border-amber-200 text-amber-900',
          error: 'bg-red-50 border-red-200 text-red-900',
          warning: 'bg-orange-50 border-orange-200 text-orange-900',
          info: 'bg-amber-50 border-amber-200 text-amber-900',
        },
      }}
      style={
        {
          "--normal-bg": "#fffbeb",
          "--normal-text": "#78350f",
          "--normal-border": "#fcd34d",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
