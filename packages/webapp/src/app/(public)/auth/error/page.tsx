import Link from "next/link";

export default function ErrorPage({ searchParams }: { searchParams: any }) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="border border-foreground-error p-12 rounded bg-foreground-error/10 shadow mx-12 max-w-4xl">
        <h1 className="text-2xl font-bold text-center text-foreground-error pb-12">Authorization Error</h1>
        <p className="text-center pb-4">{searchParams.error}</p>

        <div className="flex flex-row justify-center gap-4 pt-4 border-t border-foreground-error/50">
          <Link href="/signin" className="text-center text-primary underline block">
            Sign In
          </Link>
          <Link href="/signup" className="text-center text-primary underline block">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
