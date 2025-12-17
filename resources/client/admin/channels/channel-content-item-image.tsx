import {NormalizedModel} from '@ui/types/normalized-model';
import {useImageSrc} from '@app/images/use-image-src';
import clsx from 'clsx';
import {ImageIcon} from '@ui/icons/material/Image';
import {OptimizedImage} from '@app/common/components/OptimizedImage';

interface Props {
  item: NormalizedModel;
}
export function ChannelContentItemImage({item}: Props) {
  const src = useImageSrc(item.image, {size: 'sm'});

  const imageClassName = clsx(
    'aspect-square w-40 rounded object-cover',
    !src ? 'flex items-center justify-center' : 'block',
  );

  return src ? (
    <OptimizedImage className={imageClassName} src={src} width={160} height={160} quality={85} alt="" />
  ) : (
    <span className={imageClassName}>
      <ImageIcon className="max-w-[60%] text-divider" size="text-6xl" />
    </span>
  );
}
