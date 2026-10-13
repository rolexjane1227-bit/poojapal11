import p1 from "@/assets/products/p1.jpg";
import p2 from "@/assets/products/p2.jpg";
import p3 from "@/assets/products/p3.jpg";
import p4 from "@/assets/products/p4.jpg";
import p5 from "@/assets/products/p5.jpg";
import p6 from "@/assets/products/p6.jpg";
import p7 from "@/assets/products/p7.jpg";
import p8 from "@/assets/products/p8.jpg";
import p9 from "@/assets/products/p9.jpg";
import p10 from "@/assets/products/p10.jpg";
import p11 from "@/assets/products/p11.jpg";
import p12 from "@/assets/products/p12.jpg";
import p13 from "@/assets/products/p13.jpg";
import p14 from "@/assets/products/p14.jpg";
import p15 from "@/assets/products/p15.jpg";
import p16 from "@/assets/products/p16.jpg";
import p17 from "@/assets/products/p17.jpg";
import p18 from "@/assets/products/p18.jpg";
import p19 from "@/assets/products/p19.jpg";
import p20 from "@/assets/products/p20.jpg";
import p21 from "@/assets/products/p21.jpg";
import p22 from "@/assets/products/p22.jpg";
import p23 from "@/assets/products/p23.jpg";
import p24 from "@/assets/products/p24.jpg";
import p25 from "@/assets/products/p25.jpg";
import p26 from "@/assets/products/p26.jpg";
import p27 from "@/assets/products/p27.jpg";
import p28 from "@/assets/products/p28.jpg";
import p29 from "@/assets/products/p29.jpg";
import p30 from "@/assets/products/p30.jpg";
import p31 from "@/assets/products/p31.jpg";
import p32 from "@/assets/products/p32.jpg";
import p33 from "@/assets/products/p33.jpg";
import p34 from "@/assets/products/p34.jpg";
import p35 from "@/assets/products/p35.jpg";
import p36 from "@/assets/products/p36.jpg";
import beerImage from "@/assets/products/beer.jpg";
import whiskyImage from "@/assets/products/whisky.jpg";
import spiritImage from "@/assets/products/rum-vodka.jpg";
import wineImage from "@/assets/products/wine.jpg";
import softDrinkImage from "@/assets/products/soft-drinks.jpg";
import foodImage from "@/assets/products/food.jpg";
import snacksImage from "@/assets/products/snacks.jpg";
import { cn } from "@/lib/utils";

const productImages: Record<string, string> = {
  p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18,
  p19, p20, p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, p35, p36,
};

const categoryImages: Record<string, string> = {
  beer: beerImage,
  whisky: whiskyImage,
  rum: spiritImage,
  wine: wineImage,
  soft: softDrinkImage,
  food: foodImage,
  snacks: snacksImage,
};

export function ProductThumbnail({ productId, categoryId, name, className }: { productId?: string; categoryId: string; name: string; className?: string }) {
  const src = (productId && productImages[productId]) ?? categoryImages[categoryId] ?? foodImage;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={816}
      height={816}
      className={cn("object-cover", className)}
      title={name}
    />
  );
}
