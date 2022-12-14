import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Notification = {
  title: string;
  description: string;
  type: 'error' | 'success';
}

interface NotificationContextInterface {
  notification: Notification | undefined;
  setNotification: (n: Notification | undefined) => void;
}

const NotificationContext = createContext<NotificationContextInterface | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}
const NotificationProvider = ({ children }: Props) => {
  const [notification, setNotification] = useState<Notification | undefined>(undefined);
  useEffect(() => {
    if (!notification) return;
    const interval = setTimeout(() => setNotification(undefined), 6000);
    return () => clearTimeout(interval);
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotification = () => useContext(NotificationContext)!;

export { NotificationProvider, useNotification };
