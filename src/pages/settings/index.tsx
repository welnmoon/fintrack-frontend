import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui'
import { PageContainer, PageHeader } from '@/widgets/page-shell'

export function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Настройки"
        description="UI-only настройки приложения без сохранения на сервер."
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Общие параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Компактный режим</p>
                  <p className="text-sm text-muted-foreground">Уменьшенные отступы в таблицах и карточках.</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium">Валюта интерфейса</p>
                <Select defaultValue="usd">
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="kzt">KZT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Еженедельный обзор</p>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Сигнал о превышении бюджета</p>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
