import Image from "next/image";

type ProductVisualProps = {
  src: string;
  alt: string;
  priority?: boolean;
  caption?: string;
};

export function ProductVisual({
  src,
  alt,
  priority = false,
  caption,
}: ProductVisualProps) {
  return (
    <figure className="ax-product-visual">
      <div className="ax-product-visual-frame">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={900}
          priority={priority}
          sizes="(max-width: 960px) 100vw, 560px"
          className="ax-product-visual-img"
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
