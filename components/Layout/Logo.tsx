import Link from "next/link";

export default function Logo() {
  return (
    <div className="cursor:pointer">
      <Link href='/'>
        <p className="text-xl font-bold text-slate-50">ALCANTARA</p>
        <p className="text-sm text-slate-400 text-center">cross chain swap</p>
      </Link>
    </div>
  )
}
