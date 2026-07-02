// SVG → Image 栅格化：让 Canvas 游戏运行时使用与草图完全一致的矢量素材。

const cache = new Map<string, Promise<HTMLImageElement>>();

export function svgToImage(svg: string): Promise<HTMLImageElement> {
  const hit = cache.get(svg);
  if (hit) return hit;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
  cache.set(svg, p);
  return p;
}

/** 把以 (0,0) 为锚点的道具片段包成独立 SVG（渲染尺寸 128，绘制时按需缩放） */
export function wrapPropSVG(inner: string, span = 96): string {
  const half = span / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-half} ${-half} ${span} ${span}" width="128" height="128">${inner}</svg>`;
}
