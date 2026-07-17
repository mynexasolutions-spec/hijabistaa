'use client'

import { useState, useTransition } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Plus, X, Star, Loader2 } from 'lucide-react'
import { addProductImage, deleteProductImage, setFeaturedImage } from '@/actions/products'
import Image from 'next/image'

type ProductImage = {
  id: string
  product_id: string
  image_url: string
  sort_order: number
}

type Product = {
  id: string
  featured_image_url: string | null
}

export function ProductImagesEditor({
  product,
  images,
}: {
  product: Product
  images: ProductImage[]
}) {
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  const handleUploadSuccess = (result: any) => {
    setUploading(false)
    if (result.info && result.info.secure_url) {
      startTransition(async () => {
        await addProductImage(product.id, result.info.secure_url)
      })
    }
  }

  const handleDelete = (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      startTransition(async () => {
        await deleteProductImage(imageId, product.id)
      })
    }
  }

  const handleSetFeatured = (imageUrl: string) => {
    startTransition(async () => {
      await setFeaturedImage(product.id, imageUrl)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/sign"
          onSuccess={handleUploadSuccess}
          onOpen={() => setUploading(true)}
          options={{
            multiple: true,
            maxFiles: 5,
          }}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                onClick={() => open()}
                disabled={uploading || isPending}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {uploading || isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Upload Image
              </button>
            )
          }}
        </CldUploadWidget>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => {
          const isFeatured = product.featured_image_url === img.image_url
          return (
            <div
              key={img.id}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                isFeatured ? 'border-indigo-600' : 'border-gray-200'
              }`}
            >
              <Image
                src={img.image_url}
                alt="Product image"
                fill
                className="object-cover"
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    disabled={isPending}
                    className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-center mb-2">
                  {!isFeatured && (
                    <button
                      type="button"
                      onClick={() => handleSetFeatured(img.image_url)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      Set as Featured
                    </button>
                  )}
                  {isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {images.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">No images uploaded yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Upload Image" to add some</p>
          </div>
        )}
      </div>
    </div>
  )
}
