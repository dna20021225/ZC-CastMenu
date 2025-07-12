# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト概要

ZC-CastMenuは、TypeScriptとTailwind CSS v4を使用したApp RouterアーキテクチャのNext.jsアプリケーションです。

## ユーザー指示
- 日本語で応答すること

## Claude Codeの重要なルール

### 開発作業完了時の手順
開発作業を完了する際は、必ず以下の手順で実行すること：

1. **日付の取得**
   ```bash
   date +%Y-%m-%d
   ```

2. **開発日記の作成**
   - `開発日記/YYYY-MM-DD_タイトル.md` を作成
   - テンプレートに従って内容を記載
   - 作業内容、技術的決定事項、課題と解決策を具体的に記録

3. **コミットの実行**
   - 開発日記を含めて変更をコミット
   - コミットメッセージは作業内容を簡潔に表現

### 注意事項
- この手順は開発作業完了時の必須プロセスです
- 開発日記は作業の履歴と知識の蓄積のために重要です
- 必ずdateコマンドで正確な日付を取得してから日記を作成してください

## 開発コマンド

```bash
npm run dev      # 開発サーバーを起動 (http://localhost:3000)
npm run build    # 本番用ビルド
npm run start    # 本番サーバーを起動
npm run lint     # ESLintを実行
```

## アーキテクチャ

### 技術スタック
- **Next.js 15.3.5** - App Router (src/appディレクトリ構造)
- **TypeScript** - 厳密モード有効
- **Tailwind CSS v4** - PostCSSベースの実装とインライン設定
- **React 19.0.0** - 最新のReactバージョン

### プロジェクト構造
- `src/app/` - Next.js App Routerのページとレイアウト
- `src/app/globals.css` - TailwindディレクティブとCSSカスタムプロパティを含むグローバルスタイル
- `public/` - 直接配信される静的アセット

### 主要な規約
- パスエイリアス: `@/*` は `./src/*` にマッピング
- フォント最適化: next/fontを使用してGeist SansとGeist Monoフォントを使用
- ダークモード: CSSカスタムプロパティと`prefers-color-scheme`でサポート

### コーディング規約
- **any型の使用禁止**: TypeScriptで`any`型の使用は禁止。`unknown`、`object`、`Record<string, unknown>`などの適切な型を使用すること
- **型安全性の確保**: 厳密な型チェックを維持し、型エラーを解決してからコミットすること

### 現在の状態
create-next-appで初期化された新しいNext.jsプロジェクト、開発準備完了。

## CI/CDフロー

### デプロイメント環境
- **GitHub リポジトリ**: https://github.com/dna20021225/ZC-CastMenu
- **Vercel プロジェクト**: https://zc-castmenu.vercel.app
- **自動デプロイ**: GitHubのmainブランチへのプッシュで自動デプロイ

### デプロイフロー
1. **開発**
   - `npm run dev` でローカル開発サーバーを起動
   - `http://localhost:3000` で動作確認

2. **コード品質チェック**
   - `npm run lint` でESLintを実行
   - `npm run build` でビルドエラーがないか確認

3. **コミット & プッシュ**
   ```bash
   git add .
   git commit -m "コミットメッセージ"
   git push origin main
   ```

4. **自動デプロイ**
   - GitHubへのプッシュ後、Vercelが自動的にビルド・デプロイを実行
   - デプロイ状況はVercelダッシュボードで確認可能

### Vercel設定
- **フレームワーク**: Next.js
- **ビルドコマンド**: `next build`
- **出力ディレクトリ**: Next.jsデフォルト
- **Node.jsバージョン**: 20.x (推奨)

### 環境変数
環境変数が必要な場合は、Vercelダッシュボードの Settings > Environment Variables から設定してください。

### プレビューデプロイ
プルリクエストを作成すると、Vercelが自動的にプレビュー環境を構築します。

## 開発日記ルール

開発日記は `開発日記/` ディレクトリに記録します。

### ファイル命名規則
- **形式**: `YYYY-MM-DD_タイトル.md`
- **例**: `2025-01-12_初期セットアップ.md`

### 記載内容
各日記には以下の項目を含めること：

1. **日付とタイトル**
   ```markdown
   # 2025-01-12: 初期セットアップ
   ```

2. **作業内容**
   - 実装した機能
   - 修正したバグ
   - リファクタリング内容

3. **技術的な決定事項**
   - 採用した技術やライブラリ
   - アーキテクチャの選択理由
   - パフォーマンス最適化

4. **課題と解決策**
   - 直面した問題
   - 解決方法
   - 今後の改善点

5. **次回のタスク**
   - TODOリスト
   - 優先順位

### テンプレート
```markdown
# YYYY-MM-DD: タイトル

## 作業内容
- 

## 技術的な決定事項
- 

## 課題と解決策
### 課題
- 

### 解決策
- 

## 次回のタスク
- [ ] 
- [ ] 

## 参考リンク
- 
```

### 管理ルール
- 日記は日付順に管理
- 重要な決定事項は適宜 README.md や技術ドキュメントに転記
- コードの変更と併せてコミット

## ロガークラス運用ガイドライン

### 基本運用方針
- **統一されたロギング**: プロジェクト全体で`@/lib/logger`のロガークラスを使用すること
- **適切なログレベル**: 本番環境では`INFO`以上、開発環境では`DEBUG`以上を設定
- **機密情報の保護**: パスワード、APIキー、個人情報はログに出力しないこと

### 使用方法
```typescript
// クライアントサイド
import { createClientLogger } from '@/lib/logger';
const logger = createClientLogger();

// サーバーサイド（API Route等）
import { createAPILogger } from '@/lib/logger';
const logger = createAPILogger('service-name');

// 基本的な使用例
logger.info('処理開始', { userId: 123 });
logger.error('エラー発生', error, { operation: 'データベース接続' });
```

### ログレベルの使い分け
- **ERROR**: システムエラー、予期しない例外
- **WARN**: 注意が必要な状況、非推奨機能の使用
- **INFO**: 重要な処理の開始・完了、ユーザーアクション
- **DEBUG**: 開発時のデバッグ情報、詳細な処理フロー
- **TRACE**: 最も詳細な実行トレース

### 本番環境での設定
- ファイル出力を有効化
- ログローテーション設定（10MB、5ファイル保持）
- 機密情報のマスキング
- パフォーマンスへの影響を考慮した適切なログレベル設定