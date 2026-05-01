'use client'

import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Link2, Copy, Check, AlertCircle, ExternalLink, MousePointerClick, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [misLinks, setMisLinks] = useState([])

  const cargarLinks = async () => {
    const res = await fetch('/api/links/public/list')
    const data = await res.json()
    setMisLinks(data)
  }
  
  const crearLink = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/links/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url }) // Aquí enviamos el 'body'
      })
      
      const data = await res.json()
      setResult(data)

      setUrl('')
      await cargarLinks()

    } catch (error) {
      setResult({ error: "Error de red al conectar con la API" })

    } finally {
      setLoading(false)
      
    }
  }

  const borrarLink = async (id: string) => {
    // e.preventDefault()

    if (!confirm("¿Estás seguro de que quieres eliminar este enlace?")) return;

    setLoading(true)
    
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        console.log('Link eliminado correctamente')
        await cargarLinks()
      } else {
        const errorData = await res.json()
        setResult({ error: errorData.error || 'No se pudo borrar el link'})
      }
      
    } catch (error) {
      setResult({ error: 'Error de red al conectar con la API' })

    } finally {
      setLoading(false)
    }
  }

  useEffect( () => {
    cargarLinks()
  }, [])

  const copiarAlPortapapeles = () => {
    const shortUrl = `${window.location.origin}/${result.data.short_code}`
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Link2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Shorty</CardTitle>
          <CardDescription className="text-base">
            Pega un enlace largo y nosotros lo haremos diminuto.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={crearLink} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Input 
                type="url" 
                placeholder="https://ejemplo.com/tu-enlace-muy-largo" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="h-12 text-base"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
                disabled={loading}
              >
                {loading ? "Generando..." : "Acortar Enlace"}
              </Button>
            </div>
          </form>

          {/* Estado de Error */}
          {result?.error && (
            <div className="flex items-center gap-2 p-4 text-red-800 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{result.error}</p>
            </div>
          )}

          {/* Estado de Éxito */}
          {result?.data && (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-sm font-semibold text-green-900 mb-3">¡Enlace acortado con éxito!</p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-md border border-green-200">
                  <code className="flex-1 text-blue-600 font-mono font-bold truncate">
                    {window.location.origin}/{result.data.short_code}
                  </code>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0"
                    onClick={copiarAlPortapapeles}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-10 w-full max-w-4xl mx-auto">
  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
    <MousePointerClick className="w-5 h-5 text-blue-500" />
    Tus Enlaces Recientes
  </h2>
  
  <div className="rounded-md border bg-white shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className="w-[150px]">Código</TableHead>
          <TableHead>URL Original</TableHead>
          <TableHead className="text-center">Clicks</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {misLinks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-slate-500">
              Aún no has creado ningún enlace.
            </TableCell>
          </TableRow>
        ) : (
          misLinks.map((link: any) => (
            <TableRow key={link.id}>
              <TableCell className="font-mono font-bold text-blue-600">
                /{link.short_code}
              </TableCell>
              <TableCell className="max-w-[300px] truncate text-slate-600">
                {link.original_url}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-semibold">
                  {link._count?.clicks || 0}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(`${window.location.origin}/${link.short_code}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size='sm'
                  onClick={() => borrarLink(link.id)}
                >
                  <Trash2/>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
</div>
      
      <p className="mt-8 text-slate-400 text-sm italic">
        No necesitas registro para crear enlaces públicos.
      </p>
    </div>
  )
}