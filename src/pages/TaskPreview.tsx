
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import { ChevronLeft, Printer, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Mock data for tasks
const mockTasks = [
  {
    id: 1,
    title: "Complete project proposal",
    details: "Finish the proposal for the new client project",
    date: "2023-12-15",
    priority: "high",
  },
  {
    id: 2,
    title: "Weekly team meeting",
    details: "Discuss progress and blockers with the team",
    date: "2023-12-12",
    priority: "medium",
  },
  {
    id: 3,
    title: "Update documentation",
    details: "Update the API documentation with recent changes",
    date: "2023-12-18",
    priority: "low",
  },
  {
    id: 4,
    title: "Client call",
    details: "Follow up call with the client about project requirements",
    date: "2023-12-14",
    priority: "high",
  },
];

const TaskPreview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Task List",
  });

  const filteredTasks = mockTasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="container mx-auto px-4 py-6"
    >
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Task List</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div ref={printRef} className="space-y-4 mt-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No tasks found. Try a different search term.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{task.title}</h3>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{task.details}</p>
              <div className="text-xs text-muted-foreground">
                Due: {new Date(task.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default TaskPreview;
