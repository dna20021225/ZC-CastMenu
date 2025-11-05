# 2025-11-05 14:42:22: PostgreSQL構文からSQLite構文への修正

## 作業内容

7つのAPIルートファイルのSQL文をPostgreSQL構文からSQLite構文に変換しました。

### 修正対象ファイル
1. `src/app/api/casts/[id]/badges/[badgeId]/route.ts`
2. `src/app/api/casts/[id]/badges/route.ts`
3. `src/app/api/casts/[id]/route.ts`
4. `src/app/api/casts/route.ts`
5. `src/app/api/admin/setup/route.ts`
6. `src/app/api/admins/[id]/route.ts`
7. `src/app/api/admins/route.ts`

### 主な変更内容

#### 1. プレースホルダーの変更
- **変更前**: PostgreSQL形式の番号付きプレースホルダー (`$1`, `$2`, `$3`)
- **変更後**: SQLite形式の位置ベースプレースホルダー (`?`, `?`, `?`)

```typescript
// 変更前
query('SELECT * FROM casts WHERE id = $1', [id])

// 変更後
query('SELECT * FROM casts WHERE id = ?', [id])
```

#### 2. BOOLEAN型の変更
- **変更前**: `BOOLEAN` 型で `true`/`false`
- **変更後**: `INTEGER` 型で `1`/`0`

```typescript
// 変更前
WHERE is_active = true

// 変更後
WHERE is_active = 1
```

#### 3. TIMESTAMP型とNOW()関数の変更
- **変更前**: `TIMESTAMP` 型と `NOW()` 関数
- **変更後**: `TEXT` 型と `datetime('now')` 関数

```typescript
// 変更前
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at = NOW()

// 変更後
updated_at TEXT DEFAULT (datetime('now'))
updated_at = datetime('now')
```

#### 4. SERIAL型の変更
- **変更前**: `SERIAL PRIMARY KEY`
- **変更後**: `INTEGER PRIMARY KEY AUTOINCREMENT`

```sql
-- 変更前
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  ...
)

-- 変更後
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ...
)
```

#### 5. VARCHAR/TEXT型の変更
- **変更前**: `VARCHAR(n)` 型
- **変更後**: `TEXT` 型

```sql
-- 変更前
email VARCHAR(255) UNIQUE NOT NULL

-- 変更後
email TEXT UNIQUE NOT NULL
```

#### 6. RETURNING句の削除
SQLiteでは `RETURNING` 句がサポートされていないため、以下の対応を実施：

```typescript
// 変更前
const result = await query(
  'INSERT INTO casts (...) VALUES ($1, $2) RETURNING *',
  [value1, value2]
);
const newCast = result.rows[0];

// 変更後
await query(
  'INSERT INTO casts (...) VALUES (?, ?)',
  [value1, value2]
);
const lastIdResult = await query('SELECT last_insert_rowid() as id');
const castId = lastIdResult.rows[0].id;
const result = await query('SELECT * FROM casts WHERE id = ?', [castId]);
const newCast = result.rows[0];
```

#### 7. ILIKEからLIKEへの変更
PostgreSQLの大文字小文字を区別しない検索 `ILIKE` を、SQLiteの `LIKE` に変更：

```typescript
// 変更前
c.name ILIKE $1

// 変更後
c.name LIKE ?
```

#### 8. ON CONFLICTの対応
SQLiteでは `ON CONFLICT` の構文がPostgreSQLと異なるため、明示的な存在チェックに変更：

```typescript
// 変更前
INSERT INTO admins (...)
VALUES (...)
ON CONFLICT (email) DO UPDATE SET ...
RETURNING *

// 変更後
const existing = await query('SELECT * FROM admins WHERE email = ?', [email]);
if (existing.rows.length > 0) {
  await query('UPDATE admins SET ... WHERE email = ?', [..., email]);
} else {
  await query('INSERT INTO admins (...) VALUES (...)', [...]);
}
```

## 技術的な決定事項

### データベース抽象化レイヤーの活用
- `@/lib/db` の `query` 関数を使用することで、データベース固有の処理を隠蔽
- `db.ts` で既に `result.rows` の形式を統一しているため、アプリケーションコードの変更は最小限

### トランザクション処理の互換性
- `transaction` 関数内でも同じ `client.query` インターフェースを使用
- SQLite固有の制約（RETURNING句の非サポート）に対応するため、INSERT後の取得処理を明示的に実装

### 型の安全性維持
- TypeScriptの型定義は変更せず、データベース層の実装のみを変更
- BOOLEANからINTEGERへの変更は、JavaScriptの真偽値評価で自動的に処理される部分と、明示的に1/0に変換する部分を適切に使い分け

## 課題と解決策

### 課題1: RETURNING句の非サポート
**課題**: SQLiteでは `RETURNING` 句がサポートされていない

**解決策**:
- `INSERT` 操作後に `SELECT last_insert_rowid()` で挿入されたIDを取得
- そのIDを使って `SELECT` クエリで完全なレコードを取得
- トランザクション内で実行されるため、データの整合性は保証される

### 課題2: ON CONFLICT構文の違い
**課題**: PostgreSQLの `ON CONFLICT DO UPDATE` 構文がSQLiteでは異なる

**解決策**:
- 明示的な存在チェックロジックを実装
- `SELECT` で既存レコードを確認し、存在する場合は `UPDATE`、しない場合は `INSERT` を実行
- より読みやすく、デバッグしやすいコードに改善

### 課題3: プレースホルダーの番号管理
**課題**: PostgreSQLでは番号付きプレースホルダーを使っていたため、複雑な動的クエリで番号管理が必要だった

**解決策**:
- SQLiteの位置ベースプレースホルダー (`?`) に変更
- 動的クエリ構築時のインデックス管理が不要になり、コードがシンプルに
- パラメータ配列の順序にのみ注意すれば良くなった

## 検証結果

### リント結果
```bash
✔ No ESLint warnings or errors
```

### ビルド結果
- TypeScriptのコンパイルエラー: なし
- ビルド成功
- 環境変数未設定によるランタイムエラーは想定内（実行時に設定が必要）

## 次回のタスク
- [ ] Turso環境変数の設定とデータベース接続テスト
- [ ] 各APIエンドポイントの動作確認
- [ ] データベーススキーマの初期化スクリプト実行
- [ ] 統合テストの実施

## 参考リンク
- [SQLite Documentation - Core Functions](https://www.sqlite.org/lang_corefunc.html)
- [SQLite Documentation - Date and Time Functions](https://www.sqlite.org/lang_datefunc.html)
- [Turso Documentation](https://docs.turso.tech/)
