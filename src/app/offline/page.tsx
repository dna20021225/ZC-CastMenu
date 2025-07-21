"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCcw } from "lucide-react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            {isOnline ? (
              <Wifi className="w-10 h-10 text-green-600" />
            ) : (
              <WifiOff className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isOnline ? 'オンラインに復帰しました' : 'オフライン'}
          </h1>

          <p className="text-gray-600 mb-6">
            {isOnline 
              ? 'インターネット接続が復旧しました。アプリを再読み込みできます。'
              : 'インターネット接続を確認してください。一部の機能は制限される場合があります。'
            }
          </p>

          <div className="space-y-4">
            <button
              onClick={handleRetry}
              disabled={!isOnline}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-md font-medium transition-colors ${
                isOnline
                  ? 'bg-pink-600 text-white hover:bg-pink-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              アプリを再読み込み
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              前のページに戻る
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              接続状況: <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'オンライン' : 'オフライン'}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            オフライン時の機能
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              キャッシュされたデータの閲覧
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              基本的なナビゲーション
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
              データの更新・追加
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
              画像のアップロード
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}