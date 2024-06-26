'use client';

import SkeletonCover from '@components/AcitivyPage/CoverSection/SkeletonCover';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@components/ui/carousel';
import cn from '@lib/utils';
import { useActivityContext } from '@store/ActivityProvider/ActivityProvider';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

type CoverSectionProps = {
  className: string;
};

const CoverSection = ({ className }: CoverSectionProps) => {
  const { data } = useActivityContext();

  if (!data) return <SkeletonCover />;

  return (
    <section className={cn('w-full', className)}>
      <Carousel
        className="w-full"
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent className="relative m-0 w-full">
          {data.activity.cover.map((cover) => {
            return (
              <CarouselItem
                key={cover}
                className="h-[23.4375rem] w-full p-0 xl:h-[50rem]"
              >
                <Image
                  src={cover}
                  width={200}
                  height={160}
                  sizes="100vw"
                  loading="eager"
                  className="h-full w-full"
                  alt={cover}
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {data.activity.cover.length !== 1 && (
          <>
            <CarouselPrevious className="top-100 left-100 absolute right-[2.5rem] h-[2.5rem] w-[2.5rem] -translate-y-10 rounded-none border-none xl:right-20 xl:h-20 xl:w-20 xl:-translate-y-20" />
            <CarouselNext className="top-100 left-100 absolute right-0 h-[2.5rem] w-[2.5rem] -translate-y-10 rounded-none border-none xl:h-20 xl:w-20 xl:-translate-y-20" />
          </>
        )}
      </Carousel>
    </section>
  );
};

export default CoverSection;
