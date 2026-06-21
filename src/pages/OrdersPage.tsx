import { useState, useEffect, useCallback } from 'react';
import { getMyRestaurant } from '../services/restaurantService';
import { getRestaurantOrders, updateOrderStatus } from '../services/orderService';
import type { Order, OrderStatus, Restaurant } from '../types/api.types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Новый',
  CONFIRMED: 'Подтверждён',
  PREPARING: 'Готовится',
  READY: 'Готов к выдаче',
  DELIVERING: 'В пути',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERING: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  PENDING: { label: 'Подтвердить', next: 'CONFIRMED' },
  CONFIRMED: { label: 'Начать готовить', next: 'PREPARING' },
  PREPARING: { label: 'Готово', next: 'READY' },
};

const CANCELABLE_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED'];

const OrdersPage = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async (restaurantId: string) => {
    try {
      const data = await getRestaurantOrders(restaurantId);
      setOrders(
        [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch {
      setError('Не удалось загрузить заказы');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const r = await getMyRestaurant();
        if (!r) {
          setError('Ресторан не найден. Создайте профиль ресторана.');
          setIsLoading(false);
          return;
        }
        setRestaurant(r);
        await loadOrders(r.id);
      } catch {
        setError('Не удалось загрузить данные ресторана');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [loadOrders]);

  useEffect(() => {
    if (!restaurant) return;
    const interval = setInterval(() => loadOrders(restaurant.id), 15000);
    return () => clearInterval(interval);
  }, [restaurant, loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
    } catch {
      setError('Не удалось обновить статус заказа');
    } finally {
      setUpdatingId(null);
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
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Заказы</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-20">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">Пока нет заказов</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const action = NEXT_ACTION[order.status as OrderStatus];
              const canCancel = CANCELABLE_STATUSES.includes(order.status as OrderStatus);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">№ {order.reference}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity} × {item.productName}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {item.price * item.quantity} ₽
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-orange-50 pt-3">
                    <span className="font-bold text-gray-900">
                      Итого: {order.total} ₽
                    </span>

                    <div className="flex gap-2">
                      {canCancel && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                          disabled={updatingId === order.id}
                          className="text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 disabled:opacity-50 transition-colors"
                        >
                          Отменить
                        </button>
                      )}
                      {action && (
                        <button
                          onClick={() => handleStatusChange(order.id, action.next)}
                          disabled={updatingId === order.id}
                          className="text-xs text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-3 py-1.5 disabled:opacity-50 transition-colors font-medium"
                        >
                          {updatingId === order.id ? '...' : action.label}
                        </button>
                      )}
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <p className="text-xs text-gray-400 mt-2">
                      Адрес: {order.deliveryAddress}
                    </p>
                  )}
                  {order.comment && (
                    <p className="text-xs text-gray-400">Комментарий: {order.comment}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;