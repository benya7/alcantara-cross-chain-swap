import { HiOutlineExternalLink } from "react-icons/hi"

interface Props {
  url: string
}

export default function ViewInExplorerButton({ url }: Props) {
  return (
    <a href={url} target='_blank'>
      <div className="flex items-center justify-center bg-blue-600 w-11/12 mx-auto hover:bg-blue-500 delay-150 rounded-xl py-2 mt-2">
        <p className="">View in Explorer</p>
        <HiOutlineExternalLink className='h-5 w-5 ml-2' />
      </div>
    </a >
  )
}
