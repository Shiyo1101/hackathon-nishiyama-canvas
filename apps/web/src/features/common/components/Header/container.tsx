import { fetchCurrentUser } from "@/lib/fetcher";
import { HeaderPresentation } from "./presentation";

export const HeaderContainer = async () => {
  const me = await fetchCurrentUser();

  return <HeaderPresentation user={me} />;
};
