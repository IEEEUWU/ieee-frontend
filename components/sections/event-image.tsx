"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { safeCoverSource } from "@/lib/events/cover";
const fallback = "/photos/robotics-arm.jpg";
function ImageWithFallback({ src, alt, ...props }: Omit<ImageProps, "src" | "onError"> & { src: string }) {
  const [source, setSource] = useState(() => safeCoverSource(src));
  return <Image {...props} alt={alt} src={source} unoptimized onError={() => { if (source !== fallback) setSource(fallback); }} />;
}
export function EventImage(props: Omit<ImageProps, "src" | "onError"> & { src: string }) {
  return <ImageWithFallback key={props.src} {...props} />;
}
