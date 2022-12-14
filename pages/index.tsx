import Link from "next/link";

export default function Home() {
  return (
    <div className='min-h-screen bg-black text-slate-100'>
      <div className="flex flex-col items-center justify-center space-y-10 h-[26rem] bg-gradient-to-b from-slate-900 to-black">

        <p className="text-2xl sm:text-3xl font-semibold text-center">Exchange your tokens across networks.</p>
        <Link href='/app'>
        <button className="px-4 py-2 bg-blue-500 hover:cursor-pointer font-medium hover:bg-blue-400 rounded-xl">Launch dApp</button>
        </Link>
      </div>
    </div>
  )
}
