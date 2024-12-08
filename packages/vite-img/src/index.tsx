import sizes from "virtual:vite-img/sizes";
import { useState, type ComponentPropsWithoutRef } from "react";

export interface StaticImage {
  src: string;
  width: number;
  height: number;
  blurUrl: string;
}

type StringSrcImageProps = {
  src: string;
  placeholder?: undefined;
  width: number | string;
  height: number | string;
};

type StaticSrcImageProps = {
  src: StaticImage;
  placeholder?: "blur";
  width?: number | string;
  height?: number | string;
};

type ImageOwnProps = (StringSrcImageProps | StaticSrcImageProps) & {
    alt: string;
    quality?: number;
  };

export type ImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  keyof ImageOwnProps
> &
  ImageOwnProps;

export default function Image({ loading, decoding, quality = 75, style, onLoad, onError, ...props }: ImageProps) {
  const { src, width, height, placeholder } = normalizeSrc(props);
  const [isLoading, setLoading] = useState(true);

  return (
    <img
      {...props}
      src={getURL({ src, q: quality })}
      width={width}
      height={height}
      loading={loading ?? "lazy"}
      decoding={decoding ?? "async"}
      style={
        placeholder != null && isLoading
          ? {
              ...style,
              backgroundImage: `url(${placeholder})`,
              backgroundSize: "cover",
              backgroundPosition: "50% 50%",
              backgroundRepeat: "no-repeat",
            }
          : style
      }
      srcSet={(sizes as number[])
        .map((size) => `${getURL({ src, w: size, q: quality })} ${size}w`)
        .join(", ")}
      onLoad={(event) => {
        setLoading(false);
        onLoad?.(event);
      }}
      onError={(event) => {
        setLoading(false);
        onError?.(event);
      }}
    />
  );
}

interface UrlParams {
  src: string;
  q: number;
  w?: number;
  h?: number;
}

function getURL(params: UrlParams) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, value);
  }
  return `/api/image?${searchParams}`;
}

function normalizeSrc({ src, width, height, placeholder }: StaticSrcImageProps | StringSrcImageProps) {
  return typeof src === "string"
    ? { src, width, height }
    : {
        src: src.src,
        width: width ?? src.width,
        height: height ?? src.height,
        placeholder: placeholder === "blur" ? src.blurUrl : undefined
      };
}