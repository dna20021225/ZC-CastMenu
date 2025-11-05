# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト概要

ZC-CastMenuは、タブレット向けのキャスト管理・表示アプリケーションです。

## ユーザー指示
- 日本語で応答すること
- ユーザーは基本的にWebアプリ開発の知識がないものとして考えてください

## 技術スタック
- **Next.js 14.2** - App Router
- **TypeScript** - 厳密モード有効
- **Tailwind CSS v3** - カスタムCSSプロパティ併用
- **React 18.3** - Server Components対応
- **SQLite** - データベース
  - 開発環境: Better-SQLite3（ローカルファイル）
  - 本番環境: Turso（リモートSQLite）
  - 理由: Vercelはサーバーレス環境のため、ファイルシステムが一時的（各リクエスト後に破棄される）。永続化にはリモートDBが必要
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

## データ管理方針

### 画像保存
- **決定**: `public/images/casts/` にGit管理で運用
- **想定規模**: 50人×3-5枚 = 150-250枚程度（合計50-250MB）
- **運用フロー**:
  1. マネージャーが写真を受け取る
  2. `public/images/casts/` フォルダに保存
  3. Gitコミット＆プッシュ
  4. Vercelが自動デプロイ
  5. 本番環境に反映
- **メリット**: 完全無料、シンプル、バックアップ自動管理
- **制限**: GitHubリポジトリ推奨1GB以下（現在の規模なら問題なし）

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
