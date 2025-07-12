# Logger使用例

## 基本的な使い方

### クライアントサイド

```typescript
import { createClientLogger, LogLevel } from '@/lib/logger';

// クライアント用ロガーの作成
const logger = createClientLogger({
  level: LogLevel.DEBUG,
  enableConsole: true,
  enableStorage: true,  // ブラウザのlocalStorageにログを保存
  enableRemote: true,   // リモートサーバーへの送信
  remoteEndpoint: '/api/logs',
  remoteHeaders: {
    'X-API-Key': 'your-api-key',
  },
});

// 使用例
logger.info('アプリケーションが起動しました');
logger.debug('デバッグ情報', { userId: 123, action: 'login' });
logger.warn('警告: APIレート制限に近づいています');
logger.error('エラーが発生しました', new Error('接続エラー'));

// コンテキスト付きの子ロガー
const userLogger = logger.child({ userId: 123, sessionId: 'abc123' });
userLogger.info('ユーザーがログインしました');
```

### サーバーサイド

```typescript
import { createServerLogger, createAPILogger, LogLevel } from '@/lib/logger';

// サーバー用ロガーの作成
const logger = createServerLogger({
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filePath: './logs/app.log',
});

// API専用ロガー
const apiLogger = createAPILogger('api-service');

// 使用例
apiLogger.info('APIサーバーが起動しました', { port: 3000 });
apiLogger.debug('リクエストを受信', { 
  method: 'GET', 
  path: '/api/users',
  ip: '192.168.1.1' 
});

// エラーハンドリング
try {
  // 何かの処理
} catch (error) {
  apiLogger.error('処理中にエラーが発生', error as Error, {
    operation: 'データベース接続',
    query: 'SELECT * FROM users',
  });
}
```

## 高度な使い方

### カスタムトランスポートの作成

```typescript
import { LogTransport, LogEntry } from '@/lib/logger';

class SlackTransport implements LogTransport {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async log(entry: LogEntry): Promise<void> {
    if (entry.level <= LogLevel.ERROR) {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${entry.message}`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Level', value: LogLevel[entry.level], short: true },
              { title: 'Timestamp', value: entry.timestamp.toISOString(), short: true },
              { title: 'Context', value: JSON.stringify(entry.context) },
            ],
          }],
        }),
      });
    }
  }
}

// カスタムトランスポートの使用
const logger = new Logger({
  transports: [
    new ConsoleTransport(),
    new SlackTransport(process.env.SLACK_WEBHOOK_URL!),
  ],
});
```

### カスタムフォーマッターの作成

```typescript
import { LogFormatter, LogEntry, LogLevel } from '@/lib/logger';

class ColoredFormatter implements LogFormatter {
  private colors = {
    [LogLevel.ERROR]: '\x1b[31m', // 赤
    [LogLevel.WARN]: '\x1b[33m',  // 黄
    [LogLevel.INFO]: '\x1b[36m',  // シアン
    [LogLevel.DEBUG]: '\x1b[90m', // グレー
    [LogLevel.TRACE]: '\x1b[37m', // 白
  };

  format(entry: LogEntry): string {
    const color = this.colors[entry.level];
    const reset = '\x1b[0m';
    const level = LogLevel[entry.level].padEnd(5);
    
    return `${color}[${level}]${reset} ${entry.message}`;
  }
}

// カスタムフォーマッターの使用
const logger = new Logger({
  transports: [new ConsoleTransport(new ColoredFormatter())],
});
```

### Next.js API Routeでの使用

```typescript
// app/api/users/route.ts
import { NextRequest } from 'next/server';
import { createAPILogger } from '@/lib/logger';

const logger = createAPILogger('users-api');

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });

  requestLogger.info('GET /api/users', {
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
  });

  try {
    // ユーザー取得処理
    const users = await fetchUsers();
    
    requestLogger.info('ユーザー取得成功', { count: users.length });
    
    return Response.json({ users });
  } catch (error) {
    requestLogger.error('ユーザー取得失敗', error as Error);
    
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### ミドルウェアでのロギング

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerLogger } from '@/lib/logger';

const logger = createServerLogger();

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  // リクエストヘッダーにリクエストIDを追加
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // レスポンスヘッダーにもリクエストIDを追加
  response.headers.set('x-request-id', requestId);

  // ロギング
  logger.info('Request', {
    requestId,
    method: request.method,
    url: request.url,
    duration: Date.now() - start,
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

## ログレベルの設定

環境変数でログレベルを制御：

```bash
# .env.local
LOG_LEVEL=debug  # development
LOG_LEVEL=info   # production
```

```typescript
const logger = new Logger({
  level: process.env.LOG_LEVEL 
    ? LogLevel[process.env.LOG_LEVEL.toUpperCase() as keyof typeof LogLevel]
    : LogLevel.INFO,
});
```