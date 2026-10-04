import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  readOnly?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'c',
  showLineNumbers = true,
  maxHeight = 'max-h-96',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-900 text-navy-text overflow-hidden font-mono text-xs shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-navy-800/80 border-b border-navy-700/60 text-line-strong">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {language}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-line-strong hover:text-white hover:bg-navy-700 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-success-accent" />
              <span className="text-success-accent">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className={`overflow-x-auto overflow-y-auto p-3 ${maxHeight}`}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-navy-800/40">
                {showLineNumbers && (
                  <td className="w-8 select-none pr-3 text-right text-ink-muted font-mono text-[11px] tabular-nums align-top">
                    {idx + 1}
                  </td>
                )}
                <td className="whitespace-pre font-mono text-xs text-line leading-relaxed">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
