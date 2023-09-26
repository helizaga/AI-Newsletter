export interface AdminContextType {
  sub: string;
  name: string;
  email: string;
}

export interface Newsletter {
  id: number;
  topic: string;
  reason: string;
  searchQuery: string;
  content: string;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface PayloadType {
  [key: string]: any;
}
