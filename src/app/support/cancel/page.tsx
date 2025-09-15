'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Иконка отмены */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Заголовок */}
          <h1 className="text-4xl font-bold mb-4 text-orange-400">
            Оплату скасовано
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Ваш платіж було скасовано. Жодних коштів не було списано з вашого рахунку.
          </p>

          {/* Информационный блок */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-3">Что произошло?</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">•</span>
                Ви скасували процес оплати
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">•</span>
                Жодних грошей не було списано
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">•</span>
                Ви можете спробувати ще раз у будь-який час
              </li>
            </ul>
          </div>

          {/* Причины отмены */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">
              Возможные причины отмены
            </h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Ви передумали здійснювати платіж
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Виникли технічні проблеми
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Потрібно перевірити дані картки
              </li>
            </ul>
          </div>

          {/* Кнопки навигации */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Спробувати знову
            </Link>
            <Link
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Повернутися на головну
            </Link>
          </div>

          {/* Поддержка */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-4">
              Якщо у вас виникли проблеми з оплатою, зв'яжіться з нами
            </p>
            <div className="flex justify-center space-x-4">
              <span className="text-gray-500 text-sm">
               Ми завжди готові допомогти!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
