import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type AuthInputProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  name?: string;
};

export function AuthInput({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  error,
  name,
}: AuthInputProps) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const inputType = type === "password" ? (showPass ? "text" : "password") : type;
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 28 }}>
      <label
        style={{
          display:       "block",
          marginBottom:  10,
          fontFamily:    "'Space Mono', monospace",
          fontSize:      10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         "rgba(13,31,22,.45)",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          style={{
            width:        "100%",
            background:   "transparent",
            border:       "none",
            borderBottom: `1.5px solid ${focused ? "transparent" : "rgba(13,31,22,.12)"}`,
            color:        "#0d1f16",
            fontFamily:   "'DM Sans', sans-serif",
            fontSize:     15,
            fontWeight:   400,
            padding:      `12px ${isPassword ? "36px" : "0"} 12px 0`,
            outline:      "none",
            caretColor:   "#2d8a5e",
            opacity:      disabled ? 0.5 : 1,
            cursor:       disabled ? "not-allowed" : "text",
            transition:   "border-color .3s",
          }}
        />

        {/* Animated focus underline */}
        <div
          style={{
            position:   "absolute",
            bottom:     0,
            left:       0,
            height:     1.5,
            width:      focused ? "100%" : "0%",
            background: "linear-gradient(90deg, #1e5e3e, #2d8a5e)",
            transition: "width 0.45s cubic-bezier(.16,1,.3,1)",
            pointerEvents: "none",
          }}
        />

        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPass((s) => !s)}
            style={{
              position:   "absolute",
              right:      0,
              top:        "50%",
              transform:  "translateY(-50%)",
              background: "none",
              border:     "none",
              cursor:     "pointer",
              color:      "rgba(13,31,22,.45)",
              padding:    4,
              lineHeight: 0,
              transition: "color .2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1e5e3e")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(13,31,22,.45)")}
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: "#d93025", fontSize: 12, marginTop: 5 }}>
          {error}
        </p>
      )}
    </div>
  );
}
