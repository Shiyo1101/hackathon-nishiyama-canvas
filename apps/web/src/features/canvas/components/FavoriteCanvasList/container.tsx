import { fetchFavoriteCanvass } from "../../fetcher";
import { FavoriteCanvasListPresentation } from "./presentation";

type FavoriteCanvasListContainerProps = {
  limit?: number;
};

export const FavoriteCanvasListContainer = async ({
  limit = 5,
}: FavoriteCanvasListContainerProps) => {
  const canvases = await fetchFavoriteCanvass(limit);

  return <FavoriteCanvasListPresentation canvases={canvases} />;
};
