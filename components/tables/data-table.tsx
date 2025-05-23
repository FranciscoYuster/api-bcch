import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface DataTableProps {
  data: Array<{ fecha: string; valor: number }>
}

export default function DataTable({ data }: DataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(item.fecha), "dd MMMM yyyy", { locale: es })}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat("es-CL", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.valor)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
