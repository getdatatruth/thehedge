import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  type ReportType,
  getAcademicYearDates,
  buildAssessmentReport,
  buildAttendanceReport,
  buildPortfolioReport,
  buildAnnualReport,
  renderAssessmentHtml,
  renderAttendanceHtml,
  renderPortfolioHtml,
  renderAnnualHtml,
} from '@/lib/reports';
import {
  assessmentToCsv,
  attendanceToCsv,
  portfolioToCsv,
  annualToCsv,
  csvFilename,
  csvToPdf,
  pdfFilename,
} from '@/lib/export';

const VALID_TYPES: ReportType[] = ['assessment', 'attendance', 'portfolio', 'annual'];

function csvResponse(reportType: string, childName: string, startDate: string, endDate: string, body: string) {
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename(reportType, childName, startDate, endDate)}"`,
    },
  });
}

async function pdfResponse(reportType: string, label: string, childName: string, startDate: string, endDate: string, csv: string) {
  const bytes = await csvToPdf(csv, label);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename(reportType, childName, startDate, endDate)}"`,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ── Auth ──────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    // ── Parse Query Params ────────────────────────────────
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ReportType | null;
    const childId = searchParams.get('childId');
    const format = searchParams.get('format') || 'html'; // 'html' | 'csv' | 'json'

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid report type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!childId) {
      return NextResponse.json(
        { error: 'childId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify child belongs to this family
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('family_id', profile.family_id)
      .single();

    if (!child) {
      return NextResponse.json({ error: 'Child not found in your family' }, { status: 404 });
    }

    // Date range defaults to current academic year (Sep-Jun)
    const defaults = getAcademicYearDates();
    const startDate = searchParams.get('startDate') || defaults.startDate;
    const endDate = searchParams.get('endDate') || defaults.endDate;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Dates must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const params = {
      supabase,
      familyId: profile.family_id,
      childId,
      startDate,
      endDate,
    };

    // ── Build Report ──────────────────────────────────────
    switch (type) {
      case 'assessment': {
        const data = await buildAssessmentReport(params);
        if (format === 'json') {
          return NextResponse.json(data);
        }
        if (format === 'csv') {
          return csvResponse('term-summary', data.child.name, startDate, endDate, assessmentToCsv(data));
        }
        if (format === 'pdf') {
          return pdfResponse('term-summary', 'Term Summary', data.child.name, startDate, endDate, assessmentToCsv(data));
        }
        return new NextResponse(renderAssessmentHtml(data), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="assessment-report-${childId}.html"`,
          },
        });
      }

      case 'attendance': {
        const data = await buildAttendanceReport(params);
        if (format === 'json') {
          return NextResponse.json(data);
        }
        if (format === 'csv') {
          return csvResponse('attendance-record', data.child.name, startDate, endDate, attendanceToCsv(data));
        }
        if (format === 'pdf') {
          return pdfResponse('attendance-record', 'Attendance Record', data.child.name, startDate, endDate, attendanceToCsv(data));
        }
        return new NextResponse(renderAttendanceHtml(data), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="attendance-report-${childId}.html"`,
          },
        });
      }

      case 'portfolio': {
        const data = await buildPortfolioReport(params);
        if (format === 'json') {
          return NextResponse.json(data);
        }
        if (format === 'csv') {
          return csvResponse('portfolio-entries', data.child.name, startDate, endDate, portfolioToCsv(data));
        }
        if (format === 'pdf') {
          return pdfResponse('portfolio-entries', 'Portfolio Entries', data.child.name, startDate, endDate, portfolioToCsv(data));
        }
        return new NextResponse(renderPortfolioHtml(data), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="portfolio-report-${childId}.html"`,
          },
        });
      }

      case 'annual': {
        const data = await buildAnnualReport(params);
        if (format === 'json') {
          return NextResponse.json(data);
        }
        if (format === 'csv') {
          return csvResponse('annual-summary', data.assessment.child.name, startDate, endDate, annualToCsv(data));
        }
        if (format === 'pdf') {
          return pdfResponse('annual-summary', 'Annual Activity Summary', data.assessment.child.name, startDate, endDate, annualToCsv(data));
        }
        return new NextResponse(renderAnnualHtml(data), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="annual-report-${childId}.html"`,
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (err) {
    console.error('Reports GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
