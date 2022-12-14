import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./Logo";

export default function Navbar() {
  const router = useRouter()
  return (
    <div className="flex bg-slate-900 py-3 px-5 h-16 sticky">
      <div className="flex items-center w-full">
        <Logo />
        <div className="flex-1 flex justify-center">
          {
            router.pathname === '/' ? (
              <Link href='/app'>
                <div className="hover:bg-slate-700 delay-200 py-1 px-2 rounded">
                  <p className="text-slate-50 font-medium">Cross-Chain Swap</p>
                </div>
              </Link>
            ) : (
              null
            )
          }
        </div>
      </div>
    </div>
  )
}
