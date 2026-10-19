// iPhone 狀態列（9:41、訊號、Wi-Fi、電池），顏色跟著 data-bar="light|dark"
const dark = document.body.dataset.bar === 'light' ? '#fff' : '#111';
const bar = document.createElement('div');
bar.setAttribute('aria-hidden', 'true');
bar.style.cssText = `position:absolute;left:0;right:0;top:0;height:54px;display:flex;justify-content:space-between;align-items:center;padding:6px 30px 0 44px;color:${dark};font:600 17px -apple-system,"SF Pro Text",system-ui;z-index:50;pointer-events:none`;
bar.innerHTML = `<span>9:41</span><span style="display:flex;gap:6px;align-items:center">
<svg width="18" height="12" viewBox="0 0 18 12" fill="${dark}"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
<svg width="16" height="12" viewBox="0 0 16 12" fill="${dark}"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.2-1.3C13.3 1.7 10.8.7 8 .7S2.7 1.7.8 3.6L2 4.9c1.6-1.5 3.7-2.4 6-2.4zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.3C11.5 4.8 9.8 4.1 8 4.1s-3.5.7-4.8 1.9l1.2 1.3c1-.9 2.2-1.4 3.6-1.4zm0 3.3c.6 0 1.1.2 1.5.6L8 11.3 6.5 9.8c.4-.4.9-.6 1.5-.6z"/></svg>
<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="${dark}" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="${dark}"/><rect x="24.5" y="4.5" width="1.5" height="4" rx=".75" fill="${dark}" opacity=".4"/></svg></span>`;
document.body.prepend(bar);
