import { cn } from "@/lib/utils.ts";
import { Marquee } from "@/components/ui/marquee.tsx";

const reviews = [
  {
    name: "Event 1",
    img: "/images/marquee/Home - Foto Berjalan 1.webp",
  },
  {
    name: "Event 2",
    img: "/images/marquee/Home - Foto Berjalan 2.webp",
  },
  {
    name: "Event 3",
    img: "/images/marquee/Home - Foto Berjalan 3.webp",
  },
  {
    name: "Event 4",
    img: "/images/marquee/Home - Foto Berjalan 4.webp",
  },
  {
    name: "Event 5",
    img: "/images/marquee/Home - Foto Berjalan 5.webp",
  },
  {
    name: "Event 6",
    img: "/images/marquee/Home - Foto Berjalan 6.webp",
  },
  {
    name: "Event 7",
    img: "/images/marquee/Home - Foto Berjalan 7.webp",
  },
];

const ReviewCard = ({ name, img }: { name: string; img: string }) => {
  return (
    <figure
      className={cn(
        "relative flex h-full cursor-pointer justify-center rounded-2xl p-4",
        "hover:border-primary border-2 border-transparent hover:-translate-y-2 hover:shadow-xl",
      )}
    >
      <img
        className="h-[60dvh] w-[75dvw] rounded-xl border-2 object-cover"
        alt=""
        src={img}
      />
    </figure>
  );
};

export function MarqueeHome() {
  return (
    <div className="bg-background relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="px-8 [--duration:60s]">
        {reviews.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
    </div>
  );
}
