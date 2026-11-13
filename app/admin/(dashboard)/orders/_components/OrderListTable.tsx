'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Search } from 'lucide-react'
import { DeleteOrderButton } from './DeleteOrderButton'

interface OrderListTableProps {
  initialOrders: any[]
}

const paymentBadge = (status: string) =>
  status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
  status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
  status === 'refunded' ? 'bg-stone-100 text-stone-700 border-stone-200' :
  'bg-orange-50 text-orange-700 border-orange-200'

const orderBadge = (status: string) =>
  status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
  status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
  status === 'processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
  status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
  'bg-orange-50 text-orange-700 border-orange-200'

export function OrderListTable({ initialOrders }: OrderListTableProps) {
  const [search, setSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')

  const filteredOrders = initialOrders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (order.customers?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.customers?.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesOrderStatus = orderStatus === 'all' || order.order_status === orderStatus;
    const matchesPaymentStatus = paymentStatus === 'all' || order.payment_status === paymentStatus;

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
  })

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200/60 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search order number, customer name, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Order Status:</span>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Payment Status:</span>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
        {/* Mobile: stacked cards (a 7-column table does not fit a phone) */}
        <div className="md:hidden">
          {filteredOrders.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-stone-500">No orders match the filters.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {filteredOrders.map((order: any) => (
                <li key={order.id} className="px-4 py-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 break-all">{order.order_number}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-stone-900 shrink-0">₹{order.total_amount}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{order.customers?.full_name || 'Guest'}</p>
                    {order.customers?.email && (
                      <p className="text-xs text-stone-500 truncate">{order.customers.email}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${paymentBadge(order.payment_status)}`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${orderBadge(order.order_status)}`}>
                        {order.order_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        title="View Details"
                        aria-label="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <DeleteOrderButton orderId={order.id} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tablet / desktop: original table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-xs border-b border-stone-200/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                    No orders match the filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-900">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-stone-900">{order.customers?.full_name || 'Guest'}</span>
                        <span className="text-xs text-stone-500">{order.customers?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-900">₹{order.total_amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.payment_status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                        order.payment_status === 'refunded' ? 'bg-stone-100 text-stone-700 border-stone-200' :
                        'bg-orange-50 text-orange-700 border-orange-200' // pending
                      }`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.order_status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.order_status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        order.order_status === 'processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        order.order_status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-orange-50 text-orange-700 border-orange-200' // pending
                      }`}>
                        {order.order_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <DeleteOrderButton orderId={order.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
