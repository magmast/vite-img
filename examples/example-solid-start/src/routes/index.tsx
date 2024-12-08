import Image from "@vite-img/solid";
import local from "~/assets/image.jpg";

const sizes =
  "(max-width: 640px) 100vw, (max-width: 768px) 768w, (max-width: 1024px) 1024w, (max-width: 1280px) 1280w, 1536w";

export default function Home() {
  return (
    <main class="container mx-auto">
      <h2>Local</h2>
      <Image
        src={local}
        alt="Local image"
        placeholder="blur"
        class="max-w-full"
        sizes={sizes}
      />

      <h2>Remote</h2>
      <Image
        src="https://picsum.photos/2560/1440"
        width={2560}
        height={1440}
        class="max-w-full"
        sizes={sizes}
        alt="Random image"
      />
    </main>
  );
}
