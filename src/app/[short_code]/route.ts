import { prisma } from "@/infrastructure/db/prisma-client"
import { NextResponse, userAgent } from "next/server"
import { safeCatch } from "@/lib/utils/promise"
import { headers } from "next/headers"
import { createHash } from "crypto"

function hashIp(ip: string): string {
  const salt = process.env.IP_SALT
  return createHash('sha256').update(ip + salt).digest('hex')
}

function anonymizeIp(ip: string): string {

  if (ip.includes('.')) {
    const parts = ip.split('.')
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  }

  if (ip.includes(':')) {
    const parts = ip.split(':')
    return `${parts.slice(0, 4).join(':')}:0000:0000:0000:0000`
  }

  return ip
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ short_code: string }> }
) {
  // 1. Extraemos el código de la URL
  const { short_code } = await params

  const headerList = await headers()
  const { device, browser, os } = await userAgent(request)
  const { searchParams } = new URL(request.url)

  // 2. Buscamos el link en la tabla 'links' (usando tu plural)
  const [link, error] = await safeCatch(
    prisma.links.findUnique({
      where: { short_code: short_code }
    })
  )

  // 3. Si no existe el código o hay error de DB, mandamos al Home
  if (error || !link) {
    console.error("Error o link no encontrado:", error)
    return NextResponse.redirect(new URL('/', request.url))
  }

  const activeLink = link

  const rawIp = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const ipHash = hashIp(rawIp)
  const cleanIp = anonymizeIp(ipHash)

  const sourceTag = searchParams.get('s')
  const referrer = headerList.get('referer') || ''
  const uaText = headerList.get('user-agent') || ''

  let detectedSource = 'Directo/Desconocido'
  if (sourceTag === 'wa') detectedSource = 'WatsApp'
  else if (sourceTag === 'ig') detectedSource = 'Instagram'
  else if (uaText.includes('Instagram')) detectedSource = 'Instagram App'
  else if (referrer.includes('t.me')) detectedSource = 'Telegram'
  // Desde las apps
  else if (uaText.includes('Instagram')) detectedSource = 'Instagram App'
  else if (uaText.includes('FBAN') || uaText.includes('FBIOS')) detectedSource = 'Facebook App'
  // Si no se detecta algo mas fiable arriva
  else if (sourceTag === 'wa') detectedSource = 'WatsApp'
  else if (sourceTag === 'ig') detectedSource = 'Instagram'
  else if (sourceTag === 'tg') detectedSource = 'Telegram'
  // Si no hay referrer
  else if (referrer) {
    try {
      detectedSource = new URL(referrer).hostname
    } catch {
      detectedSource = 'Referrer Externo'
    }
  }

  await safeCatch(
    prisma.clicks.create({
      data: { 
        link_id: activeLink.id,
        ip_hash: ipHash,
        ip_display: cleanIp,
        continent: headerList.get('x-vercel-ip-continent'),
        country_code: headerList.get('x-vercel-ip-country'),
        country_region: headerList.get('x-vercel-ip-country-region'),
        city: headerList.get('x-vercel-ip-city'),
        device_type: device.type === 'mobile' ? 'MOBILE' : 'DESKTOP',
        os: os.name,
        browser: browser.name,
        detected_source: detectedSource,
        referrer: referrer,
        // UTMs si existe
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign')
      } 
    })
  )

  // 4. ¡Redirección! Mandamos al usuario a la URL original
  // Usamos un 307 (Temporary Redirect) para que no se cachee para siempre
  return NextResponse.redirect(new URL(link.original_url), 307)
}