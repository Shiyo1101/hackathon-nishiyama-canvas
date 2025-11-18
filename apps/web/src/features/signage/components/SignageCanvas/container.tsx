import { fetchMySignage } from "../../fetcher";
import { SignageCanvasPresentation } from "./presentation";

export const SignageCanvasContainer = async () => {
  const mySignage = await fetchMySignage();

  if (!mySignage) {
    return <SignageCanvasPresentation mySignage={null} />;
  }

  return <SignageCanvasPresentation mySignage={mySignage} />;
};
