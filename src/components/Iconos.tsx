import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { useTema } from '@/theme/TemaProvider';

/** Color del icono: el indicado o, por defecto, el del texto del tema. */
const useColorIcono = (color?: string) => {
  const { colors } = useTema();
  return color ?? colors.texto;
};

interface P {
  color?: string;
  tamano?: number;
}

const base = (tamano: number) => ({ width: tamano, height: tamano, viewBox: '0 0 24 24', fill: 'none' });

export function IconoHoy({ color: colorProp, tamano = 24 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.8} />
    <Path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </Svg>
  );
}

export function IconoCalendario({ color: colorProp, tamano = 24 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Rect x={3.5} y={5} width={17} height={15.5} rx={3} stroke={color} strokeWidth={1.8} />
    <Line x1={3.5} y1={10} x2={20.5} y2={10} stroke={color} strokeWidth={1.8} />
    <Line x1={8} y1={3} x2={8} y2={6.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={16} y1={3} x2={16} y2={6.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
  );
}

export function IconoPerfil({ color: colorProp, tamano = 24 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Circle cx={12} cy={8.5} r={4} stroke={color} strokeWidth={1.8} />
    <Path d="M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
  );
}

export function IconoMas({ color: colorProp, tamano = 24 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
  );
}

export function IconoFlecha({ color: colorProp, tamano = 22, dir = 'izq' }: P & { dir?: 'izq' | 'der' }) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Path
      d={dir === 'izq' ? 'M14.5 6l-6 6 6 6' : 'M9.5 6l6 6-6 6'}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
  );
}

export function IconoCerrar({ color: colorProp, tamano = 20 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
  );
}

/** Logo de Google con sus colores de marca, igual en tema claro y oscuro. */
export function IconoGoogle({ tamano = 20 }: P) {
  return (
  <Svg {...base(tamano)}>
    <Path
      d="M20.5 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.6-3.9 2.6-6.5z"
      fill="#4285F4"
    />
    <Path
      d="M12 21c2.4 0 4.4-.8 5.9-2.2L15 16.6c-.8.5-1.8.9-3 .9-2.3 0-4.3-1.6-5-3.7H4v2.3A9 9 0 0 0 12 21z"
      fill="#34A853"
    />
    <Path d="M7 13.8a5.4 5.4 0 0 1 0-3.5V8H4a9 9 0 0 0 0 8.1l3-2.3z" fill="#FBBC05" />
    <Path
      d="M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 4 8l3 2.3c.7-2.1 2.7-3.7 5-3.7z"
      fill="#EA4335"
    />
  </Svg>
  );
}

/** Logo de Facebook en su azul de marca, igual en tema claro y oscuro. */
export function IconoFacebook({ tamano = 20 }: P) {
  return (
  <Svg {...base(tamano)}>
    <Path
      d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z"
      fill="#0866FF"
    />
  </Svg>
  );
}

export function IconoApple({ color: colorProp, tamano = 20 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Path
      d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6a4.5 4.5 0 0 0-3.5-1.9c-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8A4.7 4.7 0 0 0 4.2 9.6c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.6-1-2.6-4.1zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"
      fill={color}
    />
  </Svg>
  );
}

export function IconoLapiz({ color: colorProp, tamano = 22 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Path
      d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path d="M13.5 6.5l4 4" stroke={color} strokeWidth={1.8} />
  </Svg>
  );
}

export function IconoBasurero({ color: colorProp, tamano = 22 }: P) {
  const color = useColorIcono(colorProp);
  return (
  <Svg {...base(tamano)}>
    <Path d="M4 7h16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M9 7V4.5h6V7" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M6 7l1 13h10l1-13" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
  );
}

export function IconoCorreo({ color: colorProp, tamano = 20 }: P) {
  const color = useColorIcono(colorProp);
  return (
    <Svg {...base(tamano)}>
      <Rect x={3.5} y={5.5} width={17} height={13} rx={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M4.5 7l7.5 6 7.5-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
