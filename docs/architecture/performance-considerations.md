# Performance Considerations

1. **Lazy Loading:** Consider lazy loading Chart.js only when burndown panel is opened
2. **Firestore Pagination:** For large boards, paginate card queries
3. **Image Optimization:** Compress attachment images before upload
4. **Caching:** Leverage localStorage cache to reduce Firestore reads
5. **Bundle Size:** Monitor CDN dependencies, consider self-hosting critical libraries

---
