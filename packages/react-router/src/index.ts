import { apiRoute } from "@vite-img/core/server";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  return apiRoute(request);
}
