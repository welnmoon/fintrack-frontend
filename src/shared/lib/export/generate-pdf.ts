export type PdfReportParams = {
  generatedAt: string;
  period: string;
  balance: number;
  income: number;
  expense: number;
  net: number;
  currency: string;
  forecast: {
    projectedEndBalance: number;
    forecastFutureExpense: number;
    daysToZero: number | null;
    daysRemaining: number;
  };
  insights: Array<{
    type: "positive" | "warning" | "info";
    title: string;
    description: string;
  }>;
  emotionSummary: {
    impulsiveCount: number;
    impulsiveAmount: number;
    stressCount: number;
    regretCount: number;
    totalExpensesCount: number;
    markedExpensesCount: number;
  };
  topCategories: Array<{ name: string; amount: number }>;
};

function fmtAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("ru-RU")} ${currency}`;
  }
}

function row(label: string, value: string): string {
  return `<div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>`;
}

export function generatePdf(params: PdfReportParams): void {
  const {
    generatedAt,
    period,
    balance,
    income,
    expense,
    net,
    currency,
    forecast,
    insights,
    emotionSummary,
    topCategories,
  } = params;

  const insightRows = insights
    .map(
      (i) =>
        `<div class="insight ${i.type}"><strong>${i.title}</strong><span>${i.description}</span></div>`,
    )
    .join("");

  const categoryRows = topCategories
    .map(
      (c, idx) =>
        `${row(`${idx + 1}. ${c.name}`, fmtAmount(c.amount, currency))}`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<title>Fintrack Financial Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;padding:48px;max-width:820px;margin:0 auto;color:#111;font-size:14px;line-height:1.5}
  h1{font-size:24px;font-weight:700;margin-bottom:4px}
  .meta{font-size:12px;color:#888;margin-bottom:32px}
  h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#666;margin:28px 0 10px;border-bottom:1px solid #eee;padding-bottom:6px}
  .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5}
  .label{color:#555}
  .value{font-weight:600;font-variant-numeric:tabular-nums}
  .insight{padding:8px 12px;margin:5px 0;border-left:3px solid #ccc;background:#fafafa;border-radius:0 4px 4px 0}
  .insight.warning{border-color:#e8a020;background:#fffbf0}
  .insight.positive{border-color:#1a9e6a;background:#f0fdf8}
  .insight.info{border-color:#2a4490;background:#f0f4ff}
  .insight strong{display:block;font-size:13px;margin-bottom:2px}
  .insight span{font-size:12px;color:#555}
  .footer{margin-top:48px;font-size:11px;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:16px}
  @media print{body{padding:24px}button{display:none}}
</style>
</head>
<body>
<h1>Fintrack Financial Report</h1>
<div class="meta">Сгенерировано: ${generatedAt}&nbsp;&nbsp;·&nbsp;&nbsp;Период: ${period}</div>

<h2>Сводка</h2>
${row("Общий баланс", fmtAmount(balance, currency))}
${row("Доходы", fmtAmount(income, currency))}
${row("Расходы", fmtAmount(expense, currency))}
${row("Net", fmtAmount(net, currency))}

<h2>Прогноз до конца месяца</h2>
${row("Прогноз остатка", fmtAmount(forecast.projectedEndBalance, currency))}
${row("Ожидаемые расходы", fmtAmount(forecast.forecastFutureExpense, currency))}
${row("Осталось дней в месяце", String(forecast.daysRemaining))}
${forecast.daysToZero !== null ? row("Средств хватит примерно на", `${forecast.daysToZero} дн.`) : ""}

<h2>Финансовые инсайты</h2>
${insightRows || row("Нет данных", "")}

<h2>Структура расходов</h2>
${categoryRows || row("Нет данных", "")}

<h2>Эмоциональный фон</h2>
${row("Расходов с эмоцией", `${emotionSummary.markedExpensesCount} из ${emotionSummary.totalExpensesCount}`)}
${row("Импульсивных трат", `${emotionSummary.impulsiveCount} · ${fmtAmount(emotionSummary.impulsiveAmount, currency)}`)}
${row("Стрессовых покупок", String(emotionSummary.stressCount))}
${row("С сожалением", String(emotionSummary.regretCount))}

<div class="footer">Fintrack &copy; ${new Date().getFullYear()}</div>
<script>window.addEventListener('load',function(){window.print()});<\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=920,height=720");
  if (!win) {
    alert(
      "Браузер заблокировал всплывающее окно. Разрешите pop-ups для этого сайта и попробуйте снова.",
    );
    return;
  }
  win.document.write(html);
  win.document.close();
}
