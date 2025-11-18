import { fetchPopularSignages } from "../../fetcher";
import { PopularSignageListPresentation } from "./presentation";

type PopularSignageListContainerProps = {
  limit?: number;
};

export const PopularSignageListContainer = async ({
  limit = 5,
}: PopularSignageListContainerProps) => {
  const signages = await fetchPopularSignages(limit);

  return <PopularSignageListPresentation signages={signages} />;
};
