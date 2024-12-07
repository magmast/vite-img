import Image, { type StaticImage } from "vite-img";
import image from "./assets/image.jpg";

export function App() {
  return (
    <div className="w-screen">
      <code className="bg-zinc-200 max-w-full overflow-x-auto">
        <pre>{JSON.stringify(image)}</pre>
      </code>

      <Image
        src={image as unknown as StaticImage}
        alt="Blueprint"
        sizes="(max-width: 2560px) 100vw, 2560w"
        placeholder="blur"
      />
    </div>
  );
}
