import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl">404 - Страница не найдена</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Такой страницы нет. Вернитесь на лендинг или откройте приложение.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to={ROUTES.landing}>На главную</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.app}>В приложение</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
