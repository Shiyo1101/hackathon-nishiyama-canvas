import { fetchFavoriteSignages } from "../../fetcher";
import { FavoriteSignageListPresentation } from "./presentation";

type FavoriteSignageListContainerProps = {
  limit?: number;
};

export const FavoriteSignageListContainer = async ({
  limit = 5,
}: FavoriteSignageListContainerProps) => {
  const signages = await fetchFavoriteSignages(limit);

  return <FavoriteSignageListPresentation signages={signages} />;
};
