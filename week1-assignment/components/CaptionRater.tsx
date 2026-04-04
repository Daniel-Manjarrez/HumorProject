'use client'

import { useState, useEffect } from 'react'
import { submitVote } from '@/app/actions'

type CaptionWithImage = {
  id: string
  content: string
  images: {
    url: string
    image_description: string
  } | {
    url: string
    image_description: string
  }[] | null // Handle both array and single object based on the join type
}

export default function CaptionRater({ initialCaptions }: { initialCaptions: any[] }) {
  // We manage the list of captions locally. As we vote, we move to the next one.
  const [captions, setCaptions] = useState<CaptionWithImage[]>(initialCaptions || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Restore state from sessionStorage on mount to persist feed across navigation
  useEffect(() => {
    setIsMounted(true)
    const savedCaptions = sessionStorage.getItem('captionFeed')
    const savedIndex = sessionStorage.getItem('captionCurrentIndex')

    if (savedCaptions && savedIndex) {
      setCaptions(JSON.parse(savedCaptions))
      setCurrentIndex(parseInt(savedIndex, 10))
    } else {
      sessionStorage.setItem('captionFeed', JSON.stringify(initialCaptions || []))
      sessionStorage.setItem('captionCurrentIndex', '0')
    }
  }, [initialCaptions])

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem('captionFeed', JSON.stringify(captions))
      sessionStorage.setItem('captionCurrentIndex', currentIndex.toString())
    }
  }, [captions, currentIndex, isMounted])

  const handleCheckMore = () => {
    sessionStorage.removeItem('captionFeed')
    sessionStorage.removeItem('captionCurrentIndex')
    window.location.reload()
  }

  // Prevent hydration mismatch by waiting for mount
  if (!isMounted) {
    return <div className="max-w-2xl mx-auto min-h-[400px]"></div>
  }

  if (!captions || captions.length === 0 || currentIndex >= captions.length) {
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">All caught up!</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">You've rated all available captions.</p>
        <button
          onClick={handleCheckMore}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer font-medium"
        >
          Check for more
        </button>
      </div>
    )
  }

  const currentCaption = captions[currentIndex]

  const handleVote = async (voteValue: number) => {
    if (isSubmitting || !currentCaption) return

    setIsSubmitting(true)
    setDirection(voteValue === 1 ? 'right' : 'left')

    try {
      await submitVote(currentCaption.id, voteValue)

      // Wait for animation to finish before moving to next
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setDirection(null)
        setIsSubmitting(false)
      }, 300)
    } catch (error) {
      console.error('Failed to submit vote:', error)
      alert('Failed to submit vote. Please try again.')
      setDirection(null)
      setIsSubmitting(false)
    }
  }

  // Handle the nested image data safely
  const imageObj = currentCaption.images
    ? (Array.isArray(currentCaption.images) ? currentCaption.images[0] : currentCaption.images)
    : null;
  const imageUrl = imageObj?.url;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col border border-gray-100 dark:border-gray-700 transition-all duration-300
          ${direction === 'left' ? '-translate-x-full opacity-0 rotate-[-10deg]' : ''}
          ${direction === 'right' ? 'translate-x-full opacity-0 rotate-[10deg]' : ''}
        `}
      >
        {/* Image Section */}
        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-700">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Context for caption"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>No image available</span>
            </div>
          )}
        </div>

        {/* Caption Section */}
        <div className="p-8 flex-grow flex flex-col justify-center items-center text-center">
          <p className="text-2xl font-serif text-gray-800 dark:text-gray-100 mb-6 leading-relaxed italic">
            "{currentCaption.content}"
          </p>

          <div className="text-sm text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-2">
            Caption ID
          </div>

          {/* Use a fixed width or hidden overflow to prevent long IDs from breaking layout */}
          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
            {currentCaption.id}
          </div>
        </div>
      </div>

      {/* Voting Controls */}
      <div className="flex justify-center gap-12 mt-10">
        <button
          onClick={() => handleVote(-1)}
          disabled={isSubmitting}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 shadow-sm group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:border-red-200 dark:group-hover:border-red-800 group-hover:shadow-md transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400">Skip</span>
        </button>

        <button
          onClick={() => handleVote(1)}
          disabled={isSubmitting}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/20 group-hover:shadow-xl group-hover:shadow-pink-300 dark:group-hover:shadow-pink-900/40 group-hover:scale-105 transition-all border border-pink-400 dark:border-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-pink-500 dark:group-hover:text-pink-400">Love it</span>
        </button>
      </div>

      <div className="text-center mt-8 text-gray-400 dark:text-gray-500 text-sm font-medium">
        {currentIndex + 1} / {captions.length} Captions
      </div>
    </div>
  )
}
