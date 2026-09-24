export type WarrantyPdfItem = {
  model_code: string
  product_name: string | null
  capacity_kw: number
  serial_number: string
  warranty_start_date: string
  warranty_end_date: string
}

function formatDate(value: string) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'
}

async function loadLogoDataUrl() {
  try {
    const response = await fetch('/olitec-logo.svg', { cache: 'no-store' })
    if (!response.ok) return null
    const svg = await response.text()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    try {
      const image = new Image()
      image.decoding = 'async'
      image.src = url
      await image.decode()

      const canvas = document.createElement('canvas')
      canvas.width = 850
      canvas.height = 230
      const context = canvas.getContext('2d')
      if (!context) return null
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/png')
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return null
  }
}

export async function createWarrantyPdf(
  registrationNumber: string,
  warranties: WarrantyPdfItem[],
  qrDataUrl: string,
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })

  const pageWidth = 210
  const pageHeight = 148
  const outerX = 8
  const outerY = 8
  const outerW = 194
  const outerH = 132
  const logoDataUrl = await loadLogoDataUrl()

  // 15 products per A5 landscape page: 3 columns × 5 rows.
  const perPage = 15
  const totalPages = Math.max(1, Math.ceil(warranties.length / perPage))

  const drawPage = (items: WarrantyPdfItem[], pageIndex: number) => {
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    doc.setDrawColor(232, 158, 20)
    doc.setLineWidth(1.15)
    doc.roundedRect(outerX, outerY, outerW, outerH, 5.5, 5.5, 'S')

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 16, 13, 43, 11.7)
    } else {
      doc.setTextColor(23, 32, 51)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(21)
      doc.text('OLITEC', 16, 23)
    }

    doc.setTextColor(90, 99, 115)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.8)
    doc.text('SOLAR INVERTER WARRANTY CARD', 16, 30)

    doc.setTextColor(23, 32, 51)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`Registration: ${registrationNumber}`, 16, 39)

    const listX = 14
    const listY = 44
    const cardW = 44.2
    const cardH = 16.4
    const colGap = 2.4
    const rowGap = 2.2

    items.forEach((item, index) => {
      const column = index % 3
      const row = Math.floor(index / 3)
      const x = listX + column * (cardW + colGap)
      const y = listY + row * (cardH + rowGap)

      doc.setDrawColor(225, 228, 232)
      doc.setLineWidth(0.55)
      doc.roundedRect(x, y, cardW, cardH, 2.3, 2.3, 'S')

      doc.setTextColor(23, 32, 51)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.8)
      doc.text(`${index + 1}. ${item.model_code}`, x + 2.3, y + 4.4)

      doc.setTextColor(70, 82, 101)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.55)
      doc.text(`${item.product_name || 'OLITEC Solar Inverter'} · ${item.capacity_kw} kW`, x + 2.3, y + 8.1, {
        maxWidth: cardW - 4.6,
      })

      doc.setTextColor(23, 32, 51)
      doc.setFontSize(5.6)
      doc.text(`Serial: ${item.serial_number}`, x + 2.3, y + 11.7, {
        maxWidth: cardW - 4.6,
      })

      doc.setTextColor(25, 139, 77)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.35)
      doc.text(`Warranty: ${formatDate(item.warranty_start_date)} to ${formatDate(item.warranty_end_date)}`, x + 2.3, y + 14.5, {
        maxWidth: cardW - 4.6,
      })
    })

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 164, 46, 31, 31)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(105, 112, 125)
      doc.setFontSize(6.5)
      doc.text('Registration QR', 179.5, 81, { align: 'center' })
    }

    if (totalPages > 1) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(125, 132, 145)
      doc.setFontSize(6.5)
      doc.text(`Page ${pageIndex} of ${totalPages}`, 194, 137, { align: 'right' })
    }
  }

  for (let page = 0; page < totalPages; page += 1) {
    if (page > 0) doc.addPage()
    drawPage(warranties.slice(page * perPage, (page + 1) * perPage), page + 1)
  }

  doc.save(`${registrationNumber}-OLITEC-Warranty-Card.pdf`)
}
