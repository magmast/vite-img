declare module "virtual:vite-img/sizes" {
  const sizes: number[];
  export default sizes;
}

declare module "*.jpg" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.jpeg" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.png" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.webp" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.avif" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.tiff" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.gif" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}

declare module "*.svg" {
  import type { StaticImage } from "@vite-img/core";
  const staticImage: StaticImage;
  export default staticImage;
}
