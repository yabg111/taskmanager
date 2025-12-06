import { Injectable, signal, computed } from '@angular/core';

export interface SchemaColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'status';
  options?: string[];
}

export interface Workspace {
  id: string;
  title: string;
  description: string;
  theme: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // רשימת המרחבים
  workspaces = signal<Workspace[]>([
    { id: '1', title: 'פרויקט גמר', description: 'ניהול משימות לפרויקט', theme: 'purple', icon: 'fa-graduation-cap' }
  ]);

  // מפות שמחזיקות את המבנה והמידע לכל מרחב (לפי ID)
  schemas = signal<Record<string, SchemaColumn[]>>({
    '1': [
      { key: 'title', label: 'שם המשימה', type: 'text' },
      { key: 'status', label: 'סטטוס', type: 'status', options: ['ממתין', 'בוצע', 'בתהליך'] },
      { key: 'due_date', label: 'תאריך יעד', type: 'date' }
    ]
  });

  items = signal<Record<string, any[]>>({
    '1': [
      { id: '101', title: 'עיצוב ראשוני', status: 'done', due_date: '2025-01-01' },
      { id: '102', title: 'פיתוח דאטה בייס', status: 'pending', due_date: '2025-01-15' }
    ]
  });

  createWorkspace(title: string, description: string, theme: string) {
    const newId = Date.now().toString();
    const newWs: Workspace = { id: newId, title, description, theme, icon: 'fa-briefcase' };
    
    // עדכון הסיגנלים
    this.workspaces.update(list => [...list, newWs]);
    this.schemas.update(map => ({ ...map, [newId]: [{ key: 'name', label: 'שם', type: 'text' }] }));
    this.items.update(map => ({ ...map, [newId]: [] }));
    
    return newId;
  }

  addItem(wsId: string, itemData: any) {
    const newItem = { id: Date.now().toString(), ...itemData };
    this.items.update(map => ({
      ...map,
      [wsId]: [...(map[wsId] || []), newItem]
    }));
  }

  deleteItem(wsId: string, itemId: string) {
    this.items.update(map => ({
      ...map,
      [wsId]: map[wsId].filter(i => i.id !== itemId)
    }));
  }

  addColumn(wsId: string, column: SchemaColumn) {
    this.schemas.update(map => ({
      ...map,
      [wsId]: [...(map[wsId] || []), column]
    }));
  }
}