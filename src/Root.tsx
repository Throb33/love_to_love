import {Composition} from 'remotion';
import {BlindDate} from './BlindDate';

export const RemotionRoot = () => {
  return (
    <Composition
      id="BlindDate"
      component={BlindDate}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
