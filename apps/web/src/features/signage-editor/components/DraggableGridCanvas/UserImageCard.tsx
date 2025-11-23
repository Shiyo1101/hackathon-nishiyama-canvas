/**
 * ユーザー画像カードコンポーネント
 *
 * ユーザーがアップロードした画像を表示
 */
import Image from "next/image";

type UserImageCardProps = {
  /** ユーザー画像データ */
  image: {
    id: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
  };
};

export const UserImageCard = ({ image }: UserImageCardProps): React.JSX.Element => {
  return (
    <div className="flex size-full flex-col overflow-hidden rounded-md bg-background">
      <div className="relative flex-1 overflow-hidden">
        <Image
          src={image.thumbnailUrl || image.imageUrl}
          alt="ユーザー画像"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
};
