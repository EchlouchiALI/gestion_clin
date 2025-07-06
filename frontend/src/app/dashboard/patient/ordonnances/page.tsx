'use client'

import { useState } from 'react'
import { getDocument } from '@/utils/pdf'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function PageOrdonnancesPatient() {
  const [ordonnanceText, setOrdonnanceText] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(' ')
      text += `📄 Page ${i}:\n${pageText}\n\n`
    }

    setOrdonnanceText(text)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <CardTitle className="text-xl font-semibold">
            📥 Télécharger une ordonnance médicale
          </CardTitle>
          <Input type="file" accept="application/pdf" onChange={handleFileChange} />
        </CardContent>
      </Card>

      {ordonnanceText && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <CardTitle className="text-xl font-semibold">
              📄 Contenu extrait : {fileName}
            </CardTitle>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded border border-gray-300 max-h-[500px] overflow-y-auto text-sm">
              {ordonnanceText}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
