# Headless Browser Reader

This module provides advanced web scraping capabilities with comprehensive browser fingerprint randomization to avoid detection by anti-bot systems.

## Enhanced Randomization Features

### 1. **User Agent Randomization**

- Rotates between 20+ realistic user agents from Chrome, Firefox, Edge, and Safari
- Includes different operating systems (Windows, macOS, Linux)
- Uses recent browser versions to avoid outdated fingerprints

### 2. **Viewport & Screen Resolution**

- Randomizes viewport dimensions from common screen resolutions
- Includes popular resolutions like 1920x1080, 1366x768, 1440x900, etc.
- Prevents detection based on consistent screen size

### 3. **HTTP Headers Randomization**

- Randomizes Accept-Language headers
- Varies Do Not Track (DNT) settings
- Sets realistic accept encoding and connection headers
- Includes security headers like Sec-Fetch-\* to mimic real browsers

### 4. **Browser Fingerprinting Evasion**

- **WebDriver Detection**: Removes `navigator.webdriver` property
- **Plugin Spoofing**: Mocks realistic browser plugins
- **Language Settings**: Randomizes navigator.languages array
- **Hardware Spoofing**: Randomizes CPU cores and device memory
- **Chrome Object**: Mocks Chrome-specific APIs with realistic values
- **Permissions API**: Handles permission queries realistically
- **Screen Properties**: Sets consistent color depth and pixel depth

### 5. **Advanced Fingerprint Protection**

- **Canvas Fingerprinting**: Adds noise to canvas.toDataURL() output
- **WebGL Fingerprinting**: Randomizes GPU vendor and renderer strings
- **WebRTC Blocking**: Prevents IP leak through WebRTC
- **Battery API**: Mocks battery status with random values
- **Media Devices**: Blocks microphone/camera access requests
- **Timezone Spoofing**: Randomizes timezone offset

### 6. **Human Behavior Simulation**

- **Mouse Movements**: Simulates 0-5 random mouse movements per page
- **Scrolling**: Occasionally simulates realistic scrolling behavior
- **Click Simulation**: Rarely simulates random clicks (10% chance)
- **Reading Time**: Adds random delays to simulate human reading
- **Navigation Delays**: Random delays before and after page navigation

### 7. **Timing Randomization**

- Random delays between actions (1000ms - 3000ms)
- Variable page loading wait times
- Randomized mouse movement timing
- Simulated reading time delays

### 8. **Launch Arguments Optimization**

- Disables automation detection features
- Optimizes browser performance for scraping
- Randomizes process limits and memory settings
- Disables unnecessary browser features

## Usage

The randomization is automatic and requires no additional configuration:

```typescript
// Basic usage - all randomization is applied automatically
const content = await fetchContentWithHeadlessBrowser(
  'https://example.com',
  '.content', // optional selector to wait for
  15000, // timeout in ms
  'domcontentloaded' // wait strategy
);
```

## Anti-Detection Strategies

### What This Prevents:

1. **Basic Bot Detection**: User agent and viewport checking
2. **Behavioral Analysis**: Consistent timing patterns
3. **Fingerprinting**: Canvas, WebGL, and hardware fingerprinting
4. **Automation Detection**: WebDriver property and Chrome automation flags
5. **Network Analysis**: Consistent header patterns
6. **Mouse/Interaction Tracking**: Lack of human-like interactions

### Additional Recommendations:

1. **Use Proxies**: Rotate IP addresses for large-scale scraping
2. **Rate Limiting**: Add delays between requests
3. **Session Management**: Don't reuse browser instances too long
4. **Cookie Handling**: Manage cookies appropriately
5. **Error Handling**: Handle CAPTCHAs and blocks gracefully

## Browser Instance Management

The module supports two modes for browser instance management, controlled by the `REUSE_BROWSER_INSTANCE` environment variable:

### Default Mode (REUSE_BROWSER_INSTANCE=false)

- **New browser per request**: Creates a fresh browser instance for each request
- **Better isolation**: Each request gets a completely clean browser environment
- **Enhanced randomization**: New randomization settings for every request
- **Memory safety**: Browser processes are fully cleaned up after each request
- **Slower performance**: ~1-2 second overhead per request for browser startup

### Reuse Mode (REUSE_BROWSER_INSTANCE=true)

- **Shared browser instance**: Reuses a single browser instance across multiple requests
- **Better performance**: No browser startup overhead between requests
- **Manual cleanup**: Browser instance persists until manually cleaned up or process termination
- **Cleanup endpoint available**: Use the cleanup endpoint for manual browser management

#### Manual Cleanup (Reuse Mode Only)

```http
POST /api/headless-browser-reader/cleanup
```

## API

GET /api/headless-browser-reader/get-content

- Query parameters:

  - url (string, required): Target page URL. Must be http/https.
  - waitForSelector (string, optional): CSS selector to wait for before extracting.
  - timeout (number, optional, default 15000): 1000–30000 ms page load timeout.
  - waitStrategy (enum, optional, default domcontentloaded): One of domcontentloaded | load | networkidle0 | networkidle2.

- Responses:
  - 200: { title: string; content: string; url: string }
  - 400: Validation error
  - 401: Missing/invalid API key
  - 429: Rate limited
  - 500: Internal error

POST /api/headless-browser-reader/cleanup

- Description: Closes the shared browser instance when REUSE_BROWSER_INSTANCE=true
- Responses: 200/401/500

#### Environment Configuration

```bash
# Default: Create new browser for each request (recommended for isolation)
REUSE_BROWSER_INSTANCE=false

# Alternative: Reuse browser instance for better performance
REUSE_BROWSER_INSTANCE=true
```

### Choosing the Right Mode

**Use Default Mode (false) when:**

- You need maximum isolation between requests
- You're scraping sites with strict bot detection
- Memory usage and cleanup are critical
- You can tolerate slightly slower requests

**Use Reuse Mode (true) when:**

- You need maximum performance
- You're making many requests in sequence
- Target sites don't have strict bot detection
- You can manage browser lifecycle manually

## Troubleshooting

If you're still getting blocked:

1. **Check User Agents**: Ensure you're using recent browser versions
2. **Verify Headers**: Some sites check for specific headers
3. **Add More Delays**: Increase random delays between actions
4. **Use Proxies**: Some sites block based on IP reputation
5. **Monitor Network**: Check if site uses additional detection methods
6. **Update Evasion**: Browser detection methods evolve constantly

## Technical Notes

- Uses Puppeteer with Chrome/Chromium in headless mode
- All randomization is applied per page request
- Browser fingerprinting evasion runs on every new document
- Mouse and scroll simulation happens after page load
- Compatible with existing API parameters and responses
