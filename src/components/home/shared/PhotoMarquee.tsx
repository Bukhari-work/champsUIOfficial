import { Marquee } from "@/components/ui/marquee";
const photos = Array.from(
  { length: 7 },
  (_, index) => `/images/marquee/Home - Foto Berjalan ${index + 1}.webp`,
);
export function PhotoMarquee() {
  return (
    <div className="bg-background relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <Marquee
        pauseOnHover
        className="px-4 [--duration:60s] [&:hover>div]:paused motion-reduce:[&>div]:animate-none"
      >
        {photos.map((src) => (
          <figure
            key={src}
            className="relative flex h-full justify-center rounded-2xl border-2 border-transparent p-1"
          >
            <img
              className="h-36 w-56 rounded-xl border object-cover sm:h-44 sm:w-72"
              alt=""
              src={src}
              loading="lazy"
              width={320}
              height={208}
            />
          </figure>
        ))}
      </Marquee>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-linear-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-linear-to-l"></div>
    </div>
  );
}
