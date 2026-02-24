import { Plus } from 'lucide-react'
import { mockCategories } from '@/entities/category'
import { Badge, Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui'
import { PageContainer, PageHeader } from '@/widgets/page-shell'

export function CategoriesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Категории"
        description="Справочник доходных и расходных категорий."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Добавить категорию
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Цвет</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCategories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'INCOME' ? 'default' : 'secondary'}>{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.color}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
