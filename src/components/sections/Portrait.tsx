'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Portrait — 乃彩絵的形象照
 * 放在首頁英雄區上方
 */
export default function Portrait() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="flex justify-center">
        <motion.div
          className="relative group"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-2 ring-pink-300/40 shadow-md shadow-pink-200/20">
            <img
              src="/pic/nosae.png"
              alt="乃彩絵"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="text-center text-xs text-pink-700/60 mt-1.5 font-medium tracking-wide">
            乃彩絵
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
