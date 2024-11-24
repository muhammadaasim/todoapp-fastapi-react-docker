import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  CheckCircle2,
  Circle,
  Clock,
  GripVertical,
  Plus,
  RefreshCw,
  Trash2,
  Star,
} from "lucide-react";
import axios from "axios";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    content: "",
    status: "pending",
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/todos/");
      const sortedTodos = response.data.sort((a, b) => a.position - b.position);
      setTodos(sortedTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title.trim()) return;

    try {
      const position = todos.length;
      const response = await axios.post("http://127.0.0.1:8000/todos/", {
        ...newTodo,
        position,
      });
      setTodos([...todos, response.data]);
      setNewTodo({ title: "", content: "", status: "pending" });
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const updateTodo = async (id, updatedData) => {
    try {
      await axios.put(`http://127.0.0.1:8000/todos/${id}`, updatedData);
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over.id);
      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);

      // Update positions for all affected todos
      newTodos.forEach((todo, index) => {
        if (todo.position !== index) {
          updateTodo(todo.id, { position: index });
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      createTodo();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto p-6 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tasks Manager
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, title: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTodo.content}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, content: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                onClick={createTodo}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          </div>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={todos}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {todos.map((todo) => (
                  <SortableItem
                    key={todo.id}
                    id={todo.id}
                    todo={todo}
                    updateTodo={updateTodo}
                    deleteTodo={deleteTodo}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </DndProvider>
  );
};

const SortableItem = ({ id, todo, updateTodo, deleteTodo }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleStatus = () => {
    const statusOrder = ["pending", "in-progress", "completed", "excellent"];
    const currentIndex = statusOrder.indexOf(todo.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateTodo(id, { status: nextStatus });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return <Star className="text-purple-500" />;
      case "completed":
        return <CheckCircle2 className="text-green-500" />;
      case "in-progress":
        return <Clock className="text-yellow-500" />;
      default:
        return <Circle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "completed":
        return "bg-green-50 text-green-600 border-green-200";
      case "in-progress":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="p-4 flex items-start gap-4">
        <button
          {...listeners}
          className="mt-1 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity cursor-grab"
        >
          <GripVertical size={20} />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {todo.title}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleStatus}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(
                  todo.status
                )}`}
              >
                {getStatusIcon(todo.status)}
                <span className="capitalize">{todo.status}</span>
                <RefreshCw size={14} className="ml-1" />
              </button>
              <button
                onClick={() => deleteTodo(id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {todo.content && (
            <p className="text-gray-600 text-sm">{todo.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
