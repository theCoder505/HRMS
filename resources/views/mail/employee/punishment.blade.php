<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Disciplinary Notice</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

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

        .logo-bar {
            text-align: center;
            margin-bottom: 24px;
        }

        .logo-bar img {
            height: 40px;
            object-fit: contain;
        }

        .card {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
        }

        /* Hero — red tone for disciplinary context */
        .hero {
            background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%);
            padding: 40px 40px 32px;
            text-align: center;
        }

        .hero-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            font-size: 28px;
            margin-bottom: 16px;
            justify-content: center;
            align-items: center;
        }

        .hero h1 {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.3;
        }

        .hero p {
            margin-top: 8px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.78);
        }

        /* Body */
        .body {
            padding: 32px 40px;
        }

        .greeting {
            font-size: 15px;
            color: #475569;
            line-height: 1.7;
            margin-bottom: 28px;
        }

        .greeting strong {
            color: #0f172a;
        }

        /* Deduction highlight */
        .deduction-box {
            display: flex;
            align-items: stretch;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #fecaca;
            margin-bottom: 24px;
        }

        .deduction-half {
            flex: 1;
            padding: 16px 20px;
            text-align: center;
        }

        .deduction-half.basic {
            background: #f8fafc;
        }

        .deduction-half.ded {
            background: #fff1f2;
        }

        .deduction-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            background: #fee2e2;
            color: #ef4444;
            font-size: 20px;
            align-items: center;
        }

        .deduction-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            color: #94a3b8;
            margin-bottom: 6px;
        }

        .deduction-amount {
            font-size: 20px;
            font-weight: 700;
        }

        .deduction-half.basic .deduction-amount {
            color: #64748b;
        }

        .deduction-half.ded .deduction-amount {
            color: #dc2626;
        }

        /* Info grid */
        .info-grid {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 24px;
        }

        .info-grid-title {
            padding: 10px 20px;
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
            align-items: flex-start;
            padding: 12px 20px;
            border-bottom: 1px solid #e2e8f0;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-size: 13px;
            color: #64748b;
            flex-shrink: 0;
            padding-right: 16px;
        }

        .info-value {
            font-size: 13px;
            color: #0f172a;
            font-weight: 600;
            text-align: right;
        }

        /* Reason block */
        .reason-block {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-left: 4px solid #f97316;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 24px;
        }

        .reason-block .reason-title {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #c2410c;
            margin-bottom: 8px;
        }

        .reason-block p {
            font-size: 14px;
            color: #431407;
            line-height: 1.65;
        }

        /* Deduction badge */
        .deduction-badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 999px;
            background: #fee2e2;
            color: #b91c1c;
            font-size: 12px;
            font-weight: 700;
        }

        /* Note */
        .note {
            font-size: 13px;
            color: #64748b;
            line-height: 1.65;
            text-align: center;
        }

        /* Footer */
        .footer {
            padding: 20px 40px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
        }

        .footer p {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.7;
        }

        .footer strong {
            color: #64748b;
        }

        @media (max-width: 600px) {

            .body,
            .footer {
                padding-left: 20px;
                padding-right: 20px;
            }

            .hero {
                padding-left: 20px;
                padding-right: 20px;
            }

            .deduction-box {
                flex-direction: column;
            }

            .deduction-divider {
                padding: 8px;
            }
        }
    </style>
</head>

<body>
    <div class="wrapper">

        <div class="logo-bar">
            <img src="{{ url('/assets/logo.png') }}" alt="{{ $brandname }}" />
        </div>

        <div class="card">

            <div class="hero">
                <div class="hero-icon">⚠️</div>
                <h1>Disciplinary Notice</h1>
                <p>{{ $brandname }} HR — Official Communication</p>
            </div>

            <div class="body">

                <p class="greeting">
                    Dear <strong>{{ $employee_name }}</strong>,<br /><br />
                    This notice is to formally inform you that a disciplinary action titled
                    <strong>{{ $title }}</strong> has been recorded against your employment record,
                    effective <strong>{{ \Carbon\Carbon::parse($effective_from)->format('d M, Y') }}</strong>
                    through <strong>{{ \Carbon\Carbon::parse($effective_to)->format('d M, Y') }}</strong>.
                    Please review the details carefully.
                </p>

                <!-- Reason -->
                <div class="reason-block">
                    <div class="reason-title">Reason for Disciplinary Action</div>
                    <p>{{ $punishment_reason }}</p>
                </div>

                <!-- Salary deduction -->
                <div class="deduction-box">
                    <div class="deduction-half basic">
                        <div class="deduction-label">Basic Salary</div>
                        <div class="deduction-amount">৳ {{ number_format($basic_salary, 2) }}</div>
                    </div>
                    <div class="deduction-divider">−</div>
                    <div class="deduction-half ded">
                        <div class="deduction-label">Deduction</div>
                        <div class="deduction-amount">৳ {{ number_format($deduction_amount, 2) }}</div>
                    </div>
                </div>

                <!-- Details grid -->
                <div class="info-grid">
                    <div class="info-grid-title">Punishment Details</div>

                    <div class="info-row">
                        <span class="info-label">Action Title</span>
                        <span class="info-value">{{ $title }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Effective From</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($effective_from)->format('d M, Y') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Effective To</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($effective_to)->format('d M, Y') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Salary Deduction</span>
                        <span class="info-value">
                            <span class="deduction-badge">
                                − ৳ {{ number_format($deduction_amount, 2) }}
                                @if ($deduction_pct)
                                    ({{ $deduction_pct }}%)
                                @endif
                            </span>
                        </span>
                    </div>
                </div>

                <p class="note">
                    If you believe this action was issued in error or wish to appeal,<br />
                    please contact the HR department at your earliest convenience.
                </p>

            </div>

            <div class="footer">
                <p>
                    This is an automated message from <strong>{{ $brandname }}</strong> HR System.<br />
                    Please do not reply directly to this email.
                </p>
            </div>

        </div>
    </div>
</body>

</html>
