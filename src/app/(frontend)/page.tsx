import PageTemplate, { generateMetadata } from './[slug]/page'

export default PageTemplate

// A scheduled publish or unpublish runs outside a request, where Next can't refresh the cache, so
// the home page also re-renders every 10 minutes (#141, decision 0011)
export const revalidate = 600

export { generateMetadata }
