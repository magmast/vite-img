import sizes from "virtual:vite-img/sizes";
import { createSignal, splitProps, type ComponentProps } from "solid-js";
import { isServer } from "solid-js/web";
import {
  getSource,
  getUrl,
  type ImageProps as CreateImageProps,
  type SrcImageProps,
} from "@vite-img/core";

export type ImageProps = CreateImageProps<ComponentProps<"img">>;

export default function Image(props: ImageProps) {
  const [srcProps, rest] = splitProps(props, [
    "src",
    "width",
    "height",
    "placeholder",
  ]);
  const src = () => getSource(srcProps as SrcImageProps);
  const [isLoading, setLoading] = createSignal(!isServer);
  const quality = () => props.quality ?? 75;

  return (
    <img
      {...rest}
      src={getUrl({ src: src().src, q: quality() })}
      srcSet={sizes
        .map(
          (size) =>
            `${getUrl({ src: src().src, w: size, q: quality() })} ${size}w`,
        )
        .join(", ")}
      width={src().width}
      height={src().height}
      style={
        src().placeholder != null && isLoading()
          ? {
              ...(typeof rest.style === "object" ? rest.style : {}),
              "background-image": `url(${src().placeholder})`,
              "background-size": "cover",
              "background-position": "50% 50%",
              "background-repeat": "no-repeat",
            }
          : rest.style
      }
      onLoad={[() => setLoading(false), props.onLoad]}
      onError={[() => setLoading(false), props.onError]}
    />
  );
}
