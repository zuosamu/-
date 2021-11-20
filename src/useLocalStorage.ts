/*
 * @Author: 左森君
 * @Date: 2021-11-20 18:27:23
 * @LastEditors: 左森君
 * @LastEditTime: 2021-11-20 18:36:10
 * @FilePath: /dakeai/src/useLocalStorage.ts
 */
import { useState } from "react"
 const useLocalStorage = (key: string,initialValue: any)=>{
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  const setValue = (value: (arg0: any) => any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue];
}
export default useLocalStorage;
