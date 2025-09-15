'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Обрабатываем ваш платеж...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Иконка успеха */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Заголовок */}
          <h1 className="text-4xl font-bold mb-4 text-green-400">
            Дякуємо за підтримку!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Ваш платеж успешно обработан. Мы очень ценим вашу поддержку!
          </p>

          {/* Информация о платеже */}
          {sessionId && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-2">Детали платежа</h3>
              <p className="text-gray-400 text-sm">
                ID сессии: <span className="font-mono">{sessionId}</span>
              </p>
            </div>
          )}

          {/* Дополнительная информация */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">
              Что дальше?
            </h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Вы получите подтверждение на email
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Ваша поддержка поможет нам улучшить проект
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Следите за обновлениями в нашем проекте
              </li>
            </ul>
          </div>

          {/* Кнопки навигации */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Поддержать еще раз
            </Link>
            <Link
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Вернуться на главную
            </Link>
          </div>

          {/* Социальные сети или дополнительные ссылки */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-4">
              Поделитесь нашим проектом с друзьями!
            </p>
            <div className="flex justify-center space-x-4">
              {/* Здесь можно добавить ссылки на социальные сети */}
              <span className="text-gray-500 text-sm">
                Спасибо за вашу поддержку! 
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
