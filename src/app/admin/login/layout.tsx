export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ログインページ専用のレイアウト（認証チェックなし、SessionProvider重複を避ける）
  return <>{children}</>;
}