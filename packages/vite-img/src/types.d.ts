import type { StaticImage } from "./dist/index";

declare module "virtual:vite-img/sizes" {
  const sizes: number[];
  export default sizes;
}

declare module "*.png" {
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.jpg" {
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.jpeg" {
  const staticImage: StaticImage;
  export default staticImage;
}
