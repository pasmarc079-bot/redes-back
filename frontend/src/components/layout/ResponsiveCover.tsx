interface ResponsiveCoverProps {
  desktopImage?: string;
  mobileImage?: string;
  alt: string;
}

export default function ResponsiveCover({ desktopImage, mobileImage, alt }: ResponsiveCoverProps) {
  const fallback = desktopImage || mobileImage;
  if (!fallback) return null;

  return (
    <picture className="absolute inset-0 block" aria-hidden="true">
      <source media="(max-width: 767px)" srcSet={mobileImage || fallback} />
      <img src={fallback} alt={alt} className="h-full w-full object-cover object-center" />
    </picture>
  );
}
