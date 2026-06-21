// ============================================================
// Error Boundary — catches any unexpected crash in the app
// and shows a friendly message instead of a blank white page
// ============================================================

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            ⚠️ Something went wrong
          </h1>
          <p style={{ color: "#888", marginBottom: "1rem", maxWidth: "400px" }}>
            Your trade data is safe in Google Sheets. This is just a display error.
            Try refreshing the page below.
          </p>
          <p style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
            Error: {this.state.errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "0.5rem",
              background: "#16a34a",
              color: "white",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
