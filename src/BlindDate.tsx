import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const colors = {
  cream: '#fff7ec',
  blush: '#f36f7f',
  coral: '#ff9b77',
  tea: '#2f806b',
  navy: '#25324b',
  ink: '#1d2333',
  mint: '#dff4e8',
  gold: '#f7c65f',
};

const Bubble = ({
  children,
  x,
  y,
  delay,
  align = 'left',
}: {
  children: string;
  x: number;
  y: number;
  delay: number;
  align?: 'left' | 'right';
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame: frame - delay * fps,
    fps,
    config: {damping: 18, stiffness: 110},
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        maxWidth: 390,
        padding: '22px 30px',
        borderRadius: 28,
        background: '#ffffff',
        boxShadow: '0 20px 45px rgba(37, 50, 75, 0.16)',
        color: colors.ink,
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: 34,
        fontWeight: 700,
        lineHeight: 1.22,
        transform: `translateY(${(1 - progress) * 24}px) scale(${0.86 + progress * 0.14})`,
        opacity: progress,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
};

const Person = ({
  side,
  delay,
}: {
  side: 'left' | 'right';
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay * fps,
    fps,
    config: {damping: 20, stiffness: 90},
  });
  const bob = Math.sin((frame - delay * fps) / 18) * 6;
  const isLeft = side === 'left';
  const baseX = isLeft ? 520 : 1200;
  const startX = isLeft ? -260 : 260;
  const hair = isLeft ? '#2b2430' : '#322018';
  const shirt = isLeft ? colors.tea : colors.blush;
  const accessory = isLeft ? colors.gold : colors.mint;

  return (
    <div
      style={{
        position: 'absolute',
        left: baseX,
        top: 365 + bob,
        width: 220,
        height: 420,
        transform: `translateX(${(1 - enter) * startX}px)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 0,
          width: 96,
          height: 108,
          borderRadius: '50% 50% 45% 45%',
          background: '#ffd7b3',
          boxShadow: `0 -22px 0 10px ${hair}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 84,
          top: 48,
          width: 11,
          height: 11,
          borderRadius: '50%',
          background: colors.ink,
          boxShadow: '45px 0 0 #1d2333',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 101,
          top: 78,
          width: 34,
          height: 15,
          borderBottom: '5px solid #b55a5a',
          borderRadius: '0 0 30px 30px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 36,
          top: 126,
          width: 150,
          height: 210,
          borderRadius: '72px 72px 34px 34px',
          background: shirt,
          boxShadow: '0 24px 0 rgba(0, 0, 0, 0.08)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: isLeft ? 17 : 154,
          top: 156,
          width: 44,
          height: 136,
          borderRadius: 28,
          background: '#ffd7b3',
          transform: `rotate(${isLeft ? -20 : 20}deg)`,
          transformOrigin: 'top center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: isLeft ? 151 : 20,
          top: 150,
          width: 46,
          height: 144,
          borderRadius: 28,
          background: '#ffd7b3',
          transform: `rotate(${isLeft ? 30 : -30}deg)`,
          transformOrigin: 'top center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 142,
          width: 58,
          height: 28,
          borderRadius: 16,
          background: accessory,
          opacity: 0.9,
        }}
      />
    </div>
  );
};

const Cafe = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const light = interpolate(
    frame,
    [0, 3 * fps, 9 * fps, 12 * fps],
    [0, 1, 1, 0.92],
    {...clamp, easing: ease},
  );
  const steam = (offset: number) =>
    interpolate((frame + offset) % 80, [0, 40, 80], [0, -44, -88], clamp);
  const steamOpacity = (offset: number) =>
    interpolate((frame + offset) % 80, [0, 20, 65, 80], [0, 0.8, 0.25, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.cream} 0%, #ffe6d7 55%, #ffd2c2 100%)`,
        opacity: light,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 22% 16%, rgba(255,255,255,0.9) 0 8%, transparent 18%), radial-gradient(circle at 76% 20%, rgba(255,255,255,0.65) 0 7%, transparent 17%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 330,
          background: '#f1b8a3',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 630,
          top: 650,
          width: 650,
          height: 72,
          borderRadius: 38,
          background: colors.navy,
          boxShadow: '0 26px 0 rgba(37, 50, 75, 0.14)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 862,
          top: 587,
          width: 150,
          height: 86,
          borderRadius: '0 0 54px 54px',
          background: '#ffffff',
          border: `10px solid ${colors.coral}`,
        }}
      />
      {[0, 23, 47].map((offset, i) => (
        <div
          key={offset}
          style={{
            position: 'absolute',
            left: 906 + i * 34,
            top: 575 + steam(offset),
            width: 16,
            height: 56,
            borderRadius: 30,
            background: 'rgba(255, 255, 255, 0.85)',
            opacity: steamOpacity(offset),
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 1120,
          top: 595,
          width: 98,
          height: 98,
          transform: 'rotate(-12deg)',
          color: colors.blush,
          fontSize: 92,
          fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          fontWeight: 900,
        }}
      >
        ♥
      </div>
    </AbsoluteFill>
  );
};

const Caption = ({text, from}: {text: string; from: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [from * fps, (from + 0.5) * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 70,
        textAlign: 'center',
        opacity,
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        color: colors.navy,
        fontSize: 46,
        fontWeight: 800,
        textShadow: '0 3px 0 rgba(255,255,255,0.8)',
      }}
    >
      {text}
    </div>
  );
};

const Hearts = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = interpolate(frame, [6 * fps, 11 * fps], [90, -90], clamp);
  const opacity = interpolate(
    frame,
    [5.8 * fps, 6.4 * fps, 10.5 * fps, 11.6 * fps],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 820 + i * 70,
            top: 405 + rise + Math.sin(frame / 15 + i) * 18,
            fontSize: 38 + i * 8,
            color: i % 2 === 0 ? colors.blush : colors.coral,
            opacity,
            transform: `rotate(${Math.sin(frame / 20 + i) * 16}deg)`,
            fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          }}
        >
          ♥
        </div>
      ))}
    </>
  );
};

export const BlindDate = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleOut = interpolate(frame, [1.8 * fps, 2.4 * fps], [1, 0], clamp);
  const endCard = interpolate(frame, [10.4 * fps, 11.4 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Cafe />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 115,
          textAlign: 'center',
          opacity: titleOut,
          fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          color: colors.navy,
          fontSize: 78,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        今天，刚好遇见你
      </div>
      <Person side="left" delay={1.2} />
      <Person side="right" delay={2.0} />
      <Bubble x={420} y={260} delay={2.8}>
        你好，我叫阿远。
      </Bubble>
      <Bubble x={1130} y={245} delay={4.1} align="right">
        我是小晴，很高兴见到你。
      </Bubble>
      <Bubble x={730} y={170} delay={5.8}>
        一杯热咖啡，聊出一点心动。
      </Bubble>
      <Hearts />
      <Caption text="从拘谨的第一句，到默契的微笑。" from={6.5} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 247, 236, 0.88)',
          opacity: endCard,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 390,
          textAlign: 'center',
          opacity: endCard,
          transform: `translateY(${(1 - endCard) * 30}px)`,
          fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          color: colors.navy,
          fontSize: 70,
          fontWeight: 900,
        }}
      >
        相亲，也可以很浪漫
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 500,
          textAlign: 'center',
          opacity: endCard,
          fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          color: colors.blush,
          fontSize: 48,
          fontWeight: 800,
        }}
      >
        Love to Love
      </div>
    </AbsoluteFill>
  );
};
