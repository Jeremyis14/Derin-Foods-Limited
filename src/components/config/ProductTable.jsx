import React from 'react';
  import { FiEdit2, FiTrash2 } from 'react-icons/fi';

  export default function ProductTable({ products, onEdit, onDelete, onPriceChange, onStockChange, filter }) {
    const list = (filter ? products.filter(filter) : products);

    return (
      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => {
              const lowStock = (p.stock ?? 0) <= 5 && p.inStock;
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image || '/images/placeholder.png'} alt={p.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate max-w-[240px]">{p.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[280px]">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={p.price ?? 0}
                      onChange={(e) => onPriceChange(p.id, e.target.value)}
                      className="w-28 border rounded px-2 py-1 text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={p.stock ?? 0}
                      onChange={(e) => onStockChange(p.id, e.target.value)}
                      className="w-24 border rounded px-2 py-1 text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.inStock ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                      {p.inStock ? (lowStock ? 'Low stock' : 'Active') : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(p)} className="p-2 rounded hover:bg-gray-100" title="Edit">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => onDelete(p)} className="p-2 rounded hover:bg-red-50 text-red-600" title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-600">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }