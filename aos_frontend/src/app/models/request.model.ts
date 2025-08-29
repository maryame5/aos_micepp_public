export interface ServiceRequest {
  id: number;
  userId: string;
  serviceId: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  documents: Document[];
  createdAt: Date;
  
  assignedTo?: string;
  comments: Comment[];
  dueDate?: Date;
  
  // ✅ Nouvelles propriétés pour les données du service
  serviceData?: {
    serviceType?: string;
    serviceName?: string;
    serviceTitle?: string;
    serviceDescription?: string;
    serviceFeatures?: string[];
    formFields?: FormField[];
    specificData?: { [key: string]: any }; // Données spécifiques saisies par l'utilisateur
  };
}

export enum RequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum RequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  path?: string; // ✅ Chemin pour le téléchargement
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  formFields: FormField[];
  requiredDocuments: string[];
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: any;
}