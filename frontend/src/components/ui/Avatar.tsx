import clsx from "clsx";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function Avatar({ nome, size = "md" }: { nome: string; size?: "sm" | "md" | "lg" }) {
  const dimensoes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  }[size];

  return (
    <span className={clsx("avatar", dimensoes)} aria-hidden="true">
      {iniciais(nome)}
    </span>
  );
}
