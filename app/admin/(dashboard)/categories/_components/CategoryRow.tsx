'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteCategory, toggleCategoryStatus } from '@/actions/categories'
import { useState, useTransition } from 'react'
import { CornerDownRight } from 'lucide-react'
import type { Category } from '@/types/database'

export default function CategoryRow({ category }: { category: Category & { count?: number, isSubcategory?: boolean, parentName?: string } }) {
  const [isPending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)

  if (deleted) return null

  const handleToggleStatus = () => {
    startTransition(async () => {
      await toggleCategoryStatus(category.id, !category.is_active)
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this category?')) {
      startTransition(async () => {
        const result = await deleteCategory(category.id)
        if (result.success) setDeleted(true)
      })
    }
  }

  return (
    <>
    {/* Mobile: one stacked card per category (the 6-column table does not fit a phone) */}
    <tr className="md:hidden">
      <td colSpan={6} className="px-4 py-3.5">
        <div className={`flex items-start gap-3 ${category.isSubcategory ? 'pl-4' : ''}`}>
          {category.isSubcategory && (
            <CornerDownRight className="w-4 h-4 text-stone-300 mt-3 shrink-0" />
          )}
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-medium shrink-0">
              IMG
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-900 break-words">{category.name}</p>
            {category.isSubcategory ? (
              <p className="text-xs text-stone-500 mt-0.5">
                Sub-category of <span className="font-semibold text-stone-700">{category.parentName}</span>
              </p>
            ) : category.description ? (
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{category.description}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#9C5247]/10 text-[#9C5247] border border-[#9C5247]/20">
                {category.count || 0} Products
              </span>
              <button
                disabled={isPending}
                onClick={handleToggleStatus}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  category.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {category.is_active ? 'Active' : 'Inactive'}
              </button>
              <code className="text-[11px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded break-all">
                {category.slug}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Link
              href={`/admin/categories/${category.id}/edit`}
              className="p-2 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              aria-label="Edit category"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <button
              disabled={isPending}
              onClick={handleDelete}
              className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              aria-label="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </td>
    </tr>

    {/* Tablet / desktop: original table row */}
    <tr className="hidden md:table-row hover:bg-stone-50/50 transition-colors">
      <td className="px-6 py-3.5">
        <div className={`flex items-center gap-3 ${category.isSubcategory ? 'ml-8 relative' : ''}`}>
          {category.isSubcategory && (
            <div className="absolute -left-6 text-stone-300">
              <CornerDownRight className="w-4 h-4" />
            </div>
          )}
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-10 h-10 rounded-lg object-cover bg-stone-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-medium">
              IMG
            </div>
          )}
            <div>
              <p className="text-sm font-medium text-stone-900">{category.name}</p>
            {category.isSubcategory ? (
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                Sub-category of <span className="font-semibold text-stone-700">{category.parentName}</span>
              </p>
            ) : category.description ? (
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                {category.description}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#9C5247]/10 text-[#9C5247] border border-[#9C5247]/20">
          {category.count || 0} Products
        </span>
      </td>
      <td className="px-6 py-3.5">
        <code className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
          {category.slug}
        </code>
      </td>
      <td className="px-6 py-3.5">
        <button
          disabled={isPending}
          onClick={handleToggleStatus}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            category.is_active
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
          }`}
        >
          {category.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-3.5 text-sm text-stone-500">
        {new Date(category.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="px-6 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="p-2 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            disabled={isPending}
            onClick={handleDelete}
            className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
    </>
  )
}
