'use client'

import { useState } from 'react'
import { getPresignedUrl, registerAndGenerateCaptions } from './actions'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [captions, setCaptions] = useState<any[]>([])
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setCaptions([])
      setStatus('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setCaptions([])

    try {
      // Step 1: Get Presigned URL
      setStatus('Getting upload URL...')
      const { presignedUrl, cdnUrl } = await getPresignedUrl(file.type)

      // Step 2: Upload to S3
      setStatus('Uploading image...')
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3')
      }

      // Step 3 & 4: Register and Generate Captions
      setStatus('Generating captions (this may take a moment)...')
      const generatedCaptions = await registerAndGenerateCaptions(cdnUrl)

      setCaptions(generatedCaptions)
      setStatus('Done!')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Something went wrong')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Feed
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload an Image</h1>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              {file && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
                ${!file || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
            >
              {loading ? 'Processing...' : 'Generate Captions'}
            </button>

            {status && (
              <div className="text-center text-blue-600 font-medium animate-pulse">
                {status}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        {captions.length > 0 && (
          <div className="mt-12 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Generated Captions</h2>
            <div className="grid gap-6">
              {captions.map((caption: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <p className="text-xl text-gray-800 font-serif italic">"{caption.content || caption}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
