'use client'

import { useState } from 'react'
import { getPresignedUrl, registerAndGenerateCaptions } from './actions'
import Link from 'next/link'

export default function UploadClient() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [captions, setCaptions] = useState<any[]>([])
  const [error, setError] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setCaptions([])
      setStatus('')
      setUploadedImageUrl('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setCaptions([])
    setUploadedImageUrl('')

    try {
      // Handle HEIC/HEIF files which might have empty file.type in some browsers
      let contentType = file.type

      if (!contentType) {
        const name = file.name.toLowerCase()
        if (name.endsWith('.heic')) contentType = 'image/heic'
        else if (name.endsWith('.heif')) contentType = 'image/heif'
      }

      if (!contentType) {
        throw new Error('Could not determine file type. Please try a different image.')
      }

      // Step 1: Get Presigned URL
      setStatus('Getting upload URL...')
      const { presignedUrl, cdnUrl } = await getPresignedUrl(contentType)
      setUploadedImageUrl(cdnUrl)

      // Step 2: Upload to S3
      setStatus('Uploading image...')
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
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
    <div>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-colors">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Upload an Image</h1>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/30 dark:file:text-blue-400
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                cursor-pointer transition-colors"
            />
            {file && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
              ${!file || loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 shadow-md hover:shadow-lg'
              }`}
          >
            {loading ? 'Processing...' : 'Generate Captions'}
          </button>

          {status && (
            <div className="text-center text-blue-600 dark:text-blue-400 font-medium animate-pulse">
              {status}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {captions.length > 0 && (
        <div className="mt-12 space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generated Captions</h2>

          {/* Display Uploaded Image */}
          {uploadedImageUrl && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex justify-center">
              <img
                src={uploadedImageUrl}
                alt="Uploaded context"
                className="max-h-96 object-contain rounded-lg"
              />
            </div>
          )}

          <div className="grid gap-6">
            {captions.map((caption: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                <p className="text-xl text-gray-800 dark:text-gray-200 font-serif italic">"{caption.content || caption}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
