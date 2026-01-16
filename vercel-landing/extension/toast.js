// Toast notification system for visual feedback

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 250px;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    `;

    const icon = this.getIcon(type);
    toast.innerHTML = `
      <span style="font-size: 18px;">${icon}</span>
      <span style="flex: 1;">${message}</span>
      <button class="toast-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">×</button>
    `;

    this.container.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.remove(toast);
    });

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  remove(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  getBackgroundColor(type) {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      loading: '#6366f1'
    };
    return colors[type] || colors.info;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳'
    };
    return icons[type] || icons.info;
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  loading(message) {
    const toast = this.show(message, 'loading', 0);
    toast.querySelector('span:first-child').style.animation = 'spin 1s linear infinite';
    return toast;
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Global toast instance
const toast = new ToastManager();






