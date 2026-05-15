<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Leave Request Update</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: #f1f5f9;
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: #334155;
            padding: 32px 16px;
            -webkit-font-smoothing: antialiased;
        }

        .wrapper {
            max-width: 580px;
            margin: 0 auto;
        }

        /* ── Logo bar ── */
        .logo-bar {
            text-align: center;
            margin-bottom: 24px;
        }
        .logo-bar img {
            height: 40px;
            object-fit: contain;
        }

        /* ── Card ── */
        .card {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(15,23,42,0.08);
        }

        /* ── Hero banner ── */
        .hero {
            padding: 36px 40px 32px;
            text-align: center;
        }
        .hero.approved { background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); }
        .hero.denied   { background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); }

        .hero .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 16px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 16px;
        }
        .hero.approved .badge { background: rgba(255,255,255,0.2); color: #fff; }
        .hero.denied   .badge { background: rgba(255,255,255,0.2); color: #fff; }

        .hero h1 {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.35;
        }
        .hero p {
            margin-top: 8px;
            font-size: 14px;
            color: rgba(255,255,255,0.82);
        }

        /* ── Body ── */
        .body {
            padding: 32px 40px;
        }

        .greeting {
            font-size: 15px;
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.6;
        }
        .greeting strong { color: #0f172a; }

        /* ── Info grid ── */
        .info-grid {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 24px;
        }
        .info-grid-title {
            padding: 12px 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #94a3b8;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 13px 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child { border-bottom: none; }
        .info-label {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
        }
        .info-value {
            font-size: 13px;
            color: #0f172a;
            font-weight: 600;
        }

        /* ── Status pill ── */
        .status-approved {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 999px;
            background: #dcfce7;
            color: #15803d;
            font-size: 12px;
            font-weight: 700;
        }
        .status-denied {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 999px;
            background: #fee2e2;
            color: #b91c1c;
            font-size: 12px;
            font-weight: 700;
        }

        /* ── Note ── */
        .note {
            font-size: 13px;
            color: #64748b;
            line-height: 1.65;
            margin-bottom: 28px;
        }

        /* ── CTA button ── */
        .cta-wrap { text-align: center; margin-bottom: 4px; }
        .cta {
            display: inline-block;
            padding: 13px 32px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            text-decoration: none;
        }
        .cta.approved { background: #0d9488; }
        .cta.denied   { background: #dc2626; }

        /* ── Footer ── */
        .footer {
            padding: 24px 40px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.7;
        }
        .footer strong { color: #64748b; }

        @media (max-width: 600px) {
            .body, .footer { padding-left: 24px; padding-right: 24px; }
            .hero          { padding-left: 24px; padding-right: 24px; }
            .info-row      { flex-direction: column; align-items: flex-start; gap: 4px; }
        }
    </style>
</head>
<body>
<div class="wrapper">

    <!-- Logo -->
    <div class="logo-bar">
        <img src="{{ url('/assets/logo.png') }}" alt="{{ $brandname }}" />
    </div>

    <div class="card">

        <!-- Hero -->
        <div class="hero {{ $approval == 1 ? 'approved' : 'denied' }}">
            <div class="badge">
                @if($approval == 1)
                    ✓ &nbsp;Approved
                @else
                    ✕ &nbsp;Denied
                @endif
            </div>
            <h1>Your Leave Request Has Been {{ $status }}</h1>
            <p>{{ $brandname }} HR has reviewed your request.</p>
        </div>

        <!-- Body -->
        <div class="body">
            <p class="greeting">
                Hi <strong>{{ $employee_name }}</strong>,<br /><br />
                We wanted to let you know that your leave request titled
                <strong>"{{ $title }}"</strong> has been
                <strong>{{ strtolower($status) }}</strong> by the HR team.
                Please review the details below.
            </p>

            <!-- Leave Details -->
            <div class="info-grid">
                <div class="info-grid-title">Leave Details</div>

                <div class="info-row">
                    <span class="info-label">Leave Title</span>
                    <span class="info-value">{{ $title }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">From</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($leave_from_date)->format('d M, Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">To</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($leave_to_date)->format('d M, Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Leave Type</span>
                    <span class="info-value">{{ $type }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="{{ $approval == 1 ? 'status-approved' : 'status-denied' }}">
                        {{ $status }}
                    </span>
                </div>

                @if($type === 'Unpaid' && $approval == 1)
                <div class="info-row">
                    <span class="info-label">Deduction</span>
                    <span class="info-value">
                        {{ $deduction_type === 'percent' ? $deduction_amount . '%' : '৳ ' . number_format($deduction_amount, 2) }}
                        ({{ ucfirst($deduction_type) }})
                    </span>
                </div>
                @endif
            </div>

            @if($approval == 1)
                <p class="note">
                    Your leave has been approved. Please ensure your work responsibilities are
                    properly handed over before your leave starts. If you have any questions,
                    reach out to the HR department.
                </p>
            @else
                <p class="note">
                    Unfortunately, your leave request has been denied at this time. Please
                    contact the HR department if you need further clarification or wish to
                    resubmit your request with updated details.
                </p>
            @endif

        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                This is an automated message from <strong>{{ $brandname }}</strong> HR System.<br />
                Please do not reply directly to this email.
            </p>
        </div>

    </div><!-- /card -->

</div>
</body>
</html>