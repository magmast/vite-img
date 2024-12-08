import Image from "vite-img";
import local from '~/assets/image.jpg';

const sizes = "(max-width: 640px) 100vw, (max-width: 768px) 768w, (max-width: 1024px) 1024w, (max-width: 1280px) 1280w, (max-width: 1536px) 1536w, 2560w"

export default function Home() {
  return <div className="container mx-auto">
    <h2>Local</h2>
    <Image src={local} alt="Local image" placeholder="blur" className="max-w-full" sizes={sizes} />

    <h2>Remote</h2>

    <Image
      src="https://picsum.photos/2560/1440"
      width={2560}
      height={1440}
      className="max-w-full"
      sizes={sizes}
      alt="Random image"
    />
  </div>;
}