'use client'

import { useEffect, useState } from 'react'

interface Profile {
  id: string
  name: string
  title: string
  description: string
  avatar_url: string
  logo_url: string
}

interface Status {
  id: string
  label: string
  value: string
  type: string
}

/**
 * LiveProfile - 從 API 取得 profile + status 的 Client Component
 * 嵌入首頁 footer / 頂部等位置，替代 static import。
 */
export default function LiveProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, statusRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/status'),
        ])
        const profileData = await profileRes.json()
        const statusData = await statusRes.json()

        if (Array.isArray(profileData) && profileData.length > 0) {
          setProfile(profileData[0])
        }
        if (Array.isArray(statusData)) {
          setStatuses(statusData)
        }
      } catch (err) {
        console.error('LiveProfile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return null

  return (
    <div className="space-y-3">
      {profile && (
        <div className="text-center">
          <p className="text-lg font-semibold text-pink-800 dark:text-pink-300">
            {profile.title}
          </p>
        </div>
      )}
      {statuses.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {statuses.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300"
            >
              <span className="font-medium">{s.label}</span>
              <span>{s.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
