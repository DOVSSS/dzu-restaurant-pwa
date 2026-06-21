import { useState, useEffect, useCallback } from 'react';
import { getMyRestaurant } from '../services/restaurantService';
import {
  getProductsByRestaurant,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';
import { uploadImage } from '../services/uploadService';
import { getImageUrl } from '../utils/imageUrl';
import type { Product, Restaurant } from '../types/api.types';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  file: File | null;
  preview: string | null;
  existingImage: string | null;
}

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  file: null,
  preview: null,
  existingImage: null,
};

const ProductsPage = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async (restaurantId: string) => {
    try {
      const data = await getProductsByRestaurant(restaurantId);
      setProducts(data);
    } catch {
      setError('Не удалось загрузить меню');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const r = await getMyRestaurant();
        if (!r) {
          setError('Сначала создайте профиль ресторана');
          setIsLoading(false);
          return;
        }
        setRestaurant(r);
        await loadProducts(r.id);
      } catch {
        setError('Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadProducts]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      file: null,
      preview: null,
      existingImage: product.image,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((prev) => ({ ...prev, file: f, preview: URL.createObjectURL(f) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let imagePath = form.existingImage;
      if (form.file) {
        imagePath = await uploadImage(form.file);
      }

      if (editingId) {
        const updated = await updateProduct(editingId, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          ...(imagePath ? { image: imagePath } : {}),
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
      } else {
        if (!imagePath) {
          setError('Загрузите изображение товара');
          setIsSubmitting(false);
          return;
        }
        const created = await createProduct({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          image: imagePath,
          restaurantId: restaurant.id,
        });
        setProducts((prev) => [created, ...prev]);
      }

      closeModal();
    } catch {
      setError('Не удалось сохранить товар');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Не удалось удалить товар');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50/40">
        <p className="text-gray-400 text-sm">Загрузка...</p>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50/40 px-4">
        <p className="text-red-600 text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/40">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Меню</h1>
          <button
            onClick={openCreateModal}
            className="text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-3.5 py-1.5 font-medium transition-colors shadow-sm"
          >
            + Добавить
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-20">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {products.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">
            В меню пока нет товаров
          </p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm p-3 flex gap-3"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-sm font-bold text-orange-600 mt-1">
                    {product.price} ₽
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(product)}
                    className="text-xs text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg px-2.5 py-1 transition-colors"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg px-2.5 py-1 disabled:opacity-50 transition-colors"
                  >
                    {deletingId === product.id ? '...' : 'Удалить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900">
                {editingId ? 'Редактировать товар' : 'Новый товар'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Название
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Описание
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Цена
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Фото
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 file:cursor-pointer cursor-pointer"
                />
                {(form.preview || form.existingImage) && (
                  <div className="w-full h-40 bg-gray-100 rounded-xl mt-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={form.preview || getImageUrl(form.existingImage)}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting
                  ? 'Сохраняем...'
                  : editingId
                  ? 'Сохранить'
                  : 'Создать'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;