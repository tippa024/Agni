// Simple Knowledge Point interface
export interface KnowledgePoint {
  // Core identity
  id: string;
  name: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  type: 'concept' | 'person' | 'place' | 'event' | 'process' | 'theory' | 'tool' | 'organization' | 'other';
  tags: string[];
  
  // Content
  description: string;
  content: string;
  context?: string[];
  
  // Relationships
  links: string[];
  parentId?: string;
  childIds?: string[];
  
  // Optional fields that can be added later
  status?: 'draft' | 'reviewed' | 'verified' | 'archived';
  version?: number;
  lastAccessedAt?: string;
  accessCount?: number;
  confidence?: number; // 0-1
}
