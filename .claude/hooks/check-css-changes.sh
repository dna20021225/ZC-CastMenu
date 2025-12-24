#!/bin/bash
set -e

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# CSS/TSX/コンポーネントファイルの変更を検出
if [[ "$file_path" == *"components/"* ]] || [[ "$file_path" == *"/app/"* ]] || [[ "$file_path" == *".css"* ]]; then
  if echo "$file_path" | grep -qE '\.(tsx?|css)$'; then
    cat << 'EOF'
{
  "additionalContext": "UI/CSS変更を検出しました。\n\n必須確認項目:\n1. ブラウザで該当ページを開く\n2. レイアウト・余白が崩れていないか確認\n3. ダークテーマ（黒背景）が維持されているか確認\n4. 要素間の間隔が適切か確認\n\nユーザーに確認を依頼してください。"
}
EOF
    exit 0
  fi
fi

exit 0
