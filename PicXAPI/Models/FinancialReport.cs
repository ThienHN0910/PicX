using System;
using System.Collections.Generic;

namespace PicXAPI.Models;

public partial class FinancialReport
{
    public int ReportId { get; set; }

    public int? ArtistId { get; set; }

    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }

    public decimal? TotalSales { get; set; }

    public decimal? TotalCommission { get; set; }

    public decimal? NetEarnings { get; set; }

    public decimal? CommissionRate { get; set; }

    public DateTime? GeneratedAt { get; set; }

    public virtual User? Artist { get; set; }
}
