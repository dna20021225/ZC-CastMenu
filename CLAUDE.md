# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト概要

ZC-CastMenuは、タブレット向けのキャスト管理・表示アプリケーションです。

## ユーザー指示
- 日本語で応答すること

## 技術スタック
- **Next.js 14.2** - App Router
- **TypeScript** - 厳密モード有効
- **Tailwind CSS v3** - カスタムCSSプロパティ併用
- **React 18.3** - Server Components対応
- **PostgreSQL** - データベース
- **NextAuth.js v5** - 認証

## プロジェクト構造
```
src/
├── app/              # Next.js App Router
│   ├── admin/        # 管理画面
│   ├── api/          # API Routes
│   ├── cast/         # キャスト詳細
│   └── menu/         # 料金・ドリンクメニュー
├── components/       # Reactコンポーネント
├── lib/              # ユーティリティ・DB・認証
├── hooks/            # カスタムフック
└── types/            # TypeScript型定義
```

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run lint     # ESLint実行
```

## コーディング規約
- **any型禁止**: `unknown`、`Record<string, unknown>`等を使用
- **型安全性**: 厳密な型チェックを維持
- **ロガー使用**: `@/lib/logger`を使用（コンソール直接出力禁止）

## デプロイ
- **リポジトリ**: https://github.com/dna20021225/ZC-CastMenu
- **本番環境**: https://zc-castmenu.vercel.app
- **自動デプロイ**: mainブランチへのプッシュで自動実行

## 詳細仕様
詳細な要件定義は `docs/要件定義書.md` を参照してください。
