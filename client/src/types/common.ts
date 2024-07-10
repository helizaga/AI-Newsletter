export interface AdminContextType {
  sub: string;
  name: string;
  email: string;
}

interface ContentHistory {
  id: number;
  content: string;
  createdAt: Date;
}


export interface Newsletter {
  id: number;
  topic: string;
  reason: string;
  searchQuery: string;
  content: string;
  contentHistory?: ContentHistory[]; // Add this line
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface PayloadType {
  [key: string]: any;
}
