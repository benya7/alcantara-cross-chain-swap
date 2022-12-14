import { useRef, useState } from "react";

export default function useList<T = string>() {
  //const [list, setList] = useState<T[]>(defaultValue);
  const list = useRef<T[]>()

  const setList = (newValue: T[] | undefined) => {
    list.current = newValue;
  }

  const addItem = (item: T) => {
    if (item in list) {
      console.log("in list", item)
      return
    }
    list.current?.push(item)
  };

  const removeItem = (item: T) => {
    const filteredList = list.current?.filter((i) => i !== item);
    if (filteredList)
    setList(filteredList);
  };

  const clear = () => setList(undefined);

  return { list, addItem, removeItem, clear, setList };
}
