import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-[#08101c] text-slate-100" dir="rtl">
          <div className="flex flex-col items-center w-full max-w-xl p-8 rounded-3xl border border-white/10 bg-[#0d1a2a] shadow-2xl text-center">
            <div className="h-16 w-16 rounded-2xl bg-amber-400/10 grid place-items-center mb-6 text-amber-300">
              <AlertTriangle size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-3 text-white">حدث خطأ غير متوقع أثناء عرض الصفحة</h2>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              تم احتواء الخطأ بنجاح للحفاظ على أمان بياناتك وجلستك. يمكنك إعادة تحميل الصفحة أو العودة للصفحة الرئيسية.
            </p>

            {this.state.error?.message && (
              <div className="p-3 w-full rounded-xl bg-black/40 border border-white/5 overflow-auto mb-6 text-left" dir="ltr">
                <p className="text-xs text-slate-400 font-mono">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-300 text-[#07131d] font-bold text-sm hover:bg-emerald-200 transition cursor-pointer"
              >
                <RotateCcw size={16} />
                إعادة التحميل
              </button>

              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition cursor-pointer"
              >
                <Home size={16} />
                الرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

