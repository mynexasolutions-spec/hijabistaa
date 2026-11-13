/**
 * Browser-side signed upload to Cloudinary. Returns a small https URL that is
 * safe to store in the database.
 *
 * Never store `data:` URIs in database rows: every read of that row ships the
 * whole image through Supabase egress (and again to the visitor's browser).
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function uploadImageToCloudinary(file: File, folder = 'hijabistaa'): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please choose a JPG, PNG or WebP image.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image is too large (max 5 MB).')
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  if (!cloudName || !apiKey) {
    throw new Error('Image uploads are not configured.')
  }

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder }

  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paramsToSign }),
  })
  if (!signRes.ok) throw new Error('Could not authorise the upload.')
  const { signature } = await signRes.json()

  const body = new FormData()
  body.append('file', file)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', folder)
  body.append('signature', signature)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })
  if (!uploadRes.ok) throw new Error('Upload failed. Please try again.')

  const json = await uploadRes.json()
  if (typeof json.secure_url !== 'string') throw new Error('Upload failed. Please try again.')
  return json.secure_url
}
