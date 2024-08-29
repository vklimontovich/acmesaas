import { PropsWithChildren } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const LegalPage: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col gap-4 items-center py-6 px-4">
      <Link href="/" className="flex items-center gap-2 text-lg text-primary">
        <ArrowLeft /> Home
      </Link>
      <article className="prose max-w-4xl border-b border-t py-6">{children}</article>
      <Link href="/" className="flex items-center gap-2 text-lg text-primary">
        <ArrowLeft /> Home
      </Link>
    </div>
  );
};
