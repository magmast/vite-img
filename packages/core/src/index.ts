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

export type SrcImageProps = StringSrcImageProps | StaticSrcImageProps;

type ImageOwnProps = SrcImageProps & {
    alt: string;
    quality?: number;
  };

function isStringSrcImageProps(props: SrcImageProps): props is StringSrcImageProps {
  return typeof props.src === 'string';
}

export type ImageProps<TImgProps> = Omit<TImgProps, keyof ImageOwnProps> & ImageOwnProps;

export function getSource(props: SrcImageProps) {
  return isStringSrcImageProps(props)
    ? { src: props.src, width: props.width, height: props.height }
    : {
        src: props.src.src,
        width: props.width ?? props.src.width,
        height: props.height ?? props.src.height,
        placeholder: props.placeholder === "blur" ? props.src.blurUrl : undefined,
      };
}
