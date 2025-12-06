import { RouterOutlet } from '@angular/router';
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { DataService, SchemaColumn } from './data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('task-manager-app');
  dataService = inject(DataService);
  
  // State
  currentView = signal<'dashboard' | 'workspace'>('dashboard');
  activeWsId = signal<string | null>(null);
  modalState = signal<{ isOpen: boolean; type: string | null }>({ isOpen: false, type: null });

  // Computed
  activeWs = computed(() => this.dataService.workspaces().find(w => w.id === this.activeWsId()));
  
  activeSchema = computed(() => {
    const id = this.activeWsId();
    return id ? (this.dataService.schemas()[id] || []) : [];
  });

  activeItems = computed(() => {
    const id = this.activeWsId();
    return id ? (this.dataService.items()[id] || []) : [];
  });

  // Form
  dynamicForm = new FormGroup({});

  // Navigation
  navigate(view: 'dashboard' | 'workspace', param: string | null = null) {
    this.currentView.set(view);
    this.activeWsId.set(param);
  }

  // Modals
  openModal(type: string) {
    if (type === 'add-item') this.initDynamicForm();
    this.modalState.set({ isOpen: true, type });
  }

  closeModal() {
    this.modalState.set({ isOpen: false, type: null });
  }

  // Logic
  createWorkspace(title: string, desc: string, theme: any) {
    if (!title) return;
    const id = this.dataService.createWorkspace(title, desc, theme);
    this.closeModal();
    this.navigate('workspace', id);
  }

  initDynamicForm() {
    const group: any = {};
    const schema = this.activeSchema();
    schema.forEach(col => {
      group[col.key] = new FormControl('');
    });
    this.dynamicForm = new FormGroup(group);
  }

  saveNewItem() {
    if (this.dynamicForm.valid && this.activeWsId()) {
      this.dataService.addItem(this.activeWsId()!, this.dynamicForm.value);
      this.closeModal();
    }
  }

  deleteItem(itemId: string) {
    if (confirm('למחוק פריט זה?')) {
      this.dataService.deleteItem(this.activeWsId()!, itemId);
    }
  }

  addColumn(label: string, type: any) {
    if (!label || !this.activeWsId()) return;
    const key = 'col_' + Date.now();
    const newCol: SchemaColumn = { 
      key, 
      label, 
      type, 
      options: type === 'select' || type === 'status' ? ['אופציה 1', 'אופציה 2'] : undefined 
    };
    this.dataService.addColumn(this.activeWsId()!, newCol);
    this.closeModal();
  }

  // Helpers (UI)
  getThemeClass(theme: string) {
    const map: any = {
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-emerald-100 text-emerald-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return map[theme] || map.blue;
  }

  getStatusClass(status: string) {
    if (status === 'done' || status === 'בוצע') return 'px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700';
    if (status === 'pending' || status === 'ממתין') return 'px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700';
    return 'px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700';
  }

  getIcon(type: string) {
    const icons: any = {
      text: '<i class="fas fa-font opacity-50"></i>',
      number: '<i class="fas fa-hashtag opacity-50"></i>',
      date: '<i class="far fa-calendar opacity-50"></i>',
      select: '<i class="fas fa-list opacity-50"></i>',
      status: '<i class="fas fa-check-square opacity-50"></i>'
    };
    return icons[type] || '';
  }
}