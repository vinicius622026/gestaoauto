import React from "react";

type FormContainerProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  asForm?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
};

export default function FormContainer({
  title,
  subtitle,
  children,
  className,
  asForm = false,
  onSubmit,
}: FormContainerProps) {
  const Container: any = asForm ? "form" : "div";

  return (
    <Container
      onSubmit={onSubmit}
      className={`max-w-md w-full mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow ${
        className ?? ""
      }`}
    >
      {title && <h2 className="text-2xl font-semibold mb-1">{title}</h2>}
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      )}

      <div className="space-y-4">{children}</div>
    </Container>
  );
}
