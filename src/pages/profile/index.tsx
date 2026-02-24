import { mockUser } from '@/entities/user'
import { Avatar, AvatarFallback, Badge, Card, CardContent, CardHeader, CardTitle, Separator } from '@/shared/ui'
import { PageContainer, PageHeader } from '@/widgets/page-shell'

export function ProfilePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Профиль"
        description="Базовые данные пользователя для визуального каркаса."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border">
              <AvatarFallback className="text-lg">{mockUser.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{mockUser.fullName}</p>
              <p className="text-sm text-muted-foreground">{mockUser.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Валюта по умолчанию</span>
            <Badge>{mockUser.defaultCurrency}</Badge>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
