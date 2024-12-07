import sizes from "virtual:vite-img/sizes";
import { useState, type ComponentPropsWithoutRef } from "react";

export interface StaticImage {
  src: string;
  width: number;
  height: number;
  blurUrl: string;
}

type WidthAndHeight = Pick<ComponentPropsWithoutRef<"img">, "width" | "height">;

type StringSrcImageProps = {
  src: string;
  placeholder?: undefined;
} & Required<WidthAndHeight>;

type StaticSrcImageProps = {
  src: StaticImage;
  placeholder?: "blur";
} & WidthAndHeight;

type ImageOwnProps = (StringSrcImageProps | StaticSrcImageProps) &
  Required<Pick<ComponentPropsWithoutRef<"img">, "alt">> & {
    quality?: number;
  };

export type ImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  keyof ImageOwnProps
> &
  ImageOwnProps;

function buildProps({ src, width, height, ...props }: ImageProps) {
  const srcAndSize =
    typeof src === "string"
      ? { src, width, height }
      : {
          src: src.src,
          width: width ?? src.width,
          height: height ?? src.height,
        };

  return {
    ...props,
    srcSet: ``,
    ...srcAndSize,
  } satisfies ComponentPropsWithoutRef<"img">;
}

export default function Image(props: ImageProps) {
  const {
    loading,
    decoding,
    src,
    quality = 75,
    placeholder,
    style,
    ...other
  } = buildProps(props);

  console.log(props.placeholder === "blur" ? props.src.blurUrl : src);

  const [isLoading, setLoading] = useState(true);

  return (
    <img
      {...other}
      src={props.placeholder === "blur" ? props.src.blurUrl : src}
      loading={loading ?? "lazy"}
      decoding={decoding ?? "async"}
      style={
        props.placeholder === "blur" && isLoading
          ? {
              ...style,
              backgroundImage: `url(${props.src.blurUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "50% 50%",
              backgroundRepeat: "no-repeat",
            }
          : style
      }
      srcSet={(sizes as number[])
        .map((size) => `${src}?w=${size}&q=${quality} ${size}w`)
        .join(", ")}
      onLoad={() => setLoading(false)}
      onError={() => setLoading(false)}
    />
  );
}
