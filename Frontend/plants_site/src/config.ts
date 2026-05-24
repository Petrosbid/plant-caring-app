export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    blogUrl: import.meta.env.VITE_BLOG_API_URL || 'http://localhost:8000/api/blog',
  },
  app: {
    name: 'Verna',
    version: '1.0.0',
  },
  features: {
    plantIdentification: true,
    diseaseDetection: true,
    blog: true,
    reminders: true,
  },
  defaults: {
    itemsPerPage: 10,
    carouselItems: 3,
  },
};
