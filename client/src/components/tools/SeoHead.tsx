import { useEffect } from 'react'

interface SeoHeadProps {
  title: string
  description: string
  path?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const BASE_URL = 'https://platsledning.ai'

export function SeoHead({ title, description, path = '', type = 'website', jsonLd }: SeoHeadProps) {
  const fullTitle = title.includes('Platsledning.ai') ? title : `${title} | Platsledning.ai`
  const url = `${BASE_URL}${path}`

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMeta('description', description)
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', description, true)
    setMeta('og:url', url, true)
    setMeta('og:type', type, true)
    setMeta('og:locale', 'sv_SE', true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    const existingLd = document.getElementById('seo-jsonld')
    if (existingLd) existingLd.remove()

    if (jsonLd) {
      const script = document.createElement('script')
      script.id = 'seo-jsonld'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])
      document.head.appendChild(script)
    }
  }, [fullTitle, description, url, type, jsonLd])

  return null
}
