'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, CheckCircle } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTodo ? `/api/todos/${editingTodo.id}` : '/api/todos';
      const method = editingTodo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTodos();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM'
    });
    setEditingTodo(null);
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority
    });
    setIsDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application TODO</h1>
            <p className="text-gray-600 mt-2">Gérez vos tâches efficacement</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTodo ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Entrez le titre de la tâche"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Entrez la description de la tâche"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select value={formData.priority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Basse</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="HIGH">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingTodo ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {todos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
                <p className="text-gray-600 text-center mb-4">
                  Commencez par créer votre première tâche en cliquant sur le bouton "Nouvelle tâche"
                </p>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.id} className={`transition-all duration-200 ${todo.completed ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.title}
                        </CardTitle>
                        {todo.description && (
                          <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getPriorityColor(todo.priority)} text-white`}>
                        {todo.priority === 'HIGH' ? 'Haute' : todo.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(todo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-500">
                    Créé le {new Date(todo.createdAt).toLocaleDateString('fr-FR')} à {new Date(todo.createdAt).toLocaleTimeString('fr-FR')}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}