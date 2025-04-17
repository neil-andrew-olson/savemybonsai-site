# Website Improvements

This document outlines the improvements made to the SaveMyBonsai website to enhance SEO, accessibility, performance, and usability.

## SEO & Accessibility Improvements

1. **Theme Color Meta Tag**: Added a theme-color meta tag in the head partial for better mobile browser theming.
2. **ARIA Landmarks**: Added role="main" to the main content area for improved screen reader navigation.
3. **Skip Navigation Link**: Added a skip navigation link for keyboard users to bypass the header and navigation.
4. **Sitemap.xml**: Added a sitemap.xml file for better search engine indexing.

## Performance Improvements

1. **Lazy Loading Images**: Added a shortcode for lazy loading images to improve page load performance.

## How to Use the New Features

### Lazy Loading Images

Instead of using the standard Markdown image syntax, use the new shortcode:

```
{{</* img src="/images/your-image.jpg" alt="Your descriptive alt text" */>}}
```

You can also specify additional attributes:

```
{{</* img src="/images/your-image.jpg" alt="Your descriptive alt text" class="your-class" width="500" height="300" */>}}
```

### Skip Navigation Link

The skip navigation link is automatically added to all pages. It's visually hidden but becomes visible when focused by keyboard navigation (pressing Tab).

## Future Recommendations

1. **Image Optimization**: Consider converting images to WebP format for better compression and faster loading.
2. **Responsive Images**: Implement srcset and sizes attributes for responsive images.
3. **Color Contrast**: Regularly check color contrast for readability, especially in dark mode.