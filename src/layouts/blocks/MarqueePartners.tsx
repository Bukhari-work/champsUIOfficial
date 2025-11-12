import { cn } from "@/lib/utils.ts";
import { Marquee } from "@/components/ui/marquee.tsx";

const ReviewCard = ({ name, img }: { name: string; img: string }) => {
  return (
    <figure
      className={cn(
        "relative flex h-full cursor-pointer justify-center rounded-2xl p-4",
        "hover:border-primary border-2 border-transparent hover:-translate-y-2 hover:shadow-xl",
      )}
    >
      {" "}
      <img
        className="h-[100px] w-[100px] rounded-lg border-2 object-cover"
        alt={name}
        src={img}
      />{" "}
    </figure>
  );
};
export function MarqueePartners({
  imagePaths,
  reverse = false,
  duration = "20",
  // secondsPerItem = 1,
}: {
  imagePaths: string[];
  reverse?: boolean;
  duration?: string;
  // secondsPerItem?: number;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <Marquee
        pauseOnHover
        reverse={reverse}
        className={`px-8 [--duration:${duration}s]`}
      >
        {/* Map over the new, longer array for rendering */}
        {imagePaths.map((path, index) => (
          <ReviewCard
            // Use the index for the key as paths are now duplicated
            key={index}
            name={`Partner Image ${index + 1}`}
            img={path}
          />
        ))}
      </Marquee>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
    </div>
  );
}
