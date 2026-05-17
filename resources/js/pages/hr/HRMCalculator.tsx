'use client';

import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { useCallback, useState } from 'react';

const BUTTONS = [
    ['AC', '+/-', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
];

const operators = ['÷', '×', '−', '+'];

export default function HRMCalculator() {
    const [open, setOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState<string | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [justCalculated, setJustCalculated] = useState(false);

    const calculate = useCallback((a: string, op: string, b: string): string => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        switch (op) {
            case '+':
                return String(numA + numB);
            case '−':
                return String(numA - numB);
            case '×':
                return String(numA * numB);
            case '÷':
                return numB === 0 ? 'Error' : String(numA / numB);
            default:
                return b;
        }
    }, []);

    const formatDisplay = (val: string) => {
        if (val === 'Error') return 'Error';
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        if (val.includes('.') && !val.endsWith('.')) {
            const parts = val.split('.');
            const intPart = Number(parts[0]).toLocaleString('en-US');
            return `${intPart}.${parts[1]}`;
        }
        if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(4);
        }
        return num.toLocaleString('en-US');
    };

    const handleButton = (label: string) => {
        if (label === 'AC') {
            setDisplay('0');
            setPrevValue(null);
            setOperator(null);
            setWaitingForOperand(false);
            setJustCalculated(false);
            return;
        }

        if (label === '+/-') {
            setDisplay((d) => String(parseFloat(d) * -1));
            return;
        }

        if (label === '%') {
            setDisplay((d) => String(parseFloat(d) / 100));
            return;
        }

        if (operators.includes(label)) {
            if (prevValue !== null && operator && !waitingForOperand) {
                const result = calculate(prevValue, operator, display);
                setDisplay(result);
                setPrevValue(result);
            } else {
                setPrevValue(display);
            }
            setOperator(label);
            setWaitingForOperand(true);
            setJustCalculated(false);
            return;
        }

        if (label === '=') {
            if (operator && prevValue !== null) {
                const result = calculate(prevValue, operator, display);
                setDisplay(result);
                setPrevValue(null);
                setOperator(null);
                setWaitingForOperand(false);
                setJustCalculated(true);
            }
            return;
        }

        if (label === '.') {
            if (waitingForOperand) {
                setDisplay('0.');
                setWaitingForOperand(false);
                return;
            }
            if (!display.includes('.')) {
                setDisplay((d) => d + '.');
            }
            return;
        }

        // digit
        if (waitingForOperand || justCalculated) {
            setDisplay(label);
            setWaitingForOperand(false);
            setJustCalculated(false);
        } else {
            setDisplay((d) => (d === '0' ? label : d.length < 12 ? d + label : d));
        }
    };

    const displayFontSize = display.replace(/[,]/g, '').length > 9 ? '2rem' : display.replace(/[,]/g, '').length > 6 ? '2.8rem' : '3.8rem';

    return (
        <>
            <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
                {/* Calculator Popup */}
                {open && (
                    <div
                        className="w-[280px] rounded-[24px] border border-black/[0.08] bg-[#f2f2f7] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] select-none dark:border-white/[0.07] dark:bg-[#1c1c1e] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                    >
                        {/* Display */}
                        <div className="flex min-h-[80px] flex-col justify-end px-2 pt-2 pb-3 text-right">
                            {operator && prevValue && (
                                <div className="mb-0.5 text-[13px] font-light text-black/35 dark:text-white/35">
                                    {formatDisplay(prevValue)} {operator}
                                </div>
                            )}
                            <div
                                className="leading-none font-light tracking-tight text-black transition-all duration-150 dark:text-white"
                                style={{ fontSize: displayFontSize }}
                            >
                                {formatDisplay(display)}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-4 gap-[10px]">
                            {BUTTONS.flatMap((row) =>
                                row.map((label) => {
                                    const isOperator = operators.includes(label);
                                    const isTop = ['AC', '+/-', '%'].includes(label);
                                    const isZero = label === '0';
                                    const isActiveOperator = isOperator && operator === label && waitingForOperand;

                                    return (
                                        <button
                                            key={label}
                                            onClick={() => handleButton(label)}
                                            className={[
                                                'flex h-[58px] cursor-pointer items-center rounded-full border-none transition-[opacity,transform] duration-[80ms]',
                                                isZero ? 'col-span-2 justify-start pl-[22px]' : 'col-span-1 justify-center',
                                                isOperator
                                                    ? isActiveOperator
                                                        ? 'bg-white text-[#ff9f0a]'
                                                        : 'bg-[#ff9f0a] text-white'
                                                    : isTop
                                                      ? 'bg-[#c7c7cc] text-black dark:bg-[#636366] dark:text-white'
                                                      : 'bg-white text-black dark:bg-[#333336] dark:text-white',
                                                isTop ? 'text-base font-normal' : 'text-[22px] font-light',
                                            ].join(' ')}
                                            onMouseDown={(e) => {
                                                e.currentTarget.style.opacity = '0.75';
                                                e.currentTarget.style.transform = 'scale(0.95)';
                                            }}
                                            onMouseUp={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            {label}
                                        </button>
                                    );
                                }),
                            )}
                        </div>
                    </div>
                )}

                {/* Trigger Button */}
                <Button
                    onClick={() => setOpen((o) => !o)}
                    size="icon"
                    aria-label="Toggle Calculator"
                    className="h-12 w-12 rounded-full border-none text-white shadow-lg transition-all duration-200"
                    style={{
                        background: open ? '#ff9f0a' : undefined,
                        transform: open ? 'rotate(15deg) scale(1.05)' : 'rotate(0deg)',
                    }}
                >
                    <Calculator style={{ width: "25px", height: "25px" }} />
                </Button>
            </div>
        </>
    );
}
