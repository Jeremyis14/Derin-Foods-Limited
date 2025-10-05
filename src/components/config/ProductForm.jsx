import React, { useEffect, useState } from 'react';

  export default function ProductForm({ initial, onCancel, onSave }) {
    const empty = { name: '', price: '', category: '', image: '', description: '', stock: 0, inStock: true, weight: '', volume: '', sku: '' };
    const [form, setForm] = useState(() => initial || empty);

    useEffect(() => {
      setForm(initial || empty);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial?.id]);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave?.(form);
    };

    return (
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="text-lg font-semibold mb-4">{initial ? 'Edit product' : 'Add product'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="text-sm font-medium">Price</label>
            <input name="price" type="number" inputMode="numeric" min="0" value={form.price} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Stock</label>
            <input name="stock" type="number" inputMode="numeric" min="0" value={form.stock} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Image URL</label>
            <input name="image" value={form.image} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Weight</label>
            <input name="weight" value={form.weight} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="e.g. 500g" />
          </div>
          <div>
            <label className="text-sm font-medium">Volume</label>
            <input name="volume" value={form.volume} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="e.g. 1L" />
          </div>
          <div>
            <label className="text-sm font-medium">SKU</label>
            <input name="sku" value={form.sku} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input id="inStock" name="inStock" type="checkbox" checked={!!form.inStock} onChange={handleChange} />
            <label htmlFor="inStock" className="text-sm">Available for sale</label>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-full border font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-500">{initial ? 'Save changes' : 'Add product'}</button>
          </div>
        </form>
      </div>
    );
  }