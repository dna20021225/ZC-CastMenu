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
- **決定**: **Vercel Blob** にアップロードして運用
  - 実装: `src/app/api/upload/route.ts`（`@vercel/blob` の `put`）、削除は `src/app/api/upload/delete/route.ts`（`del`）
  - 保存パス: `casts/{uuid}.{拡張子}` で `access: 'public'` 公開
  - 認証: 環境変数 `BLOB_READ_WRITE_TOKEN`（Vercelプロジェクトに紐づくBlobストアのトークン）
- **想定規模**: 50人×3-5枚 = 150-250枚程度（合計50-250MB）
- **運用フロー**:
  1. マネージャーが管理画面からキャスト写真をアップロード
  2. 画像はVercel Blobへ保存され、公開URLがDBに記録される
  3. 本番環境に即時反映（Gitコミット・デプロイ不要）
- **メリット**: リポジトリを画像で肥大化させない、管理画面から即時反映、店舗ごとにストアを分離可能
- **備考**: 店舗ごとにBlobストアを分けることで画像も店舗単位で分離する（→ `docs/インフラ設計書.md`）

> 旧方針（`public/images/casts/` にGit管理）からVercel Blobへ移行済み。過去の写真がGit管理に残っている場合はある。

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
