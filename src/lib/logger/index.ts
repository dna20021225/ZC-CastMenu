// 基本的なロガークラスとインターフェース
export * from '../logger';

// クライアントサイド用
export { createClientLogger, BrowserStorageTransport, RemoteTransport } from './client';

// サーバーサイド用のプロキシ関数
export const createServerLogger = (...args: unknown[]) => {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createServerLogger: _createServerLogger } = require('./server');
    return _createServerLogger(...args);
  }
  return console;
};

export const createAPILogger = (...args: unknown[]) => {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAPILogger: _createAPILogger } = require('./server');
    return _createAPILogger(...args);
  }
  return console;
};