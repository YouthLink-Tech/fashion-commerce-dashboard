import RefreshAccessToken from "@/app/components/refresh/RefreshAccessToken";
import Loading from "@/app/components/shared/Loading/Loading";
import { Suspense } from "react";

const RefreshPage = () => {


  return (
    <Suspense fallback={<Loading />}>
      <RefreshAccessToken />
    </Suspense>
  );
};

export default RefreshPage;