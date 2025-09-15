'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PaymentSummary {
  totalAmountFormatted: string;
  totalCount: number;
  currency: string;
}

export default function SupportPage() {
  const { data: session } = useSession();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000); // 1000 центов = $10
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  // Предустановленные суммы в центах
  const presetAmounts = [
    { label: '$5', value: 500 },
    { label: '$10', value: 1000 },
    { label: '$20', value: 2000 },
  ];

  // Загружаем сводку донатов
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/payments/summary');
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Error fetching payment summary:', error);
      }
    };

    fetchSummary();
  }, []);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(Math.round(numValue * 100)); // конвертируем в центы
    }
  };

  const handleSupport = async () => {
    if (selectedAmount < 50) {
      alert('Минимальная сумма для поддержки: $0.50');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: 'usd',
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Редирект на Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.error || 'Произошла ошибка при создании платежа');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Произошла ошибка при создании платежа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Поддержать проект</h1>
            <p className="text-gray-300 text-lg">
              Ваша поддержка помогает нам развивать проект и добавлять новые функции
            </p>
          </div>

          {/* Сводка донатов */}
          {summary && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Собрано всего</h3>
              <div className="text-3xl font-bold text-green-400">
                ${summary.totalAmountFormatted}
              </div>
              <p className="text-gray-400 mt-2">
                от {summary.totalCount} {summary.totalCount === 1 ? 'донатера' : 'донатеров'}
              </p>
            </div>
          )}

          {/* Выбор суммы */}
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Выберите сумму</h2>
            
            {/* Предустановленные суммы */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                    selectedAmount === preset.value && !customAmount
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Произвольная сумма */}
            <div className="mb-6">
              <label htmlFor="customAmount" className="block text-sm font-medium mb-2">
                Или введите свою сумму (USD):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  id="customAmount"
                  type="number"
                  min="0.50"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Отображение выбранной суммы */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Сумма к оплате:</span>
                <span className="text-xl font-bold text-green-400">
                  ${(selectedAmount / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Информация о пользователе */}
            {session?.user && (
              <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <p className="text-blue-300 text-sm">
                  Вы вошли как: {session.user.email}
                </p>
              </div>
            )}

            {/* Кнопка поддержки */}
            <button
              onClick={handleSupport}
              disabled={isLoading || selectedAmount < 50}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                isLoading || selectedAmount < 50
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Создание платежа...' : 'Підтримати проект'}
            </button>

            {/* Информация о безопасности */}
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>Безопасная оплата через Stripe</p>
              <p className="mt-1">Мы не храним данные ваших карт</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
