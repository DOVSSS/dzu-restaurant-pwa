import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRestaurant, createRestaurant } from '../services/restaurantService';
import { uploadImage } from '../services/uploadService';
import { getImageUrl } from '../utils/imageUrl';
import type { Restaurant } from '../types/api.types';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getMyRestaurant();
        setRestaurant(r);
      } catch {
        setError('Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Загрузите изображение ресторана');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const imagePath = await uploadImage(file);
      const created = await createRestaurant({ name, image: imagePath });
      setRestaurant(created);
    } catch {
      setError('Не удалось создать ресторан');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-gray-400 text-sm">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/40">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Кабинет ресторана</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-20">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {restaurant ? (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <img
                src={getImageUrl(restaurant.image)}
                alt={restaurant.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-5">
              <h2 className="font-bold text-lg text-gray-900 mb-4">
                {restaurant.name}
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors shadow-sm"
                >
                  Заказы
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl py-3 text-sm font-semibold transition-colors"
                >
                  Меню
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">
              Создайте профиль ресторана
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Название
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                {preview && (
                  <div className="w-full h-40 bg-gray-100 rounded-xl mt-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={preview}
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
                {isSubmitting ? 'Создаём...' : 'Создать ресторан'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;