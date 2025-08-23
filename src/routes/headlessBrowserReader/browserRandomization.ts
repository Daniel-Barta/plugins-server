import { Page } from 'puppeteer';

import { env } from '@/common/utils/envConfig';

// User Agent pools for different browsers and operating systems
export const getRandomUserAgent = (): string => {
  const userAgents = [
    // Chrome on Windows (latest versions)
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',

    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    // Chrome on Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',

    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',

    // Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',

    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Common screen resolutions with realistic distributions
export const getRandomViewport = () => {
  const viewports = [
    // Most common resolutions
    { width: 1920, height: 1080 }, // Most popular
    { width: 1366, height: 768 }, // Very common on laptops
    { width: 1536, height: 864 }, // Common Windows scaling
    { width: 1440, height: 900 }, // MacBook Air

    // Other popular resolutions
    { width: 1280, height: 720 }, // HD
    { width: 1600, height: 900 }, // 16:9 ratio
    { width: 2560, height: 1440 }, // 1440p
    { width: 1680, height: 1050 }, // 16:10 ratio
    { width: 1280, height: 800 }, // MacBook 13"
    { width: 1024, height: 768 }, // 4:3 ratio
    { width: 1280, height: 1024 }, // 5:4 ratio
    { width: 1920, height: 1200 }, // 16:10 ratio
  ];
  return viewports[Math.floor(Math.random() * viewports.length)];
};

// Generate random delay to simulate human behavior
export const getRandomDelay = (min: number = 100, max: number = 3000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Randomize HTTP headers to look more like a real browser
export const setRandomHeaders = async (page: Page): Promise<void> => {
  const acceptLanguages = [
    'en-US,en;q=0.9',
    'en-US,en;q=0.9,es;q=0.8',
    'en-GB,en;q=0.9',
    'en-US,en;q=0.8,fr;q=0.6',
    'en-CA,en;q=0.9',
  ];

  const headers: Record<string, string> = {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
  };
  if (Math.random() > 0.5) headers.DNT = '1';

  await page.setExtraHTTPHeaders(headers);
};

// Advanced browser fingerprinting evasion
export const setupBrowserEvasion = async (
  page: Page,
  level: 'light' | 'standard' | 'aggressive' = env.HEADLESS_STEALTH_LEVEL as 'light' | 'standard' | 'aggressive'
): Promise<void> => {
  // Minimal evasion
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  if (level === 'standard' || level === 'aggressive') {
    await page.evaluateOnNewDocument(() => {
      // Override the plugins property to use a fake plugin array
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {
              type: 'application/x-google-chrome-pdf',
              suffixes: 'pdf',
              description: 'Portable Document Format',
              enabledPlugin: null,
            },
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            length: 1,
            name: 'Chrome PDF Plugin',
          },
          {
            0: {
              type: 'application/pdf',
              suffixes: 'pdf',
              description: '',
              enabledPlugin: null,
            },
            description: '',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            length: 1,
            name: 'Chrome PDF Viewer',
          },
          {
            0: {
              type: 'application/x-nacl',
              suffixes: '',
              description: 'Native Client Executable',
              enabledPlugin: null,
            },
            1: {
              type: 'application/x-pnacl',
              suffixes: '',
              description: 'Portable Native Client Executable',
              enabledPlugin: null,
            },
            description: '',
            filename: 'internal-nacl-plugin',
            length: 2,
            name: 'Native Client',
          },
        ],
      });

      // Mock chrome object
      (window as any).chrome = {
        runtime: {},
        loadTimes: function () {
          const connectionInfo = ['http/1.1', 'h2', 'http/1.0'][Math.floor(Math.random() * 3)];
          const navigationType = ['Other', 'Link', 'Reload'][Math.floor(Math.random() * 3)];

          return {
            commitLoadTime: Date.now() / 1000 - Math.random() * 100,
            connectionInfo,
            finishDocumentLoadTime: Date.now() / 1000 - Math.random() * 100,
            finishLoadTime: Date.now() / 1000 - Math.random() * 100,
            firstPaintAfterLoadTime: 0,
            firstPaintTime: Date.now() / 1000 - Math.random() * 100,
            navigationType,
            npnNegotiatedProtocol: connectionInfo,
            requestTime: Date.now() / 1000 - Math.random() * 100,
            startLoadTime: Date.now() / 1000 - Math.random() * 100,
            wasAlternateProtocolAvailable: Math.random() > 0.5,
            wasFetchedViaSpdy: Math.random() > 0.5,
            wasNpnNegotiated: Math.random() > 0.5,
          };
        },
      };

      // Randomize language preferences
      const languages = [
        ['en-US', 'en'],
        ['en-GB', 'en'],
        ['en-CA', 'en', 'fr'],
        ['en-US', 'en', 'es'],
      ];
      const randomLanguages = languages[Math.floor(Math.random() * languages.length)];

      Object.defineProperty(navigator, 'languages', {
        get: () => randomLanguages,
      });

      Object.defineProperty(navigator, 'language', {
        get: () => randomLanguages[0],
      });

      // Mock permissions
      const originalQuery = (window as any).navigator.permissions?.query;
      if (originalQuery) {
        (window as any).navigator.permissions.query = (parameters: any) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters);
      }

      // Mock hardware concurrency (CPU cores)
      const cores = [2, 4, 6, 8, 12, 16][Math.floor(Math.random() * 6)];
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => cores,
      });

      // Mock device memory (in GB)
      const memory = [2, 4, 8, 16][Math.floor(Math.random() * 4)];
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => memory,
      });

      // Mock screen properties
      Object.defineProperty(screen, 'colorDepth', {
        get: () => 24,
      });

      Object.defineProperty(screen, 'pixelDepth', {
        get: () => 24,
      });

      Date.prototype.getTimezoneOffset = function () {
        const offsets = [-300, -480, -360, -420, 0, 60, 540];
        return offsets[Math.floor(Math.random() * offsets.length)];
      };
    });
  }

  if (level === 'aggressive') {
    await page.evaluateOnNewDocument(() => {
      // Mock WebRTC to prevent IP leaks
      const originalRTCPeerConnection = (window as any).RTCPeerConnection;
      (window as any).RTCPeerConnection = function (...args: any[]) {
        const pc = new originalRTCPeerConnection(...args);
        const originalCreateDataChannel = pc.createDataChannel;
        pc.createDataChannel = function (...args: any[]) {
          return originalCreateDataChannel.apply(this, args);
        };
        return pc;
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = function () {
          return Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
        };
      }

      if ('getBattery' in navigator) {
        (navigator as any).getBattery = () =>
          Promise.resolve({
            charging: Math.random() > 0.5,
            chargingTime: Math.random() * 10000,
            dischargingTime: Math.random() * 10000,
            level: Math.random(),
            addEventListener: () => {},
            removeEventListener: () => {},
          });
      }

      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function (type?: string, quality?: number) {
        const imageData = originalToDataURL.call(this, type, quality);
        const noise = Math.random().toString(36).substring(2, 4);
        return imageData.replace(/=+$/, '') + noise + '==';
      };

      const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) {
          const vendors = ['Intel Inc.', 'NVIDIA Corporation', 'ATI Technologies Inc.'];
          return vendors[Math.floor(Math.random() * vendors.length)];
        }
        if (parameter === 37446) {
          const renderers = ['Intel Iris OpenGL Engine', 'NVIDIA GeForce GTX 1060', 'AMD Radeon R9 200 Series'];
          return renderers[Math.floor(Math.random() * renderers.length)];
        }
        return originalGetParameter.call(this, parameter);
      };
    });
  }
};

