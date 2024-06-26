import ActivityLocationMarker from '@components/GoogleMaps/ActivityLocationMarker';
import { P } from '@components/ui/typography';
import cn from '@lib/utils';
import { useActivityContext } from '@store/ActivityProvider/ActivityProvider';

type MapSectionProps = {
  className: string;
};

const MapSection = ({ className }: MapSectionProps) => {
  const { data } = useActivityContext();

  return (
    <section
      className={cn(
        'border-y py-6 text-primary xl:py-12',
        'space-y-4 xl:space-y-6',
        className
      )}
    >
      <div className="text-2xl font-bold -tracking-[0.006em] xl:text-3xl xl:-tracking-[0.0075em]">
        活動地點
      </div>
      <P>{`${data?.activity.address}（${data?.activity.location}）`}</P>
      <ActivityLocationMarker
        className="h-[23.3125rem] w-full"
        lat={data?.activity.lat ?? 0}
        lng={data?.activity.lng ?? 0}
      />
    </section>
  );
};

export default MapSection;
