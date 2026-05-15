<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Promotion Update</title>
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

        /* Logo */
        .logo-bar {
            text-align: center;
            margin-bottom: 24px;
        }

        .logo-bar img {
            height: 40px;
            object-fit: contain;
        }

        /* Card */
        .card {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
        }

        /* Hero */
        .hero {
            background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
            padding: 40px 40px 32px;
            text-align: center;
            position: relative;
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

        /* Salary highlight */
        .salary-box {
            display: flex;
            align-items: stretch;
            gap: 0;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
        }

        .salary-half {
            flex: 1;
            padding: 16px 20px;
            text-align: center;
        }

        .salary-half.old {
            background: #f8fafc;
        }

        .salary-half.new {
            background: #f0fdf4;
        }

        .salary-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            background: #f1f5f9;
            color: #64748b;
            font-size: 20px;
        }

        .salary-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            color: #94a3b8;
            margin-bottom: 6px;
        }

        .salary-amount {
            font-size: 20px;
            font-weight: 700;
        }

        .salary-half.old .salary-amount {
            color: #64748b;
        }

        .salary-half.new .salary-amount {
            color: #16a34a;
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
            align-items: center;
            padding: 12px 20px;
            border-bottom: 1px solid #e2e8f0;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-size: 13px;
            color: #64748b;
        }

        .info-value {
            font-size: 13px;
            color: #0f172a;
            font-weight: 600;
        }

        /* Increment badge */
        .increment-badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 999px;
            background: #dcfce7;
            color: #15803d;
            font-size: 12px;
            font-weight: 700;
        }

        /* Report link */
        .report-link {
            display: block;
            text-align: center;
            margin-bottom: 24px;
        }

        .report-btn {
            display: inline-block;
            padding: 12px 28px;
            border-radius: 10px;
            background: #2563eb;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
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

            .salary-box {
                flex-direction: column;
            }

            .salary-divider {
                padding: 8px;
                writing-mode: horizontal-tb;
            }
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
            <div class="hero">
                <div class="hero-icon">🎉</div>
                <h1>Congratulations, {{ $employee_name }}!</h1>
                <p>{{ $brandname }} is pleased to announce your promotion.</p>
            </div>

            <!-- Body -->
            <div class="body">

                <p class="greeting">
                    Dear <strong>{{ $employee_name }}</strong>,<br /><br />
                    We are delighted to inform you that you have been promoted to the position of
                    <strong>{{ $job_title }}</strong>, effective
                    <strong>{{ \Carbon\Carbon::parse($execution_date)->format('d M, Y') }}</strong>.
                    This reflects our confidence in your talent and dedication.
                </p>

                <!-- Salary comparison -->
                <div class="salary-box">
                    <div class="salary-half old">
                        <div class="salary-label">Previous Salary</div>
                        <div class="salary-amount">৳ {{ number_format($old_salary, 2) }}</div>
                    </div>
                    <div class="salary-divider">→</div>
                    <div class="salary-half new">
                        <div class="salary-label">New Salary</div>
                        <div class="salary-amount">৳ {{ number_format($new_salary, 2) }}</div>
                    </div>
                </div>

                <!-- Details grid -->
                <div class="info-grid">
                    <div class="info-grid-title">Promotion Details</div>

                    <div class="info-row">
                        <span class="info-label">New Position</span>
                        <span class="info-value">{{ $job_title }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Effective Date</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($execution_date)->format('d M, Y') }}</span>
                    </div>

                    @if ($increment_amount)
                        <div class="info-row">
                            <span class="info-label">Salary Increment</span>
                            <span class="info-value">
                                <span class="increment-badge">
                                    + ৳ {{ number_format($increment_amount, 2) }}
                                    @if ($increment_percentage)
                                        ({{ $increment_percentage }}%)
                                    @endif
                                </span>
                            </span>
                        </div>
                    @elseif($increment_percentage)
                        <div class="info-row">
                            <span class="info-label">Salary Increment</span>
                            <span class="info-value">
                                <span class="increment-badge">+ {{ $increment_percentage }}%</span>
                            </span>
                        </div>
                    @endif
                </div>

                <!-- Report download -->
                @if ($report_url)
                    <div class="report-link">
                        <a href="{{ $report_url }}" class="report-btn" target="_blank">
                            📄 View Promotion Report
                        </a>
                    </div>
                @endif

                <p class="note">
                    Please review the attached promotion report for full details.<br />
                    Reach out to HR if you have any questions.
                </p>

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
