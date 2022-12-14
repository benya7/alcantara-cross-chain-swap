import Logo from "./Logo";

export default function Footer() {
  return (
    <div className="bg-gray-900">
      <div className="flex p-4 h-32 border-t justify-around">
        <div className="flex-none">
          <Logo />
        </div>
        <div className='flex-1 flex justify-center gap-20'>
          <div>
            <p className="text-xl font-semibold slate-50 mb-2 text-slate-50">Support</p>
            <div className="text-sm text-slate-400 hover:text-slate-200">
              <a href="#" target='_blank'>
                <p>Help Center</p>
              </a>
              <a href="#" target='_blank'>
                <p>Bug Report</p>
              </a>
            </div>
          </div>
          <div>
            <p className="text-xl font-semibold slate-50 mb-2 text-slate-50">Community</p>
            <div className="text-sm text-slate-400 hover:text-slate-200">
              <a href="#" target='_blank'>
                <p>Twitter</p>
              </a>
              <a href="#" target='_blank'>
                <p>Discord</p>
              </a>
              <a href="#" target='_blank'>
                <p>Reddit</p>
              </a>
            </div>
          </div>
        </div>
        
      </div>
      <div className="flex justify-between py-2 px-4 text-slate-400 hover:text-slate-200 text-sm">
        <p>© 2022 All Rights Reserved.</p>
        <a href="https://github.com/en0c-026" target='_blank'>
          <p>by en0c-026</p>
        </a>
      </div>
    </div>
  )
}
