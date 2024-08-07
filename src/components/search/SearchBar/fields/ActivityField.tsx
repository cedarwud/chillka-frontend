'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import { Input } from '@components/ui/input';
import { H4 } from '@components/ui/typography';
import cn from '@lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import ActivityResultThumbnail, {
  SkeletonActivityResultThumbnail,
} from './ActivityResultThumbnail';
import menuAnimationVariants from './utils';

export type ActivityKeyword = {
  url: string;
  keyword: string;
};

export type ActivityPicture = {
  thumbnail: string;
  id: string;
  description: string;
};

export type ActivityFieldProps = {
  side?: 'top' | 'bottom';
  activityKeywords: ActivityKeyword[];
  activityPictures: ActivityPicture[];
  value: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
  menuOpen?: boolean;
  onMenuOpen?: (isOpen: boolean) => void;
};

const ActivityField = ({
  side = 'top',
  activityKeywords,
  activityPictures,
  value,
  isLoading = false,
  onChange,
  menuOpen = false,
  onMenuOpen,
}: ActivityFieldProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(menuOpen);
  const searchBarTriggerRef = useRef<HTMLButtonElement | null>(null);
  const searchBarInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenChange = (open: boolean) => {
    onMenuOpen?.(open);
  };

  return (
    <Popover open={isMenuOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        ref={searchBarTriggerRef}
        asChild
        onClick={() => {
          if (searchBarInputRef.current) {
            searchBarInputRef.current.focus();
          }
        }}
      >
        <div
          className={cn(
            'mt-0 grow border-y border-primary py-4 hover:cursor-pointer data-[state=open]:hover:cursor-default',
            {
              'border-b-0': side === 'bottom' && isMenuOpen,
              'mt-[1px] border-t-0': side === 'top' && isMenuOpen,
            }
          )}
        >
          <div className="space-y-2 border-x border-primary px-4">
            <p className="font-bold">活動</p>
            <Input
              type="text"
              className="h-fit w-full border-none p-0 text-base placeholder:text-primary focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="搜尋關鍵字"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                setIsMenuOpen(() => true);
              }}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        sticky="always"
        side={side}
        align="start"
        sideOffset={0}
        className={cn(
          'z-30 mx-auto min-w-[81rem]',
          `${side === 'bottom' && 'mt-[-0.5rem] border-b border-t-0'}`,
          `${side === 'top' && 'mb-[0.5rem] border-b-0 border-t'}`
        )}
        onPointerDownOutside={(e) => {
          const open = searchBarTriggerRef.current?.contains(e.target as Node);
          setIsMenuOpen(!!open);
        }}
        onEscapeKeyDown={() => setIsMenuOpen(() => false)}
        // prevent auto focusing for input text
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <motion.div
          className="border-x border-primary bg-surface py-12"
          variants={menuAnimationVariants}
          initial="closed"
          animate={isMenuOpen ? 'open' : 'closed'}
          custom={{ size: 2500, locationX: 0, locationY: 500 }}
        >
          <p className="ml-4 text-base font-bold">推薦活動</p>
          <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto overflow-y-hidden px-4">
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => {
                const id = index;
                return <SkeletonActivityResultThumbnail key={id} />;
              })}
            {!isLoading &&
              activityPictures.map((item, index) => {
                const num = index;
                return (
                  <ActivityResultThumbnail
                    key={num}
                    thumbnail={item.thumbnail}
                    description={item.description}
                    id={item.id}
                  />
                );
              })}
          </div>
          <div className="mt-10 px-4 xl:mt-12">
            <p className="text-base font-bold">熱門關鍵字</p>
            <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto overflow-y-hidden">
              {/* TODO: link to search page */}
              {activityKeywords.map((item) => (
                <Link
                  href={item.url}
                  className="w-fit rounded-2xl border px-4 py-2 font-medium"
                  key={item.keyword}
                >
                  {item.keyword}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

export type ActivityMobileFieldProps = {
  activityKeywords: ActivityKeyword[];
  activityPictures: ActivityPicture[];
  isLoading?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const ActivityMobileField = ({
  activityKeywords,
  activityPictures,
  isLoading = false,
  value,
  onChange,
}: ActivityMobileFieldProps) => {
  return (
    <div className="flex flex-col justify-between text-primary">
      <div className="mx-3 mt-10 flex border-0 border-b border-primary pb-4 pt-2">
        <Input
          type="text"
          placeholder="搜尋活動關鍵字"
          className="h-fit w-full border-none p-0 text-base placeholder:text-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className="px-3"
          type="submit"
          aria-label="Search activities button"
        >
          <SearchIcon className="size-6" />
        </button>
      </div>
      <div className="mt-4">
        <p className="ml-3 text-base font-bold">推薦活動</p>
        <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto overflow-y-hidden px-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => {
              const id = index;
              return <SkeletonActivityResultThumbnail key={id} />;
            })}
          {!isLoading &&
            activityPictures.map((item, index) => {
              const num = index;
              return (
                <ActivityResultThumbnail
                  key={num}
                  thumbnail={item.thumbnail}
                  description={item.description}
                  id={item.id}
                />
              );
            })}
        </div>
        <div className="mt-10 px-3">
          <p className="text-base font-bold">熱門關鍵字</p>
          <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto overflow-y-hidden">
            {/* TODO: link to search page */}
            {activityKeywords.map((item) => (
              <Link
                href={item.url}
                className="w-fit rounded-2xl border px-4 py-2 font-medium"
                key={item.keyword}
              >
                {item.keyword}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export type AdvancedActivityMobileFieldProps = {
  activityKeywords: ActivityKeyword[];
  activityPictures: ActivityPicture[];
  isLoading?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const AdvancedActivityMobileField = ({
  activityKeywords,
  activityPictures,
  isLoading = false,
  value,
  onChange,
}: AdvancedActivityMobileFieldProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger
          className={cn(
            ' bg-surface px-3 py-6',
            'min-w-[21.9375rem] border-0 hover:no-underline'
          )}
        >
          <H4>關鍵字</H4>
        </AccordionTrigger>
        <AccordionContent className="">
          <ActivityMobileField
            activityKeywords={activityKeywords}
            activityPictures={activityPictures}
            isLoading={isLoading}
            value={value}
            onChange={onChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ActivityField;