// Simulate human-like mouse movements
export const simulateHumanBehavior = async (page: Page, viewport: { width: number; height: number }): Promise<void> => {
  // Random number of mouse movements (0-5)
  const movements = Math.floor(Math.random() * 6);

  for (let i = 0; i < movements; i++) {
    // Random position within viewport
    const x = Math.random() * viewport.width;
    const y = Math.random() * viewport.height;

    // Move mouse with some randomness in timing
    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) + 1 });

    // Random delay between movements
    await new Promise((resolve) => setTimeout(resolve, getRandomDelay(100, 800)));
  }

  // Occasionally simulate scrolling
  if (Math.random() < 0.3) {
    // 30% chance
    const scrolls = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < scrolls; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, Math.random() * 300 - 150); // Random scroll amount
      });
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay(200, 1000)));
    }
  }
};

// Get randomized browser launch arguments
export const getRandomizedLaunchArgs = (): string[] => {
  const baseArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-zygote',
    '--disable-extensions',
    '--disable-default-apps',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--no-default-browser-check',
  ];

  const args = [...baseArgs];
  if (env.HEADLESS) args.push('--disable-gpu');
  if (env.HEADLESS_STEALTH_LEVEL !== 'light') args.push('--disable-blink-features=AutomationControlled');

  if (env.HEADLESS_STEALTH_LEVEL === 'aggressive') {
    if (Math.random() > 0.5) args.push('--memory-pressure-off');
    const processLimit = [1, 2, 4][Math.floor(Math.random() * 3)];
    args.push(`--renderer-process-limit=${processLimit}`);
    if (Math.random() > 0.5) args.push('--disable-smooth-scrolling');
  }

  if (env.HEADLESS_LAUNCH_EXTRA_ARGS) {
    const extra = env.HEADLESS_LAUNCH_EXTRA_ARGS.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    args.push(...extra);
  }

  return args;
};
