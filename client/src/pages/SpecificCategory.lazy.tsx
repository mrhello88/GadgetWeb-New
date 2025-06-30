import { lazy } from 'react';

// Lazy load the SpecificCategory component to reduce initial bundle size
export const SpecificCategoryPage = lazy(() => 
  import('./SpecificCategory.page').then(module => ({
    default: module.default
  }))
); 