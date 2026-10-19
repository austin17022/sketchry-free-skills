// 號碼布的紙：Tyvek 的纖維紋＋極淡顆粒。靜止不動
export async function paper(canvas, color = '#fcfbf7') {
  try {
    const { createShader } = await import('https://cdn.jsdelivr.net/npm/shaders@4.0.2/dist/js/bundle.js');
    await createShader(canvas, { components: [
      { type: 'SolidColor', props: { color } },
      { type: 'Paper', props: { roughness: 0.32, grainScale: 1.8, displacement: 0.1, seed: 23 } },
      { type: 'FilmGrain', props: { strength: 0.06, bias: 0 } },
    ] }, { disableTelemetry: true, onError: () => {}, onReady: () => { window.__ready = true; } });
  } catch (e) { console.warn('shader 沒啟動，用 CSS 備援', e); }
  setTimeout(() => { window.__ready = true; }, 4000);
}
document.querySelectorAll('canvas.fx').forEach(c => paper(c, c.dataset.color));
if (!document.querySelector('canvas.fx')) window.__ready = true;
