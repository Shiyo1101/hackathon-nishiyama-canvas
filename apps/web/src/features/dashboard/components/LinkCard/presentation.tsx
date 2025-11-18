"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type LinkCardPresentationProps = {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
};

export const LinkCardPresentation = ({
  title,
  description,
  imageUrl,
  href,
}: LinkCardPresentationProps): React.JSX.Element => {
  return (
    <Link href={href} className="group block">
      <Card className="relative h-[280px] overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end p-6">
          <h3 className="group-hover:-translate-y-1 mb-2 font-bold text-white text-xl leading-tight transition-transform duration-300">
            {title}
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">{description}</p>
        </div>

        <div className="absolute inset-0 bg-orange-400/0 transition-all duration-300 group-hover:bg-orange-400/10" />
      </Card>
    </Link>
  );
};
