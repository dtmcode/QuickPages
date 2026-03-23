// 📂 PFAD: frontend/src/lib/toast.ts
// Ersetzt die alte Version die alert() nutzte

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '✅' },
  error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
  info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '⚠️' },
};

let toastContainer: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (toastContainer && document.body.contains(toastContainer)) {
    return toastContainer;
  }

  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
    max-width: 24rem;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

function createToastElement(options: ToastOptions): HTMLDivElement {
  const { message, type = 'info', duration = 4000 } = options;
  const colors = TOAST_COLORS[type];

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${colors.bg};
    border: 1px solid ${colors.border};
    color: ${colors.text};
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    max-width: 24rem;
    animation: toastSlideIn 0.3s ease-out;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
  `;

  toast.innerHTML = `
    <span style="flex-shrink:0">${colors.icon}</span>
    <span style="flex:1">${message}</span>
    <button style="flex-shrink:0;background:none;border:none;cursor:pointer;color:${colors.text};opacity:0.6;font-size:1rem;line-height:1;padding:0" onclick="this.parentElement.remove()">×</button>
  `;

  // Klick zum Schließen
  toast.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 200);
  });

  // Auto-Close
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 200);
    }
  }, duration);

  return toast;
}

// Inject Animation CSS (einmalig)
function injectStyles() {
  if (document.getElementById('toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}

// ==================== PUBLIC API ====================

export function toast(message: string, type: ToastType = 'info', duration?: number) {
  if (typeof document === 'undefined') return; // SSR guard
  injectStyles();
  const container = getContainer();
  const el = createToastElement({ message, type, duration });
  container.appendChild(el);
}

export function toastSuccess(message: string) {
  toast(message, 'success');
}

export function toastError(message: string) {
  toast(message, 'error', 6000);
}

export function toastWarning(message: string) {
  toast(message, 'warning');
}

export function toastInfo(message: string) {
  toast(message, 'info');
}

// ✅ Backward Compatibility: Default Export
export default { toast, toastSuccess, toastError, toastWarning, toastInfo };