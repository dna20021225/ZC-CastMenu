// 全ての Uploader が満たすべき共通インターフェース。
// 「入力経路は何でもよいが、最終的に Vercel Blob の URL を返す」という疎結合な契約。
// 親（ImageUploader）はどの経路が選ばれているかだけ知っていればよい。
export interface UploaderProps {
  disabled?: boolean;
  onUploaded: (url: string) => void;
}
