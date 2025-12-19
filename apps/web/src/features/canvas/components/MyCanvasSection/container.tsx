import { fetchMyCanvas } from "../../fetcher";
import { MyCanvasSectionPresentation } from "./presentation";

export const MyCanvasSectionContainer = async () => {
  const myCanvas = await fetchMyCanvas();

  if (!myCanvas) {
    return <MyCanvasSectionPresentation myCanvas={null} />;
  }

  return <MyCanvasSectionPresentation myCanvas={myCanvas} />;
};
