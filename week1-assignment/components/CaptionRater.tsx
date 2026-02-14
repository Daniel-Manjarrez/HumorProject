'use client'

import { useState } from 'react'
import { submitVote } from '@/app/actions'

type Caption = {
  id: string;
  content: string;
  created_datetime_utc: string;
  like_count: number;
}

export default function CaptionRater({ captions }: { captions: Caption[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [direction, setDirection] = useState(0) // -1 for left (down), 1 for right (up)

  const currentCaption = captions[currentIndex]

  const handleVote = async (voteValue: number) => {
    if (!currentCaption) return

    // Start exit animation
    setDirection(voteValue > 0 ? 1 : -1)
    setIsVisible(false)

    // Optimistically move to next caption after animation
    setTimeout(async () => {
      // Submit vote in background
      try {
        await submitVote(currentCaption.id, voteValue)
      } catch (e) {
        console.error('Vote failed', e)
        // Optionally show error toast
      }

      // Move to next
      setCurrentIndex((prev) => (prev + 1) % captions.length)

      // Reset animation
      setDirection(0)
      setIsVisible(true)
    }, 300) // Match transition duration
  }

  if (!currentCaption) {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
        <p className="text-gray-600 mt-2">You've rated all the captions.</p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
        >
          Start Over
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          bg-white rounded-2xl shadow-xl p-12 min-h-[300px] flex flex-col justify-center items-center text-center
          transition-all duration-300 transform
          ${isVisible ? 'opacity-100 translate-x-0 scale-100' : `opacity-0 ${direction > 0 ? 'translate-x-20 rotate-6' : '-translate-x-20 -rotate-6'} scale-95`}
        `}
      >
        <p className="text-3xl font-serif text-gray-800 mb-8 leading-relaxed">
          "{currentCaption.content}"
        </p>

        <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">
           <span suppressHydrationWarning>
             {new Date(currentCaption.created_datetime_utc).toLocaleDateString('en-US', { dateStyle: 'medium' })}
           </span>
        </div>

        <div className="text-xs text-gray-300 mt-2 font-mono">
          ID: {currentCaption.id}
        </div>
      </div>

      <div className="flex justify-center gap-12 mt-10">
        <button
          onClick={() => handleVote(-1)}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
          aria-label="Downvote"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-red-100 text-red-500 shadow-sm group-hover:bg-red-50 group-hover:border-red-200 group-hover:shadow-md transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-400 group-hover:text-red-500">Skip</span>
        </button>

        <button
          onClick={() => handleVote(1)}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
          aria-label="Upvote"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 group-hover:shadow-xl group-hover:shadow-pink-300 group-hover:scale-105 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-400 group-hover:text-pink-500">Love it</span>
        </button>
      </div>

      <div className="text-center mt-8 text-gray-300 text-sm font-medium">
        Caption {currentIndex + 1} of {captions.length}
      </div>
    </div>
  )
}
