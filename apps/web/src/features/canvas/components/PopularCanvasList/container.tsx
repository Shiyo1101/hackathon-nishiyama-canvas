import { fetchPopularCanvass } from "../../fetcher";
import { PopularCanvasListPresentation } from "./presentation";

type PopularCanvasListContainerProps = {
  limit?: number;
};

export const PopularCanvasListContainer = async ({
  limit = 5,
}: PopularCanvasListContainerProps) => {
  const canvases = await fetchPopularCanvass(limit);

  return <PopularCanvasListPresentation canvases={canvases} />;
};
