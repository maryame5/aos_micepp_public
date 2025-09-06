export enum RequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface ServiceRequest {
  id: number;
  userId: string;
  serviceId: string;
  title: string;
  description: string;
  status: RequestStatus;
  documents: Document[];
  documentReponse?: Document; // Added for admin response document
  commentaire?: string;
  createdAt: Date;
  dueDate?: Date;
  assignedTo?: string;
  // Additional fields for comprehensive display
  utilisateurNom?: string;
  utilisateurEmail?: string;
  serviceNom?: string;
  assignedToUsername?: string;
  lastModifiedDate?: Date;
  serviceData?: {
    serviceType?: string;
    serviceName?: string;
    serviceTitle?: string;
    serviceDescription?: string;
    serviceFeatures?: string[];
    formFields?: any[];
    specificData?: any;
  };
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