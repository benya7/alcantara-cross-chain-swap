import { useState } from "react";

export default function useTextInput() {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | undefined>(undefined);

  return { inputValue, inputError, setInputValue, setInputError };
}
