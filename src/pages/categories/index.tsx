import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import { useGetCategories } from "@/entities/category/api/use-get-categories";
import CreateCategoryForm from "@/features/create-category/ui/create-category-form";
import { CategoryIconWithColor } from "@/entities/category/ui/category-icon-with-color";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";

export function CategoriesPage() {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGetCategories();

  const isLoading = isCategoriesLoading;
  const errorMessage =
    categoriesError instanceof Error
      ? categoriesError.message
      : "Неизвестная ошибка";

  return (
    <PageContainer>
      <PageHeader
        title="Категории"
        description="Справочник доходных и расходных категорий."
      />
      <CreateCategoryForm />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="w-0 whitespace-nowrap text-center">
                  Иконка
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    Загрузка...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && isCategoriesError && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-destructive"
                  >
                    Ошибка загрузки: {errorMessage}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                !isCategoriesError &&
                (!categories || categories.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      Пусто
                    </TableCell>
                  </TableRow>
                )}
              {!isLoading &&
                !isCategoriesError &&
                categories?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.type === "INCOME" ? "default" : "secondary"
                        }
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-center ">
                      <CategoryIconWithColor
                        colorKey={item.colorKey as CategoryColorKey}
                        iconKey={item.iconKey as CategoryIconKey}
                        key={item.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
