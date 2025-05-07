export const useToast = () => {
  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 5000
  ) => {
    if (!process.client) return;
    
    // Create toast element
    const toast = document.createElement('div');
    
    // Set class based on type
    let bgColor, textColor, iconColor, borderColor;
    let iconSvg = '';
    
    switch (type) {
      case 'success':
        bgColor = 'bg-green-50';
        textColor = 'text-green-800';
        iconColor = 'text-green-400';
        borderColor = 'border-green-200';
        iconSvg = `<svg class="h-5 w-5 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>`;
        break;
      case 'error':
        bgColor = 'bg-red-50';
        textColor = 'text-red-800';
        iconColor = 'text-red-400';
        borderColor = 'border-red-200';
        iconSvg = `<svg class="h-5 w-5 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
        break;
      case 'warning':
        bgColor = 'bg-yellow-50';
        textColor = 'text-yellow-800';
        iconColor = 'text-yellow-400';
        borderColor = 'border-yellow-200';
        iconSvg = `<svg class="h-5 w-5 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>`;
        break;
      case 'info':
      default:
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-800';
        iconColor = 'text-blue-400';
        borderColor = 'border-blue-200';
        iconSvg = `<svg class="h-5 w-5 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
        break;
    }
    
    toast.className = `fixed bottom-4 right-4 ${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 max-w-sm z-50`;
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${iconSvg}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium ${textColor}">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex ${iconColor} hover:${textColor}">
            <span class="sr-only">ปิด</span>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Add click handler to close button
    const closeButton = toast.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        toast.remove();
      });
    }
    
    // Auto remove after specified duration
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.remove();
      }
    }, duration);
  };
  
  return {
    showToast
  };
}; 